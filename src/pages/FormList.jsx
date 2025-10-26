import React, { useEffect, useState } from "react";
import { getTablesData } from "../services/apiTables";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function FormList() {
  const [tableData, setTableData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTablesData();
        setTableData(data);
      } catch (error) {
        toast.error("Error fetching table data: " + error.message);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Saved Form Tables</h1>
      {tableData.length === 0 ? (
        <p className="text-gray-600">No saved form data available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tableData.map((item) => (
            <div
              key={item.id}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              onClick={() => navigate(`/form-detail/${item.id}`)}
            >
              <h2 className="text-lg font-semibold text-gray-800">
                Table ID: {item.id}
              </h2>
              <p className="text-sm text-gray-600">
                Last Updated: {new Date(item.createdAt).toLocaleDateString()}
              </p>
              {/* You can add more summary details here if needed */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FormList;
