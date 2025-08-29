import { CO2Data } from '../types';

let cachedData: CO2Data | null = null;
let promise: Promise<void> | null = null;

const fetchData = () => {
  if (cachedData) {
    return;
  }
  if (promise) {
    throw promise;
  }

  promise = fetch('https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      cachedData = data;
    })
    .catch(error => {
      console.error('Failed to fetch data:', error);
      // In a real app, you might want to handle this error state more gracefully
    })
    .finally(() => {
      promise = null;
    });

  throw promise;
};

export const useData = (): CO2Data => {
  if (cachedData) {
    return cachedData;
  }
  fetchData(); 
  // This line will either throw a promise (triggering Suspense) or the function will have returned cachedData.
  // To satisfy TypeScript's return type, we'll cast it, assuming Suspense handles the thrown promise.
  return {} as CO2Data; // This part is tricky, let's refine it.
};

// A better way to structure the hook for Suspense
const resource = {
  read: () => {
    if (cachedData) {
      return cachedData;
    }
    if (promise) {
      throw promise;
    }
    fetchData();
    throw new Error("Data fetching failed to initiate properly."); // Should be unreachable
  }
};

function wrapPromise<T>(promise: Promise<T>) {
  let status: "pending" | "success" | "error" = "pending";
  let result: T;
  let error: any;

  let suspender = promise.then(
    (r: T) => {
      status = "success";
      result = r;
    },
    (e: any) => {
      status = "error";
      error = e;
    }
  );

  return {
    read() {
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw error;
      } else if (status === "success") {
        return result;
      }
      // This should be unreachable
      throw new Error("Unexpected state in wrapPromise");
    }
  };
}

let dataResource: { read: () => CO2Data };

const fetchSuspenseData = () => {
    if (!dataResource) {
        const promise = fetch('https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.json')
            .then(res => res.json());
        dataResource = wrapPromise<CO2Data>(promise) as { read: () => CO2Data };
    }
    return dataResource;
}


export const useSuspenseData = () => {
    return fetchSuspenseData().read();
}

