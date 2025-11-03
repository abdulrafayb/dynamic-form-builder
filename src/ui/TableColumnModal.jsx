import { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "./Button";

const ALL_COLUMN_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Checkbox" },
  { value: "api-dropdown", label: "API Dropdown" },
];

export default function TableColumnModal({
  isOpen,
  onClose,
  onSubmit,
  columnToEdit,
  allColumnNames,
}) {
  const [columns, setColumns] = useState([
    {
      name: "",
      type: "text",
      endpoint: "",
    },
  ]);
  const [errors, setErrors] = useState({});
  const [dependencies, setDependencies] = useState({});

  useEffect(() => {
    if (columnToEdit) {
      setColumns([columnToEdit]);
      setDependencies({
        [columnToEdit.id]: {
          isCalculated: columnToEdit.isCalculated || false,
          calculationFormula: columnToEdit.calculationFormula || "",
        },
      });
    } else {
      setColumns([
        {
          name: "",
          type: "text",
          endpoint: "",
        },
      ]);
      setDependencies({});
    }
  }, [columnToEdit]);

  const handleAddColumn = () => {
    setColumns([
      ...columns,
      {
        name: "",
        type: "text",
        endpoint: "",
      },
    ]);
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

  const handleDependencyChange = (columnId, field, value) => {
    setDependencies((prevDependencies) => ({
      ...prevDependencies,
      [columnId]: { ...prevDependencies[columnId], [field]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    columns.forEach((column, index) => {
      if (!column.name.trim()) {
        newErrors[`name-${index}`] = "Column name is required.";
      }
      if (column.type === "api-dropdown" && !column.endpoint.trim()) {
        newErrors[`endpoint-${index}`] =
          "API Endpoint is required for API Dropdown type.";
      }
    });

    // Validate dependencies
    Object.entries(dependencies).forEach(([columnId, dep]) => {
      if (dep.isCalculated && !dep.calculationFormula.trim()) {
        newErrors[`formula-${columnId}`] =
          "Calculation formula is required for calculated columns.";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const columnsWithDependencies = columns.map((col) => ({
      ...col,
      isCalculated: dependencies[col.id]?.isCalculated || false,
      calculationFormula: dependencies[col.id]?.calculationFormula || "",
    }));

    onSubmit(columnsWithDependencies);
    setColumns([
      {
        name: "",
        type: "text",
        endpoint: "",
      },
    ]); // Reset form
    setDependencies({});
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={columnToEdit ? "Edit Table Column" : "Add Table Columns"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="max-h-80 space-y-4 overflow-y-auto pr-2">
          {columns.map((column, index) => (
            <div
              key={column.id}
              className="relative rounded-md border border-gray-200 bg-gray-50 p-4 shadow-sm"
            >
              {columns.length > 1 && !columnToEdit && (
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
                    htmlFor={`columnName-${column.id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Column Name
                  </label>
                  <input
                    type="text"
                    id={`columnName-${column.id}`}
                    value={column.name}
                    onChange={(e) =>
                      handleColumnChange(index, "name", e.target.value)
                    }
                    className={`mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm ${errors[`name-${column.id}`] ? "border-red-500" : ""}`}
                    required
                  />
                  {errors[`name-${column.id}`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`name-${column.id}`]}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor={`columnType-${column.id}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Column Type
                  </label>
                  <select
                    id={`columnType-${column.id}`}
                    value={column.type}
                    onChange={(e) =>
                      handleColumnChange(index, "type", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm"
                    disabled={!!columnToEdit} // Disable column type editing when editing a column
                  >
                    {ALL_COLUMN_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                {column.type === "api-dropdown" && (
                  <div>
                    <label
                      htmlFor={`apiEndpoint-${column.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      API Endpoint
                    </label>
                    <input
                      type="text"
                      id={`apiEndpoint-${column.id}`}
                      value={column.endpoint}
                      onChange={(e) =>
                        handleColumnChange(index, "endpoint", e.target.value)
                      }
                      className={`mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm ${errors[`endpoint-${column.id}`] ? "border-red-500" : ""}`}
                      required
                    />
                    {errors[`endpoint-${column.id}`] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[`endpoint-${column.id}`]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* New section for Column Dependencies */}
        {columns.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Column Dependencies
            </h3>
            <div className="space-y-4">
              {columns.map((column) => (
                <div key={column.id} className="flex items-center space-x-2">
                  <span className="w-1/3 font-medium text-gray-700">
                    {column.name} ({column.type})
                  </span>
                  {column.type === "number" && (
                    <>
                      <input
                        type="checkbox"
                        id={`isCalculated-${column.id}`}
                        checked={dependencies[column.id]?.isCalculated || false}
                        onChange={(e) =>
                          handleDependencyChange(
                            column.id,
                            "isCalculated",
                            e.target.checked,
                          )
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`isCalculated-${column.id}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        Calculated
                      </label>
                      {dependencies[column.id]?.isCalculated && (
                        <div className="flex-grow">
                          <input
                            type="text"
                            id={`calculationFormula-${column.id}`}
                            value={
                              dependencies[column.id]?.calculationFormula || ""
                            }
                            onChange={(e) =>
                              handleDependencyChange(
                                column.id,
                                "calculationFormula",
                                e.target.value,
                              )
                            }
                            placeholder="e.g., price * quantity - discount"
                            className={`w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:text-sm ${errors[`formula-${column.id}`] ? "border-red-500" : ""}`}
                          />
                          {errors[`formula-${column.id}`] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[`formula-${column.id}`]}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            Use column names as variables (e.g., `itemPrice *
                            quantity - discount`)
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!columnToEdit && (
          <div className="flex justify-center">
            <Button type="button" variant="secondary" onClick={handleAddColumn}>
              Add Another Column
            </Button>
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="primary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {columnToEdit ? "Update Column" : "Add Columns"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
