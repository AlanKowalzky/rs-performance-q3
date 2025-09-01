import React, { Suspense, useState, useMemo, useEffect, useTransition } from 'react';
import './App.css';
import { useSuspenseData } from './hooks/useData';
import Spinner from './components/Spinner';
import { CountryData } from './types';
import { ColumnSelectorModal } from './components/ColumnSelectorModal';
import CountryListItem from './components/CountryListItem';

const getPopulationForYear = (country: CountryData, year: number | null): number | 'N/A' => {
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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>({ key: 'name', direction: 'ascending' });
  const [selectedYear, setSelectedYear] = useState<number | null>(2023);
  const [highlight, setHighlight] = useState(false);
  const [regionFilter, setRegionFilter] = useState('All');
  const [isPending, startTransition] = useTransition();
  const [expandedCountryCode, setExpandedCountryCode] = useState<string | null>(null);

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
    if (highlight) {
      const timer = setTimeout(() => setHighlight(false), 500);
      return () => clearTimeout(timer);
    }
  }, [highlight]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(() => {
      setSelectedYear(parseInt(e.target.value, 10));
    });
    setHighlight(true);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(() => {
      setRegionFilter(e.target.value);
    });
  };

  const availableColumns = useMemo(() => {
    if (!countriesData) return [];
    const firstCountry = Object.values(countriesData)[0];
    if (!firstCountry || !firstCountry.data || firstCountry.data.length === 0) {
      return [];
    }
    return Object.keys(firstCountry.data[0]);
  }, [countriesData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    startTransition(() => {
      setSearchQuery(e.target.value);
    });
  };

  const handleSort = (key: string) => {
    startTransition(() => {
      setSortConfig(prevSortConfig => {
        const direction = (prevSortConfig?.key === key && prevSortConfig.direction === 'ascending') ? 'descending' : 'ascending';
        return { key, direction };
      });
    });
  };

  const handleToggleExpand = (countryCode: string) => {
    setExpandedCountryCode(prev => prev === countryCode ? null : countryCode);
  };

  // Memoization Chain Step 1: Expensive data processing
  const processedCountries = useMemo(() => {
    // The raw data from OWID uses the key as the region name, and has a `country` property for countries.
    // We need to normalize this into a consistent `name` property for the rest of the app.
    return Object.entries(countriesData).map(([key, value], index) => {
      // For regions, `value.country` is undefined, so we use the key (e.g., "Asia").
      // For countries, `value.country` is the name (e.g., "Poland").
      const name = (value as any).country || key;
      
      const countryWithData = {
        ...value,
        name: name,
      };

      return {
        ...countryWithData,
        code: value.iso_code || name || `country-${index}`,
        populationForYear: getPopulationForYear(countryWithData, selectedYear),
      };
    });
  }, [countriesData, selectedYear]);

  // Memoization Chain Step 2: Filtering
  const filteredCountries = useMemo(() => {
    let tempCountries = processedCountries;

    if (regionFilter !== 'All') {
      tempCountries = tempCountries.filter(country => {
        if (regionFilter === 'Countries') return !!country.iso_code;
        if (regionFilter === 'Regions') return !country.iso_code;
        return true;
      });
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      tempCountries = tempCountries.filter(country =>
        (country.name || '').toLowerCase().includes(lowercasedQuery) ||
        (country.iso_code || '').toLowerCase().includes(lowercasedQuery)
      );
    }

    return tempCountries;
  }, [processedCountries, regionFilter, searchQuery]);

  // Memoization Chain Step 3: Sorting (cheap)
  const filteredAndSortedCountries = useMemo(() => {
    const tempCountries = [...filteredCountries]; // Create a new array for sorting
    if (sortConfig !== null) {
      tempCountries.sort((a, b) => {
        let aCompare: string | number = '';
        let bCompare: string | number = '';

        if (sortConfig.key === 'name') {
          aCompare = a.name || '';
          bCompare = b.name || '';
        } else if (sortConfig.key === 'population') {
          aCompare = typeof a.populationForYear === 'number' ? a.populationForYear : -1;
          bCompare = typeof b.populationForYear === 'number' ? b.populationForYear : -1;
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
    return tempCountries;
  }, [filteredCountries, sortConfig]);

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

      <div className="list-container">
        {isPending && <div className="spinner-overlay"><Spinner /></div>}
        <ul className="country-list" style={{ opacity: isPending ? 0.6 : 1 }}>
          {filteredAndSortedCountries.map((country) => (
            <CountryListItem 
              key={country.code}
              countryCode={country.code}
              countryData={country}
              selectedYear={selectedYear}
              highlight={highlight}
              getPopulationForYear={getPopulationForYear}
              selectedColumns={selectedColumns}
              isExpanded={expandedCountryCode === country.code}
              onToggleExpand={() => handleToggleExpand(country.code)}
            />
          ))}
        </ul>
      </div>
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