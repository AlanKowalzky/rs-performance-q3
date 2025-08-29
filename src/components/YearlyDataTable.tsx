import React from 'react';
import { YearlyData } from '../types';
import './YearlyDataTable.css';

interface YearlyDataTableProps {
  data: YearlyData[];
  columns: string[];
  highlightedYear?: number;
}

const formatHeader = (header: string) => {
  return header.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export const YearlyDataTable: React.FC<YearlyDataTableProps> = ({ data, columns, highlightedYear }) => {
  if (!data || data.length === 0) {
    return <p>No yearly data available.</p>;
  }

  return (
    <div className="table-container">
      <table className="yearly-data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{formatHeader(col)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((yearlyData) => (
            <tr key={yearlyData.year} className={yearlyData.year === highlightedYear ? 'highlight' : ''}>
              {columns.map((col) => {
                const value = yearlyData[col as keyof YearlyData];
                let displayValue: string | number = 'N/A';
                if (typeof value === 'number') {
                  if (col === 'year') {
                    displayValue = value;
                  } else if (Number.isInteger(value)) {
                    displayValue = value.toLocaleString();
                  } else {
                    displayValue = value.toFixed(3);
                  }
                } else if (value) {
                  displayValue = String(value);
                }
                return <td key={col}>{displayValue}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

