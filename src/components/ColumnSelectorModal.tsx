import React, { useState, useEffect } from 'react';
import './ColumnSelectorModal.css';

interface ColumnSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableColumns: string[];
  selectedColumns: string[];
  onSave: (newColumns: string[]) => void;
}

export const ColumnSelectorModal: React.FC<ColumnSelectorModalProps> = ({
  isOpen,
  onClose,
  availableColumns,
  selectedColumns,
  onSave,
}) => {
  const [currentSelection, setCurrentSelection] = useState<string[]>(selectedColumns);

  useEffect(() => {
    setCurrentSelection(selectedColumns);
  }, [selectedColumns, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleCheckboxChange = (column: string) => {
    setCurrentSelection((prev) =>
      prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
    );
  };

  const handleSave = () => {
    onSave(currentSelection);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Select Columns</h2>
        <div className="column-list">
          {availableColumns.map((column) => (
            <div key={column} className="column-item">
              <input
                type="checkbox"
                id={`col-${column}`}
                checked={currentSelection.includes(column)}
                onChange={() => handleCheckboxChange(column)}
                disabled={['year', 'population', 'co2', 'co2_per_capita'].includes(column)}
              />
              <label htmlFor={`col-${column}`}>{column.replace(/_/g, ' ')}</label>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};
