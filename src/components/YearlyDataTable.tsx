import React from 'react';
import { YearData } from '../types';
import './YearlyDataTable.css';

interface YearDataTableProps {
  data: YearData[];
  columns: string[];
  highlightedYear?: number;
}

const formatHeader = (header: string) => {
  return header.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export const YearDataTable: React.FC<YearDataTableProps> = ({ data, columns, highlightedYear }) => {
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
          {data.map((yearData) => (
            <tr key={yearData.year} className={yearData.year === highlightedYear ? 'highlight' : ''}>
              {columns.map((col) => {
                const value = yearData[col as keyof YearData];
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