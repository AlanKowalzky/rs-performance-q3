self.onmessage = () => {
  console.log('Worker: Received message to fetch data.');
  fetch('https://nyc3.digitaloceanspaces.com/owid-public/data/co2/owid-co2-data.json')
    .then(res => {
      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
      }
      console.log('Worker: Data fetched, starting JSON parsing...');
      return res.json();
    })
    .then(data => {
      console.log('Worker: JSON parsed, sending data back to main thread.');
      self.postMessage({ status: 'success', data });
    })
    .catch(error => {
      console.error('Worker: Error fetching or parsing data:', error);
      self.postMessage({ status: 'error', error: error.message });
    });
};
