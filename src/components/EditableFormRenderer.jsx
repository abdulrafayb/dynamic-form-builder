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
    if (JSON.stringify(newData) !== JSON.stringify(data)) {
      onDataChange(newData);
    }
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
    <div>
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
      <div className="mt-4 space-y-4">
        {data.map((tab) =>
          activeTab === tab.id ? (
            <div key={tab.id} className="space-y-4">
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
          ) : null,
        )}
      </div>
    </div>
  );
}

export default EditableFormRenderer;
