import React, { useEffect, useState } from "react";
import { getTablesData } from "../services/apiTables";
import { useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import Button from "../ui/Button";

function TableView() {
  const [tableHeaders, setTableHeaders] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const navigate = useNavigate();

  const handleColumnToggle = (column) => {
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column],
    );
  };

  useEffect(() => {
    async function fetchHeaders() {
      try {
        const data = await getTablesData();

        const allHeaders = data.flatMap((item) => {
          if (item.header && Array.isArray(item.header)) {
            return item.header.flatMap((tab) =>
              tab.fields ? tab.fields.map((field) => field.field_name) : [],
            );
          } else if (item.header && item.header.fields) {
            return item.header.fields.map((field) => field.field_name);
          }
          return [];
        });

        const uniqueHeaders = [...new Set(allHeaders)];
        setTableHeaders(["ID", ...uniqueHeaders]);
        setVisibleColumns(["ID", ...uniqueHeaders]);

        const rows = data.map((item) => {
          const rowData = { ID: item.id }; // Add the ID to rowData
          uniqueHeaders.forEach((header) => {
            let fieldValue = "";

            if (item.header && Array.isArray(item.header)) {
              item.header.forEach((tab) => {
                if (tab && tab.fields) {
                  const field = tab.fields.find((f) => f.field_name === header);
                  if (field) {
                    fieldValue = field.field_value || "";
                  }
                }
              });
            }
            rowData[header] = fieldValue;
          });
          return rowData;
        });
        setTableRows(rows);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHeaders();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <h1 className="text-2xl font-bold text-gray-800">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <h1 className="text-2xl font-bold text-red-600">Error: {error}</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <Button onClick={() => navigate(-1)}>
          <HiArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">Table View</h1>
      </div>

      <div className="mb-4 rounded-lg border bg-gray-50 p-4">
        <h2 className="mb-2 text-xl font-semibold text-gray-700">
          Select Columns to Display
        </h2>
        <div className="flex flex-wrap gap-4">
          {tableHeaders.map((header) => (
            <label key={header} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={visibleColumns.includes(header)}
                onChange={() => handleColumnToggle(header)}
                className="form-checkbox h-5 w-5 text-indigo-600"
              />
              <span className="text-gray-700">{header}</span>
            </label>
          ))}
        </div>
      </div>

      {tableRows.length > 0 ? (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
              <tr>
                {tableHeaders
                  .filter((header) => visibleColumns.includes(header))
                  .map((header) => (
                    <th key={header} scope="col" className="px-6 py-3">
                      {header}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, index) => (
                <tr key={index} className="border-b bg-white hover:bg-gray-50">
                  {tableHeaders
                    .filter((header) => visibleColumns.includes(header))
                    .map((header) => (
                      <td key={header} className="px-6 py-4">
                        {header === "ID" ? (
                          <span
                            className="cursor-pointer font-medium text-indigo-600 hover:underline"
                            onClick={() => navigate(`/form-detail/${row.ID}`)}
                          >
                            {row.ID}
                          </span>
                        ) : typeof row[header] === "object" &&
                          row[header] !== null ? (
                          JSON.stringify(row[header])
                        ) : (
                          row[header]
                        )}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-lg text-gray-600">No table data available.</p>
      )}
    </div>
  );
}

export default TableView;
