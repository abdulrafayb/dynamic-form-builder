import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

const ALL_COLUMN_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Checkbox" },
];

export default function TableColumnModal({ isOpen, onClose, onSubmit }) {
  const [columns, setColumns] = useState([{ name: "", type: "text" }]);
  const [errors, setErrors] = useState({});

  const handleAddColumn = () => {
    setColumns([...columns, { name: "", type: "text" }]);
    setErrors({}); // Clear errors when a new column is added
  };

  const handleRemoveColumn = (index) => {
    const newColumns = columns.filter((_, i) => i !== index);
    setColumns(newColumns);
    setErrors({}); // Clear errors when a column is removed
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = columns.map((column, i) =>
      i === index ? { ...column, [field]: value } : column,
    );
    setColumns(newColumns);
    if (errors[`name-${index}`] && value.trim() !== "") {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[`name-${index}`];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    columns.forEach((column, index) => {
      if (!column.name.trim()) {
        newErrors[`name-${index}`] = "Column name is required.";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(columns);
    setColumns([{ name: "", type: "text" }]); // Reset form
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Table Columns">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="max-h-80 space-y-4 overflow-y-auto pr-2">
          {columns.map((column, index) => (
            <div
              key={index}
              className="relative rounded-md border border-gray-200 bg-gray-50 p-4 shadow-sm"
            >
              {columns.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveColumn(index)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800 focus:outline-none"
                  title="Remove column"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
              <div className="mt-2 grid grid-cols-1 gap-4">
                <div>
                  <label
                    htmlFor={`columnName-${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Column Name
                  </label>
                  <input
                    type="text"
                    id={`columnName-${index}`}
                    value={column.name}
                    onChange={(e) =>
                      handleColumnChange(index, "name", e.target.value)
                    }
                    className={`mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm ${errors[`name-${index}`] ? "border-red-500" : ""}`}
                    required
                  />
                  {errors[`name-${index}`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`name-${index}`]}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor={`columnType-${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Column Type
                  </label>
                  <select
                    id={`columnType-${index}`}
                    value={column.type}
                    onChange={(e) =>
                      handleColumnChange(index, "type", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm"
                  >
                    {ALL_COLUMN_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Button type="button" variant="secondary" onClick={handleAddColumn}>
            Add Another Column
          </Button>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="primary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add Columns
          </Button>
        </div>
      </form>
    </Modal>
  );
}
