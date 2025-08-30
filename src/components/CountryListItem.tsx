import React from 'react';
import { CountryData } from '../types';
import { YearlyDataTable } from './YearlyDataTable';

interface CountryListItemProps {
  countryCode: string;
  countryData: CountryData;
  selectedYear: number | null;
  highlight: boolean;
  getPopulationForYear: (country: CountryData, year: number | null) => string | number;
  selectedColumns: string[];
}

const CountryListItem: React.FC<CountryListItemProps> = ({
  countryData,
  selectedYear,
  highlight,
  getPopulationForYear,
  selectedColumns,
}) => {
  return (
    <li className={`country-item ${highlight ? 'highlight' : ''}`}>
      <h3>{countryData.name} ({countryData.iso_code || 'N/A'})</h3>
      <p>Population ({selectedYear}): {getPopulationForYear(countryData, selectedYear)?.toLocaleString()}</p>
      <YearlyDataTable data={countryData.data} columns={selectedColumns} highlightedYear={selectedYear ?? undefined} />
    </li>
  );
};

export default React.memo(CountryListItem);