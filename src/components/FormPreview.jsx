import React, { useState } from "react";
import toast from "react-hot-toast";
import { saveTableData } from "../services/apiTables";

function FormPreview({ formData, isReadOnly = false }) {
  const [tableData, setTableData] = useState({}); // State to hold data for all tables

  // Basic formula evaluator (CAUTION: For production, use a safe expression evaluator library)
  const evaluateFormula = (formula, rowData) => {
    let evaluatedFormula = formula;
    for (const key in rowData) {
      // Replace column names with their values, ensuring numbers are treated as such
      const regex = new RegExp(`\\b${key}\\b`, "g");
      evaluatedFormula = evaluatedFormula.replace(
        regex,
        `(Number(rowData.${key}) || 0)`,
      );
    }
    try {
      // eslint-disable-next-line no-eval
      return eval(evaluatedFormula);
    } catch (error) {
      console.error("Error evaluating formula:", formula, error);
      return "Error";
    }
  };

  if (!formData) {
    return <p className="text-gray-600">No form data to display.</p>;
  }

  const renderField = (field) => {
    if (field.field_type === "table") {
      const columns = field.columns || [];
      const initialTableData =
        tableData[field.id] || Array(field.rowCount || 1).fill({});

      const handleCellChange = (rowIndex, columnName, value) => {
        if (isReadOnly) return; // Prevent changes in read-only mode
        setTableData((prevTableData) => {
          const newTableData = { ...prevTableData };
          const currentTable = [...(newTableData[field.id] || [])];
          currentTable[rowIndex] = {
            ...currentTable[rowIndex],
            [columnName]: value,
          };

          // Re-evaluate calculated columns in the current row
          columns.forEach((col) => {
            if (col.isCalculated) {
              const calculatedValue = evaluateFormula(
                col.calculationFormula,
                currentTable[rowIndex],
              );
              currentTable[rowIndex][col.name] = calculatedValue;
            }
          });

          newTableData[field.id] = currentTable;
          return newTableData;
        });
      };

      return (
        <div key={field.id} className="mb-4 overflow-x-auto">
          <h4 className="mb-2 font-semibold text-gray-700">
            {field.field_name || "Table"}
          </h4>
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {initialTableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col) => {
                    const isCalculated = col.isCalculated;
                    const value = row[col.name] || "";
                    return (
                      <td
                        key={col.id}
                        className="px-4 py-2 text-sm whitespace-nowrap text-gray-900"
                      >
                        <input
                          type={col.type === "number" ? "number" : "text"}
                          value={value}
                          onChange={(e) =>
                            handleCellChange(rowIndex, col.name, e.target.value)
                          }
                          disabled={isReadOnly || isCalculated}
                          className={`focus:ring-opacity-50 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 sm:text-sm ${isCalculated || isReadOnly ? "bg-gray-100" : ""}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (field.field_type === "table_column") {
      return null; // Don't render individual table columns outside of a table
    }

    // Regular form fields
    let inputElement;
    switch (field.field_type) {
      case "text":
      case "number":
      case "email":
      case "password":
      case "tel":
      case "url":
        inputElement = (
          <input
            type={field.field_type}
            placeholder={field.field_placeholder || ""}
            required={field.is_required}
            className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 sm:text-sm"
            disabled={isReadOnly}
          />
        );
        break;
      case "date":
      case "time":
      case "datetime-local":
        inputElement = (
          <input
            type={field.field_type}
            required={field.is_required}
            className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 sm:text-sm"
            disabled={isReadOnly}
          />
        );
        break;
      case "textarea":
        inputElement = (
          <textarea
            placeholder={field.field_placeholder || ""}
            required={field.is_required}
            rows={3}
            className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 sm:text-sm"
            disabled={isReadOnly}
          />
        );
        break;
      case "select":
        inputElement = (
          <select
            required={field.is_required}
            className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 sm:text-sm"
            disabled={isReadOnly}
          >
            {field.field_options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
        break;
      case "checkbox":
        inputElement = (
          <input
            type="checkbox"
            required={field.is_required}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            disabled={isReadOnly}
          />
        );
        break;
      case "radio":
        inputElement = (
          <div className="mt-1 space-y-2">
            {field.field_options?.map((option, idx) => (
              <div key={idx} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.field_name}-${idx}`}
                  name={field.field_name}
                  value={option}
                  required={field.is_required}
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={isReadOnly}
                />
                <label
                  htmlFor={`${field.field_name}-${idx}`}
                  className="ml-2 block text-sm text-gray-900"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
        break;
      case "file":
        inputElement = (
          <input
            type="file"
            required={field.is_required}
            className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            disabled={isReadOnly}
          />
        );
        break;
      default:
        inputElement = (
          <p className="text-red-500">
            Unsupported field type: {field.field_type}
          </p>
        );
    }

    return (
      <div
        key={field.id}
        className="mb-4 rounded-md border border-gray-300 p-3"
      >
        <label
          htmlFor={field.field_name}
          className="block text-sm font-medium text-gray-700"
        >
          {field.field_name}
          {field.is_required && <span className="text-red-500"> *</span>}
        </label>
        {inputElement}
        {field.field_placeholder && (
          <p className="mt-1 text-sm text-gray-500">
            {field.field_placeholder}
          </p>
        )}
      </div>
    );
  };

  const SectionWithTabs = ({ title, data }) => {
    const [activeSubTab, setActiveSubTab] = useState(data[0]?.id || null);

    if (!data || data.length === 0) {
      return null;
    }

    return (
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-xl font-bold text-gray-800">{title}</h3>
        {data.length > 1 && (
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Sub Tabs">
              {data.map((tab) => (
                <button
                  key={tab.id}
                  className={`border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap focus:outline-none ${activeSubTab === tab.id ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}
                  onClick={() => setActiveSubTab(tab.id)}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        )}
        <div className="mt-4">
          {data.map((tab) =>
            activeSubTab === tab.id ? (
              <div key={tab.id} className="space-y-2">
                {tab.fields.map(renderField)}
              </div>
            ) : null,
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SectionWithTabs title="Header" data={formData.header} />
      <SectionWithTabs title="Lines" data={formData.lines} />
      <SectionWithTabs title="Line Details" data={formData.lineDetails} />

      {(!formData.header || formData.header.length === 0) &&
        (!formData.lines || formData.lines.length === 0) &&
        (!formData.lineDetails || formData.lineDetails.length === 0) && (
          <p className="text-gray-600">No fields defined yet.</p>
        )}

      <button
        onClick={async () => {
          try {
            // When saving, include the current tableData state
            const formDataWithTableData = { ...formData };
            formDataWithTableData.lines = formDataWithTableData.lines.map(
              (tab) => {
                if (tab.fields) {
                  const updatedFields = tab.fields.map((field) => {
                    if (field.field_type === "table") {
                      return {
                        ...field,
                        tableData: tableData[field.id] || field.tableData,
                      };
                    }
                    return field;
                  });
                  return { ...tab, fields: updatedFields };
                }
                return tab;
              },
            );
            await saveTableData(formDataWithTableData);
            toast.success("Form data saved successfully!");
          } catch (error) {
            toast.error("Error saving form data: " + error.message);
          }
        }}
        className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
      >
        Save
      </button>
    </div>
  );
}

export default FormPreview;
