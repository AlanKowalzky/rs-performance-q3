import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { useSuspenseData } from './hooks/useData';
import { CO2Data } from './types';

jest.mock('./hooks/useData');

const mockedUseSuspenseData = useSuspenseData as jest.Mock;

describe('App', () => {
  test('renders loading spinner initially', () => {
    mockedUseSuspenseData.mockImplementation(() => {
      throw new Promise(() => {}); // Simulate loading by throwing a promise
    });

    render(<App />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test('renders country list when data is loaded', async () => {
    const mockData: CO2Data = {
      USA: {
        iso_code: 'USA',
        name: 'United States',
        data: [{ year: 2022, population: 333287557, co2: 5000, co2_per_capita: 15 }],
      },
      CAN: {
        iso_code: 'CAN',
        name: 'Canada',
        data: [{ year: 2022, population: 38246108, co2: 600, co2_per_capita: 15.7 }],
      },
    };

    mockedUseSuspenseData.mockReturnValue(mockData);

    render(<App />);

    expect(await screen.findByText(/United States/i)).toBeInTheDocument();
    expect(await screen.findByText(/Canada/i)).toBeInTheDocument();
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
  });

  test('filters countries based on search query', async () => {
    const mockData: CO2Data = {
      USA: {
        iso_code: 'USA',
        name: 'United States',
        data: [{ year: 2022, population: 333287557, co2: 5000, co2_per_capita: 15 }],
      },
      CAN: {
        iso_code: 'CAN',
        name: 'Canada',
        data: [{ year: 2022, population: 38246108, co2: 600, co2_per_capita: 15.7 }],
      },
    };

    mockedUseSuspenseData.mockReturnValue(mockData);

    render(<App />);

    // Wait for initial render
    expect(await screen.findByText(/United States/i)).toBeInTheDocument();
    expect(await screen.findByText(/Canada/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search by country name/i);
    fireEvent.change(searchInput, { target: { value: 'Canada' } });

    expect(await screen.findByText(/Canada/i)).toBeInTheDocument();
    expect(screen.queryByText(/United States/i)).not.toBeInTheDocument();
  });

  test('sorts countries by name', async () => {
    const mockData: CO2Data = {
      ZWE: { iso_code: 'ZWE', name: 'Zimbabwe', data: [] },
      USA: { iso_code: 'USA', name: 'United States', data: [] },
      CAN: { iso_code: 'CAN', name: 'Canada', data: [] },
    };
    mockedUseSuspenseData.mockReturnValue(mockData);

    render(<App />);

    const sortByNameButton = screen.getByRole('button', { name: /Sort by Name/i });

    // Initial order should be Canada, United States, Zimbabwe (based on default sort)
    let countryNames = await screen.findAllByRole('heading', { level: 3 });
    expect(countryNames[0]).toHaveTextContent(/Canada/);
    expect(countryNames[1]).toHaveTextContent(/United States/);
    expect(countryNames[2]).toHaveTextContent(/Zimbabwe/);

    // Click to sort descending
    fireEvent.click(sortByNameButton);
    
    countryNames = await screen.findAllByRole('heading', { level: 3 });
    expect(countryNames[0]).toHaveTextContent(/Zimbabwe/);
    expect(countryNames[1]).toHaveTextContent(/United States/);
    expect(countryNames[2]).toHaveTextContent(/Canada/);

    // Click to sort ascending again
    fireEvent.click(sortByNameButton);

    countryNames = await screen.findAllByRole('heading', { level: 3 });
    expect(countryNames[0]).toHaveTextContent(/Canada/);
    expect(countryNames[1]).toHaveTextContent(/United States/);
    expect(countryNames[2]).toHaveTextContent(/Zimbabwe/);
  });

  test('sorts countries by population', async () => {
    const mockData: CO2Data = {
      // China: High population
      CHN: { iso_code: 'CHN', name: 'China', data: [{ year: 2022, population: 1425893465, co2: 0, co2_per_capita: 0 }] },
      // India: Higher population
      IND: { iso_code: 'IND', name: 'India', data: [{ year: 2022, population: 1428627663, co2: 0, co2_per_capita: 0 }] },
      // USA: Lower population
      USA: { iso_code: 'USA', name: 'United States', data: [{ year: 2022, population: 333287557, co2: 0, co2_per_capita: 0 }] },
    };
    mockedUseSuspenseData.mockReturnValue(mockData);

    render(<App />);
    
    // Wait for initial render (sorted by name by default)
    let countryNames = await screen.findAllByRole('heading', { level: 3 });
    expect(countryNames[0]).toHaveTextContent(/China/);
    expect(countryNames[1]).toHaveTextContent(/India/);
    expect(countryNames[2]).toHaveTextContent(/United States/);

    const sortByPopulationButton = screen.getByRole('button', { name: /Sort by Population/i });

    // Click to sort by population ascending
    fireEvent.click(sortByPopulationButton);

    countryNames = await screen.findAllByRole('heading', { level: 3 });
    expect(countryNames[0]).toHaveTextContent(/United States/); // lowest pop
    expect(countryNames[1]).toHaveTextContent(/China/);
    expect(countryNames[2]).toHaveTextContent(/India/); // highest pop

    // Click to sort by population descending
    fireEvent.click(sortByPopulationButton);

    countryNames = await screen.findAllByRole('heading', { level: 3 });
    expect(countryNames[0]).toHaveTextContent(/India/); // highest pop
    expect(countryNames[1]).toHaveTextContent(/China/);
    expect(countryNames[2]).toHaveTextContent(/United States/); // lowest pop
  });
});
