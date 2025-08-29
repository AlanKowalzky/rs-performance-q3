import React, { Suspense, useState, useMemo, useCallback, useEffect } from 'react';
import './App.css';
import { useSuspenseData } from './hooks/useData';
import Spinner from './components/Spinner';
import { CountryData } from './types';
import { ColumnSelectorModal } from './components/ColumnSelectorModal';
import CountryListItem from './components/CountryListItem';

const getPopulationForYear = (country: CountryData, year: number | null) => {
  if (!year || !country.data || country.data.length === 0) {
    return 'N/A';
  }
  const yearData = country.data.find(d => d.year === year);
  return yearData?.population ?? 'N/A';
};

const CountryList = () => {
  const countriesData = useSuspenseData();

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'year',
    'population',
    'co2',
    'co2_per_capita',
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [highlight, setHighlight] = useState(false);
  const [regionFilter, setRegionFilter] = useState('All');

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    Object.values(countriesData).forEach(country => {
      country.data?.forEach(d => {
        if (d.year) years.add(d.year);
      });
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [countriesData]);

  useEffect(() => {
    if (availableYears.length > 0 && selectedYear === null) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);
  
  useEffect(() => {
    if (highlight) {
      const timer = setTimeout(() => setHighlight(false), 500); // Highlight for 500ms
      return () => clearTimeout(timer);
    }
  }, [highlight]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value, 10));
    setHighlight(true);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRegionFilter(e.target.value);
  };

  const availableColumns = useMemo(() => {
    if (!countriesData) return [];
    const firstCountry = Object.values(countriesData)[0];
    if (!firstCountry || !firstCountry.data || firstCountry.data.length === 0) {
      return [];
    }
    return Object.keys(firstCountry.data[0]);
  }, [countriesData]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSort = useCallback((key: string) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const filteredAndSortedCountries = useMemo(() => {
    let countries = Object.entries(countriesData);

    if (regionFilter !== 'All') {
        countries = countries.filter(([_, countryData]) => {
            if (regionFilter === 'Countries') return !!countryData.iso_code;
            if (regionFilter === 'Regions') return !countryData.iso_code;
            return true;
        });
    }

    if (searchQuery) {
      countries = countries.filter(([_, countryData]) =>
        countryData.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortConfig !== null) {
      countries.sort((a, b) => {
        const aVal = a[1];
        const bVal = b[1];

        let aCompare: string | number = '';
        let bCompare: string | number = '';

        if (sortConfig.key === 'name') {
          aCompare = aVal.name;
          bCompare = bVal.name;
        } else if (sortConfig.key === 'population') {
          const aPop = getPopulationForYear(aVal, selectedYear);
          const bPop = getPopulationForYear(bVal, selectedYear);
          aCompare = typeof aPop === 'number' ? aPop : -1;
          bCompare = typeof bPop === 'number' ? bPop : -1;
        }

        if (aCompare < bCompare) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aCompare > bCompare) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return countries;
  }, [countriesData, searchQuery, sortConfig, selectedYear, regionFilter]);

  return (
    <div>
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by country name..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <select onChange={handleYearChange} value={selectedYear ?? ''}>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select onChange={handleRegionChange} value={regionFilter}>
            <option value="All">All</option>
            <option value="Countries">Countries Only</option>
            <option value="Regions">Regions Only</option>
        </select>
        <button onClick={() => handleSort('name')}>
          Sort by Name {sortConfig?.key === 'name' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
        </button>
        <button onClick={() => handleSort('population')}>
          Sort by Population {sortConfig?.key === 'population' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
        </button>
        <button onClick={() => setModalOpen(true)}>Select Columns</button>
      </div>

      <ColumnSelectorModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        availableColumns={availableColumns}
        selectedColumns={selectedColumns}
        onSave={setSelectedColumns}
      />

      <ul className="country-list">
        {filteredAndSortedCountries.map(([countryCode, countryData]) => (
          <CountryListItem 
            key={countryCode}
            countryCode={countryCode}
            countryData={countryData}
            selectedYear={selectedYear}
            highlight={highlight}
            getPopulationForYear={getPopulationForYear}
            selectedColumns={selectedColumns}
          />
        ))}
      </ul>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>CO2 Emissions Data</h1>
      </header>
      <main>
        <Suspense fallback={<Spinner />}>
          <CountryList />
        </Suspense>
      </main>
    </div>
  );
}

export default App;