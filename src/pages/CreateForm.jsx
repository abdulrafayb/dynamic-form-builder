import { useParams, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useQuery } from "@tanstack/react-query";
import { getForms } from "../services/apiForm";
import { useState } from "react";
import { FiPlus } from "react-icons/fi"; // Import FiPlus icon

// Helper component for rendering expandable JSON nodes
const JsonNode = ({ label, data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isObjectOrArray = typeof data === "object" && data !== null;

  // Determine if a plus sign should be shown
  const showPlusSign =
    (label === "header" || label === "lines" || label === "lineDetails") &&
    Array.isArray(data);

  // Placeholder for adding new item functionality
  const handleAddItem = (e) => {
    e.stopPropagation(); // Prevent toggling expansion when clicking plus
    console.log(`Add item to: ${label}`);
    // Implement your logic to add a new item to header/lines/lineDetails array
    // This will likely involve a mutation to update the form data
  };

  return (
    <div className="ml-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-1 py-1 text-gray-700 hover:text-gray-900 focus:outline-none"
        disabled={
          !isObjectOrArray || (Array.isArray(data) && data.length === 0)
        }
      >
        <span
          className={`transition-transform duration-200 ${
            isExpanded && isObjectOrArray ? "rotate-90" : ""
          } ${!isObjectOrArray || (Array.isArray(data) && data.length === 0) ? "invisible" : ""}`}
        >
          &gt;
        </span>
        <span className="font-medium">{label}</span>
        {!isObjectOrArray && (
          <span className="ml-1 font-normal text-gray-600">
            {JSON.stringify(data)}
          </span>
        )}
        {Array.isArray(data) && (
          <span className="ml-1 text-sm text-gray-500">[{data.length}]</span>
        )}

        {showPlusSign && ( // Conditionally render the plus button inline
          <button
            onClick={handleAddItem}
            className="ml-2 rounded-full p-1 text-blue-500 transition-colors hover:bg-blue-100 hover:text-blue-700 focus:outline-none"
            title={`Add new item to ${label}`}
          >
            <FiPlus className="inline-block text-base" />
          </button>
        )}
      </button>

      {isExpanded && isObjectOrArray && (
        <div className="border-l border-gray-200 pl-4">
          {Array.isArray(data) ? (
            data.length > 0 ? (
              data.map((item, index) => (
                <JsonNode key={index} label={`[${index}]`} data={item} />
              ))
            ) : (
              <span className="ml-4 text-sm text-gray-500">(Empty array)</span>
            )
          ) : (
            Object.entries(data).map(([key, value]) => (
              <JsonNode key={key} label={key} data={value} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default function CreateForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    isLoading,
    data: formsData,
    error,
  } = useQuery({
    queryKey: ["forms"],
    queryFn: getForms,
  });

  if (isLoading) return null;

  console.log(id);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <Button onClick={() => navigate(-1)}>Back</Button>
        <h1 className="text-3xl font-bold text-gray-800">
          Create/Edit Form Layout
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left column content */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">
            Form Fields
          </h2>
          <p className="text-gray-600">
            This section will contain draggable form elements.
          </p>
        </div>

        {/* Right column content: Tree View with forms data */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">
            Tree View
          </h2>

          {error && <p className="text-red-500">Error: {error.message}</p>}

          {formsData && (
            <div className="text-sm">
              {formsData.length === 0 && (
                <p className="text-gray-600">No forms available.</p>
              )}
              {formsData.map((form) => (
                <div key={form.id} className="mt-2">
                  <JsonNode
                    label={`Template Name: ${form.templateName}`}
                    data={{
                      header: form.header,
                      lines: form.lines,
                      lineDetails: form.lineDetails,
                      id: form.id,
                      created_at: form.created_at,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
