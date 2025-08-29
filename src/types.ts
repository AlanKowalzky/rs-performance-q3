export interface YearData {
  year: number;
  population: number;
  co2: number;
  co2_per_capita: number;
  [key: string]: number | undefined;
}

export interface CountryData {
  name: string;
  iso_code?: string;
  data: YearData[];
}

export type CO2Data = Record<string, CountryData>;