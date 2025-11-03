import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTableDataById, updateTableDataItem } from "../services/apiTables";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import EditableFormRenderer from "../components/EditableFormRenderer";

function FormDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tableEntry, setTableEntry] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  // const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchEntry() {
      if (!id) return;
      try {
        const data = await getTableDataById(id);
        console.log("FormDetail - fetched data:", data); // Add log
        setTableEntry(data);
        setEditedFields({
          header: data.header,
          lines: data.lines,
          lineDetails: data.lineDetails,
        });
        console.log("FormDetail - editedFields after set:", {
          // Add log
          header: data.header,
          lines: data.lines,
          lineDetails: data.lineDetails,
        });
      } catch (error) {
        toast.error("Error fetching table entry: " + error.message);
      }
    }
    fetchEntry();
  }, [id]);

  const handleSectionDataChange = (fieldName, newData) => {
    setEditedFields((prev) => ({
      ...prev,
      [fieldName]: newData,
    }));
  };

  const handleSave = async () => {
    try {
      const fieldsToUpdate = {
        header: JSON.stringify(editedFields.header),
        lines: JSON.stringify(editedFields.lines),
        lineDetails: JSON.stringify(editedFields.lineDetails),
      };
      await updateTableDataItem(id, fieldsToUpdate);
      // Re-fetch data to ensure local state is consistent with the database
      const updatedData = await getTableDataById(id);
      setTableEntry(updatedData);
      setEditedFields({
        header: updatedData.header,
        lines: updatedData.lines,
        lineDetails: updatedData.lineDetails,
      });
      toast.success("Entry updated successfully!");
      // setIsEditing(false);
    } catch (error) {
      console.error("FormDetail - handleSave - error:", error);
      toast.error("Error updating entry: " + error.message);
    }
  };

  if (!tableEntry) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-600">Loading or no data found...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <Button onClick={() => navigate(-1)}>Back to Tables</Button>
        <h1 className="text-3xl font-bold text-gray-800">
          Table Entry: {tableEntry.id}
        </h1>
        {/* <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel Edit" : "Edit"}
        </Button> */}
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-700">Header Data</h2>
        <EditableFormRenderer
          data={editedFields.header || []}
          onDataChange={(newData) => handleSectionDataChange("header", newData)}
          isHeader={true}
          formStructure={tableEntry} // Pass the entire tableEntry as formStructure
        />

        <h2 className="text-xl font-semibold text-gray-700">Lines Data</h2>
        <EditableFormRenderer
          data={editedFields.lines || []}
          onDataChange={(newData) => handleSectionDataChange("lines", newData)}
          formStructure={tableEntry} // Pass the entire tableEntry as formStructure
        />

        <h2 className="text-xl font-semibold text-gray-700">
          Line Details Data
        </h2>
        <EditableFormRenderer
          data={editedFields.lineDetails || []}
          onDataChange={(newData) =>
            handleSectionDataChange("lineDetails", newData)
          }
          formStructure={tableEntry} // Pass the entire tableEntry as formStructure
        />

        {/* {isEditing && ( */}
        <Button
          onClick={handleSave}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          Save Changes
        </Button>
        {/* )} */}
      </div>
    </div>
  );
}

export default FormDetail;
