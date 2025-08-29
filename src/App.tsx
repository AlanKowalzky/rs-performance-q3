import React, { Suspense, useState, useMemo } from 'react';
import './App.css';
import useData from './hooks/useData';
import { Spinner } from './components/Spinner';
import { CountryData } from './types';
import { YearlyDataTable } from './components/YearlyDataTable';
import { ColumnSelectorModal } from './components/ColumnSelectorModal';

const getLatestPopulation = (country: CountryData) => {
  if (!country.data || country.data.length === 0) {
    return 'N/A';
  }
  for (let i = country.data.length - 1; i >= 0; i--) {
    if (country.data[i].population) {
      return country.data[i].population?.toLocaleString();
    }
  }
  return 'N/A';
};

const CountryList = () => {
  const dataResource = useData();
  const countriesData = dataResource.read();

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'year',
    'population',
    'co2',
    'co2_per_capita',
  ]);

  const availableColumns = useMemo(() => {
    if (!countriesData) return [];
    const firstCountry = Object.values(countriesData)[0];
    if (!firstCountry || !firstCountry.data || firstCountry.data.length === 0) {
      return [];
    }
    return Object.keys(firstCountry.data[0]);
  }, [countriesData]);

  return (
    <div>
      <div className="toolbar">
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
        {Object.entries(countriesData).map(([countryCode, countryData]) => (
          <li key={countryCode} className="country-item">
            <h3>{countryData.name} ({countryData.iso_code || 'N/A'})</h3>
            <p>Population: {getLatestPopulation(countryData)}</p>
            <YearlyDataTable data={countryData.data} columns={selectedColumns} />
          </li>
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
