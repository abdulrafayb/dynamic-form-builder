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

  useEffect(() => {
    let totalSum = 0;
    let discountSum = 0;
    let vatSum = 0;

    // console.log(
    //   "useEffect - editedFields.lines:",
    //   JSON.stringify(editedFields.lines, null, 2),
    // ); // Debug log

    if (editedFields.lines && Array.isArray(editedFields.lines)) {
      editedFields.lines.forEach((tab) => {
        if (tab.fields && Array.isArray(tab.fields)) {
          tab.fields.forEach((field) => {
            if (
              field.field_type === "table" &&
              field.tableData &&
              Array.isArray(field.tableData)
            ) {
              field.tableData.forEach((row) => {
                // console.log("Processing row:", row); // New debug log
                // Sum 'total' field
                // console.log(
                //   "Row total value:",
                //   row.Total,
                //   "is number?",
                //   !isNaN(Number(row.Total)),
                // ); // New debug log
                if (row.Total && !isNaN(Number(row.Total))) {
                  totalSum += Number(row.Total);
                }
                // Sum 'discount' field
                // console.log(
                //   "Row discount value:",
                //   row.Discount,
                //   "is number?",
                //   !isNaN(Number(row.Discount)),
                // ); // New debug log
                if (row.Discount && !isNaN(Number(row.Discount))) {
                  discountSum += Number(row.Discount);
                }
                // Sum 'vat' field
                // console.log(
                //   "Row vat value:",
                //   row.VAT,
                //   "is number?",
                //   !isNaN(Number(row.VAT)),
                // ); // New debug log
                if (row.VAT && !isNaN(Number(row.VAT))) {
                  vatSum += Number(row.VAT);
                }
              });
            }
          });
        }
      });
    }

    // console.log("Calculated Sums:", { totalSum, discountSum, vatSum }); // Debug log

    setEditedFields((prevDetails) => {
      const newLineDetails = (prevDetails.lineDetails || []).map(
        (detailTab) => ({ ...detailTab }),
      );

      // console.log(
      //   "useEffect - prevDetails.lineDetails:",
      //   prevDetails.lineDetails,
      // ); // Debug log
      // console.log(
      //   "useEffect - newLineDetails (before update):",
      //   newLineDetails,
      // ); // Debug log

      const updateOrCreateField = (tab, fieldName, value) => {
        let field = tab.fields.find((f) => f.field_name === fieldName);
        if (field) {
          field.field_value = value.toFixed(2);
          field.isCalculated = true; // Mark existing field as calculated
        } else {
          tab.fields.push({
            id: `${fieldName}-${Date.now()}`,
            field_name: fieldName,
            field_type: "text", // Assuming text type for sum fields
            field_value: value.toFixed(2),
            is_required: false,
            is_hidden: false,
            isCalculated: true, // Mark new field as calculated
          });
        }
      };

      // Ensure there's at least one tab in lineDetails to add fields to
      if (newLineDetails.length === 0) {
        newLineDetails.push({
          id: "default-line-details",
          name: "Details",
          fields: [],
        });
      }

      // Assuming calculations go into the first lineDetails tab
      const targetTab = newLineDetails[0];

      if (totalSum > 0) updateOrCreateField(targetTab, "Total Sum", totalSum);
      if (discountSum > 0)
        updateOrCreateField(targetTab, "Discount Sum", discountSum);
      if (vatSum > 0) updateOrCreateField(targetTab, "VAT Sum", vatSum);

      const totalAfterDiscount = totalSum - discountSum;
      updateOrCreateField(
        targetTab,
        "Total After Discount",
        totalAfterDiscount,
      );

      return {
        ...prevDetails,
        lineDetails: newLineDetails,
      };
    });
  }, [editedFields.lines]);

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
          isLineDetails={true} // New prop for line details grid layout
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
