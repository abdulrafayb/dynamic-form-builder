import React, { useState, useEffect } from "react";
import { AsyncPaginate } from "react-select-async-paginate";

function EditableFormRenderer({ data, onDataChange, isHeader }) {
  const [activeTab, setActiveTab] = useState(data[0]?.id || null);

  // Basic formula evaluator (CAUTION: For production, use a safe expression evaluator library)
  const evaluateFormula = (formula, rowData) => {
    let processedFormula = formula;
    const declarations = [];

    // Helper to convert string to a camelCase-like format for regex matching in the formula
    const toFormulaVariable = (str) => {
      // Convert to camelCase: remove non-alphanumeric, then apply camelCase
      const cleanedStr = str.replace(/[^a-zA-Z0-9_\s]/g, ""); // Remove special chars, keep spaces and underscores
      return cleanedStr
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, ""); // Remove spaces
    };

    console.log("Initial formula:", formula); // New log
    console.log("Row data for evaluation:", rowData); // New log

    for (const key in rowData) {
      console.log("Processing key (column name):", key); // New log

      // 1. Sanitize key for variable declaration (e.g., "Item Quantity" -> "ItemQuantity")
      const sanitizedKeyForDeclaration = key.replace(/[^a-zA-Z0-9_]/g, "");
      const value = Number(rowData[key]) || 0;
      declarations.push(`const ${sanitizedKeyForDeclaration} = ${value};`);

      console.log("Sanitized key for declaration:", sanitizedKeyForDeclaration); // New log
      console.log("Value for key:", value); // New log

      // 2. Generate the variable name as it would appear in the formula (e.g., "Item Quantity" -> "itemQuantity")
      const formulaVariableInUse = toFormulaVariable(key);

      console.log("Formula variable to match:", formulaVariableInUse); // New log

      // 3. Replace the formula variable in the processedFormula with the sanitized declaration name
      // Escape special characters in the formulaVariableInUse for regex, then add word boundaries.
      const escapedFormulaVar = formulaVariableInUse.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      const regexForFormulaVar = new RegExp(`\\b${escapedFormulaVar}\\b`, "gi"); // 'gi' for global and case-insensitive

      console.log("Regex pattern for replacement:", regexForFormulaVar); // New log
      console.log("Formula BEFORE replacement:", processedFormula); // New log

      processedFormula = processedFormula.replace(
        regexForFormulaVar,
        sanitizedKeyForDeclaration,
      );

      console.log("Formula AFTER replacement:", processedFormula); // New log
    }

    const fullFormula = `${declarations.join("\n")} return ${processedFormula};`;

    console.log("Full formula for execution:", fullFormula); // New log

    try {
      // eslint-disable-next-line no-new-func
      return new Function(fullFormula)();
    } catch (error) {
      console.error("Error evaluating formula:", formula, error);
      return "Error";
    }
  };

  async function loadOptions(search, loadedOptions, { page, endpoint }) {
    try {
      const url = new URL(endpoint);
      url.searchParams.append("page", page);
      if (search) {
        url.searchParams.append("search", search);
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      let items = [];
      let hasMore = false;

      if (Array.isArray(result)) {
        items = result;
        hasMore = false; // Assuming no pagination for simple arrays
      } else if (result && Array.isArray(result.results)) {
        // Existing logic for object with `results` array
        items = result.results;
        hasMore = !!result.next;
      } else if (result && typeof result === "object") {
        // Handle object of objects (take values)
        items = Object.values(result);
        hasMore = false; // Assuming no pagination for object of objects
      } else {
        return {
          options: [],
          hasMore: false,
          additional: {
            page,
            endpoint,
          },
        };
      }

      const options = items.map((item) => ({
        value:
          item.id ||
          item.value ||
          item.name ||
          item.label ||
          JSON.stringify(item),
        label:
          item.title ||
          item.name ||
          item.label ||
          item.id ||
          JSON.stringify(item),
      }));

      return {
        options,
        hasMore,
        additional: {
          page: page + 1,
          endpoint,
        },
      };
    } catch (error) {
      console.error("Error loading options from API:", error);
      return {
        options: [],
        hasMore: false,
        additional: {
          page,
          endpoint,
        },
      };
    }
  }
  // Effect to manage activeTab when data changes
  useEffect(() => {
    // If data changes and the current active tab is no longer in the new data, or if no tab is active
    if (
      !activeTab ||
      (data.length > 0 && !data.some((tab) => tab.id === activeTab))
    ) {
      setActiveTab(data[0]?.id || null);
    }
  }, [data, activeTab]); // Include activeTab to re-evaluate if data changes and activeTab is invalid

  const handleFieldChange = (tabId, fieldId, value) => {
    const newData = data.map((tab) => {
      if (tab.id === tabId) {
        return {
          ...tab,
          fields: tab.fields.map((field) =>
            field.id === fieldId ? { ...field, field_value: value } : field,
          ),
        };
      }
      return tab;
    });
    // Only call onDataChange if the data has actually changed to prevent infinite loops
    onDataChange(newData);
  };

  const handleTableCellChange = (
    tabId,
    fieldId,
    rowIndex,
    columnName,
    value,
  ) => {
    const newData = data.map((tab) => {
      if (tab.id === tabId) {
        return {
          ...tab,
          fields: tab.fields.map((field) => {
            if (field.id === fieldId && field.field_type === "table") {
              const updatedTableData = [
                ...(field.tableData || Array(field.rowCount).fill({})),
              ];
              updatedTableData[rowIndex] = {
                ...(updatedTableData[rowIndex] || {}),
                [columnName]: value,
              };

              // Re-evaluate calculated columns in the current row
              field.columns.forEach((col) => {
                if (col.isCalculated) {
                  const calculatedValue = evaluateFormula(
                    col.calculationFormula,
                    updatedTableData[rowIndex],
                  );
                  updatedTableData[rowIndex][col.name] = calculatedValue;
                }
              });

              return { ...field, tableData: updatedTableData };
            }
            return field;
          }),
        };
      }
      return tab;
    });
    onDataChange(newData);
  };

  const handleInsertRow = (tabId, fieldId, columns) => {
    const newRow = columns.reduce(
      (acc, col) => ({ ...acc, [col.name]: "" }),
      {},
    );

    const newData = data.map((tab) => {
      if (tab.id === tabId) {
        return {
          ...tab,
          fields: tab.fields.map((field) => {
            if (field.id === fieldId && field.field_type === "table") {
              const updatedTableData = [...(field.tableData || []), newRow];
              return {
                ...field,
                tableData: updatedTableData,
              };
            }
            return field;
          }),
        };
      }
      return tab;
    });
    onDataChange(newData);
  };

  if (!data || data.length === 0) {
    return <p className="text-gray-600">No fields defined.</p>;
  }

  const renderEditableField = (field, tabId) => {
    const value = field.field_value || "";
    switch (field.field_type) {
      case "text":
      case "email":
      case "number":
      case "date":
        return (
          <input
            key={field.id}
            type={field.field_type}
            value={value}
            placeholder={field.field_placeholder || ""}
            onChange={(e) => handleFieldChange(tabId, field.id, e.target.value)}
            required={field.is_required}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        );
      case "textarea":
        return (
          <textarea
            key={field.id}
            value={value}
            placeholder={field.field_placeholder || ""}
            onChange={(e) => handleFieldChange(tabId, field.id, e.target.value)}
            required={field.is_required}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          ></textarea>
        );
      case "select":
        return (
          <select
            key={field.id}
            value={value}
            onChange={(e) => handleFieldChange(tabId, field.id, e.target.value)}
            required={field.is_required}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {field.field_options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "api-dropdown":
        return (
          <AsyncPaginate
            key={field.id}
            value={
              field.field_value
                ? { value: field.field_value, label: field.field_value }
                : null
            }
            loadOptions={loadOptions}
            onChange={(selectedOption) =>
              handleFieldChange(
                tabId,
                field.id,
                selectedOption ? selectedOption.value : "",
              )
            }
            additional={{ page: 1, endpoint: field.endpoint }}
            isClearable
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={field.field_placeholder || "Select an option..."}
            menuPortalTarget={document.body}
          />
        );
      case "table": {
        const tableColumns = field.columns || [];
        const tableDataToRender = field.tableData || [];

        return (
          <div key={field.id}>
            <div className="overflow-x-scroll border-2 border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {tableColumns.map((col) => (
                      <th
                        key={col.id}
                        scope="col"
                        className="min-w-2xs px-4 py-3 text-left text-xs font-medium tracking-wider whitespace-nowrap text-gray-700 uppercase"
                      >
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {tableDataToRender.map((_, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {tableColumns.map((col) => {
                        const cellValue =
                          tableDataToRender[rowIndex]?.[col.name] || "";
                        const isCalculated = col.isCalculated; // Access isCalculated from column object

                        return (
                          <td
                            key={col.id}
                            className="px-4 py-3 text-sm whitespace-nowrap text-gray-900"
                          >
                            {(() => {
                              switch (col.type) {
                                case "text":
                                case "number":
                                case "date":
                                  return (
                                    <input
                                      type={
                                        col.type === "number"
                                          ? "number"
                                          : col.type === "date"
                                            ? "date"
                                            : "text"
                                      }
                                      value={cellValue}
                                      onChange={(e) =>
                                        handleTableCellChange(
                                          tabId,
                                          field.id,
                                          rowIndex,
                                          col.name,
                                          e.target.value,
                                        )
                                      }
                                      disabled={isCalculated} // Disable if calculated
                                      className={`w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isCalculated ? "bg-gray-100" : ""}`}
                                    />
                                  );
                                case "boolean":
                                  return (
                                    <input
                                      type="checkbox"
                                      checked={!!cellValue}
                                      onChange={(e) =>
                                        handleTableCellChange(
                                          tabId,
                                          field.id,
                                          rowIndex,
                                          col.name,
                                          e.target.checked,
                                        )
                                      }
                                      disabled={isCalculated} // Disable if calculated
                                      className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${isCalculated ? "bg-gray-100" : ""}`}
                                    />
                                  );
                                case "api-dropdown":
                                  return (
                                    <AsyncPaginate
                                      key={`${field.id}-${col.id}-${rowIndex}`}
                                      value={
                                        cellValue
                                          ? {
                                              value: cellValue,
                                              label: cellValue,
                                            }
                                          : null
                                      }
                                      loadOptions={loadOptions}
                                      onChange={(selectedOption) =>
                                        handleTableCellChange(
                                          tabId,
                                          field.id,
                                          rowIndex,
                                          col.name,
                                          selectedOption
                                            ? selectedOption.value
                                            : "",
                                        )
                                      }
                                      additional={{
                                        page: 1,
                                        endpoint: col.endpoint,
                                      }}
                                      isClearable
                                      className={`w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isCalculated ? "bg-gray-100" : ""}`}
                                      placeholder="Select an option..."
                                      menuPortalTarget={document.body}
                                      isDisabled={isCalculated} // Disable if calculated
                                    />
                                  );
                                default:
                                  return (
                                    <p className="text-red-500">
                                      Unsupported column type: {col.type}
                                    </p>
                                  );
                              }
                            })()}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleInsertRow(tabId, field.id, tableColumns)}
                className="mt-4 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
              >
                Insert Row
              </button>
            </div>
          </div>
        );
      }
      // Add more field types as needed
      default:
        return (
          <p key={field.id} className="text-red-500">
            Unsupported field type: {field.field_type}
          </p>
        );
    }
  };

  return (
    <div className="">
      {data.length > 1 && (
        <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {data.map((tab) => (
              <button
                key={tab.id}
                className={`border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap focus:outline-none ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      )}

      {data.map((tab) =>
        activeTab === tab.id ? (
          <div key={tab.id} className="space-y-4">
            {tab.fields.length > 0 ? (
              <div
                className={`space-y-4 ${isHeader ? "grid grid-cols-3 gap-4" : ""}`}
              >
                {tab.fields.map((field) => (
                  <div key={field.id} className="space-y-1">
                    <label
                      htmlFor={field.id}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {field.field_name}
                      {field.is_required && (
                        <span className="text-red-500"> *</span>
                      )}
                    </label>
                    {renderEditableField(field, tab.id)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No fields defined for this tab.</p>
            )}
          </div>
        ) : null,
      )}
    </div>
  );
}

export default EditableFormRenderer;
