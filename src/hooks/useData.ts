import { CO2Data } from '../types';

// This function wraps a promise to make it compatible with React Suspense
function wrapPromise<T>(promise: Promise<T>) {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let result: T;
  let error: unknown;

  const suspender = promise.then(
    (r: T) => {
      status = 'success';
      result = r;
    },
    (e: unknown) => {
      status = 'error';
      error = e;
    }
  );

  return {
    read(): T {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw error;
      } else if (status === 'success') {
        return result;
      }
      throw new Error('Unexpected state in wrapPromise');
    },
  };
}

type DataResource = ReturnType<typeof wrapPromise<CO2Data>>;

// Module-level cache for the data resource
let dataResource: DataResource | undefined;

const fetchData = (): DataResource => {
  if (!dataResource) {
    const promise = fetch('https://nyc3.digitaloceanspaces.com/owid-public/data/co2/owid-co2-data.json')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => data as CO2Data)
      .catch(err => {
        console.error("Error fetching or parsing data:", err);
        throw err;
      });
    dataResource = wrapPromise<CO2Data>(promise);
  }
  return dataResource;
};

export const useSuspenseData = (): CO2Data => {
  return fetchData().read();
};

// Add an empty export to ensure this is treated as a module.
export {};