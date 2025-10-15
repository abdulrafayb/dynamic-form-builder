import React, { useState } from "react";
import toast from "react-hot-toast";
import { saveTableData } from "../services/apiTables";

function FormPreview({ formData }) {
  if (!formData) {
    return <p className="text-gray-600">No form data to display.</p>;
  }

  const renderField = (field) => (
    <div key={field.id} className="mb-2 rounded-md border border-gray-300 p-3">
      <p className="font-medium text-gray-800">
        {field.field_name} ({field.field_type})
      </p>
      {field.field_placeholder && (
        <p className="text-sm text-gray-500">
          Placeholder: {field.field_placeholder}
        </p>
      )}
      {field.is_required && (
        <span className="text-sm text-red-500"> (Required)</span>
      )}
      {field.field_options && field.field_options.length > 0 && (
        <div className="mt-1 text-sm text-gray-700">
          Options:{" "}
          {field.field_options.map((option) => option.value).join(", ")}
        </div>
      )}
    </div>
  );

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
            await saveTableData(formData);
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
