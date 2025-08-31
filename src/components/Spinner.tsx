import React from 'react';
import './Spinner.css';

const Spinner = () => (
  <div className="spinner-overlay" data-testid="spinner">
    <div className="spinner"></div>
  </div>
);

export default Spinner;
