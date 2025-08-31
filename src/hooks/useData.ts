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
    const promise = new Promise<CO2Data>((resolve, reject) => {
      // Create a new worker. The path is relative to the public folder.
      const worker = new Worker('/data.worker.js');

      worker.onmessage = (event) => {
        if (event.data.status === 'success') {
          console.log('Main thread: Received data from worker.');
          resolve(event.data.data as CO2Data);
        } else {
          console.error('Main thread: Received error from worker.', event.data.error);
          reject(new Error(event.data.error));
        }
        worker.terminate();
      };

      worker.onerror = (error) => {
        console.error('Main thread: Worker error.', error);
        reject(error);
        worker.terminate();
      };

      // Send a message to the worker to start fetching data.
      worker.postMessage('start');
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
