export interface YearlyData {
  year: number;
  population?: number;
  co2?: number;
  co2_per_capita?: number;
  methane?: number;
  oil_co2?: number;
  temperature_change_from_co2?: number;
  [key: string]: number | undefined;
}

export interface Country {
  country: string;
  iso_code?: string;
  data: YearlyData[];
}

export type CountriesData = {
  [key: string]: Country;
};
