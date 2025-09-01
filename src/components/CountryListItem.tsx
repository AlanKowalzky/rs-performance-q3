import React, { useMemo } from 'react';
import { CountryData, YearData } from '../types';
import { YearlyDataTable } from './YearlyDataTable';

interface CountryListItemProps {
  countryCode: string;
  countryData: CountryData;
  selectedYear: number | null;
  highlight: boolean;
  getPopulationForYear: (country: CountryData, year: number | null) => string | number;
  selectedColumns: string[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const CountryListItem: React.FC<CountryListItemProps> = ({
  countryData,
  selectedYear,
  highlight,
  getPopulationForYear,
  selectedColumns,
  isExpanded,
  onToggleExpand,
}) => {
  const memoizedTableData = useMemo(() => {
    if (!countryData.data) return [];

    return countryData.data.map(yearData => {
      const newYearData: YearData = {
        year: yearData.year,
        population: yearData.population,
        co2: yearData.co2,
        co2_per_capita: yearData.co2_per_capita,
      };

      selectedColumns.forEach(column => {
        if (!['year', 'population', 'co2', 'co2_per_capita'].includes(column) && yearData[column as keyof typeof yearData] !== undefined) {
          newYearData[column as keyof YearData] = yearData[column as keyof typeof yearData];
        } else if (['year', 'population', 'co2', 'co2_per_capita'].includes(column)) {
          // Ensure required columns are always present, even if they are undefined in original data
          newYearData[column as keyof YearData] = yearData[column as keyof typeof yearData];
        }
      });
      return newYearData;
    });
  }, [countryData.data, selectedColumns]);

  return (
    <li className={`country-item ${highlight ? 'highlight' : ''}`}>
      <div onClick={onToggleExpand} style={{ cursor: 'pointer' }}>
        <h3>{countryData.name} {countryData.iso_code && `(${countryData.iso_code})`}</h3>
        <p>Population ({selectedYear}): {getPopulationForYear(countryData, selectedYear)?.toLocaleString()}</p>
      </div>
      {isExpanded && (
        <YearlyDataTable data={memoizedTableData} columns={selectedColumns} highlightedYear={selectedYear ?? undefined} />
      )}
    </li>
  );
};

export default React.memo(CountryListItem);