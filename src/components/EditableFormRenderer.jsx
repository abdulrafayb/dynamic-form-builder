import React, { useState, useEffect } from "react";

function EditableFormRenderer({ data, onDataChange }) {
  const [activeTab, setActiveTab] = useState(data[0]?.id || null);

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
    console.log("EditableFormRenderer - handleFieldChange - newData:", newData);
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
              return { ...field, tableData: updatedTableData };
            }
            return field;
          }),
        };
      }
      return tab;
    });
    console.log(
      "EditableFormRenderer - handleTableCellChange - newData:",
      newData,
    );
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
              console.log(
                "handleInsertRow - field.tableData BEFORE:",
                field.tableData,
              );
              const updatedTableData = [...(field.tableData || []), newRow];
              console.log("handleInsertRow - newRow:", newRow);
              console.log(
                "handleInsertRow - updatedTableData AFTER:",
                updatedTableData,
              );
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
    console.log(
      "EditableFormRenderer - handleInsertRow - newData before onDataChange:",
      newData,
    );
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
        return (
          <input
            key={field.id}
            type={field.field_type}
            value={value}
            placeholder={field.field_placeholder || ""}
            onChange={(e) => handleFieldChange(tabId, field.id, e.target.value)}
            required={field.is_required}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          ></textarea>
        );
      case "select":
        return (
          <select
            key={field.id}
            value={value}
            onChange={(e) => handleFieldChange(tabId, field.id, e.target.value)}
            required={field.is_required}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {field.field_options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "table": {
        const tableColumns = field.columns || [];
        const tableDataToRender = field.tableData || [];

        return (
          <div key={field.id} className="">
            <div className="overflow-x-auto border-2 border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {tableColumns.map((col) => (
                      <th
                        key={col.id}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase"
                      >
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {tableDataToRender.map((_, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {tableColumns.map((col) => (
                        <td
                          key={col.id}
                          className="px-6 py-4 text-sm whitespace-nowrap text-gray-900"
                        >
                          {(() => {
                            const cellValue =
                              tableDataToRender[rowIndex]?.[col.name] || "";
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
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
                      ))}
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
    <div className="grid">
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
              <div className="space-y-4">
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
