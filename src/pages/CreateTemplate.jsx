import { useParams, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFormStructure,
  createFormTab,
  createFormField,
  deleteFormTab,
  deleteFormField,
  updateTabFields,
} from "../services/apiFormBuilder";
import { useState } from "react";
import TreeView from "../components/TreeView";
import TabModal from "../ui/TabModal";
import FieldModal from "../ui/FieldModal";
import TableColumnModal from "../ui/TableColumnModal";
import FormPreview from "../components/FormPreview";
import toast from "react-hot-toast";

const ALL_FIELD_TYPES = [
  { value: "text", label: "Text Input" },
  { value: "number", label: "Number Input" },
  { value: "email", label: "Email Input" },
  { value: "password", label: "Password Input" },
  { value: "tel", label: "Phone Input" },
  { value: "url", label: "URL Input" },
  { value: "date", label: "Date Picker" },
  { value: "time", label: "Time Picker" },
  { value: "datetime-local", label: "DateTime Picker" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Dropdown Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio Button" },
  { value: "file", label: "File Upload" },
  { value: "table", label: "Table" },
];

export default function CreateTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isTabModalOpen, setIsTabModalOpen] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isTableColumnModalOpen, setIsTableColumnModalOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentParentTabId, setCurrentParentTabId] = useState(null);
  const [currentTabId, setCurrentTabId] = useState(null);
  const [availableFieldTypes, setAvailableFieldTypes] =
    useState(ALL_FIELD_TYPES);
  const [fieldToEdit, setFieldToEdit] = useState(null); // New state to hold field being edited
  const [columnToEdit, setColumnToEdit] = useState(null); // New state to hold column being edited

  const isFieldNameUnique = (
    newFieldName,
    currentTabIdToCheck,
    fieldIdToExclude = null,
  ) => {
    if (!formData) return true; // No form data yet, so assume unique

    const lowerCaseNewFieldName = newFieldName.toLowerCase();

    // Check header fields
    if (formData.header && Array.isArray(formData.header)) {
      for (const tab of formData.header) {
        if (tab.fields) {
          if (
            tab.fields.some(
              (field) =>
                field.id !== fieldIdToExclude && // Exclude the field being edited
                field.field_name.toLowerCase() === lowerCaseNewFieldName,
            )
          ) {
            return false;
          }
        }
      }
    }

    // Check lines fields (if applicable, e.g., for table columns within lines tabs)
    if (formData.lines && Array.isArray(formData.lines)) {
      for (const tab of formData.lines) {
        if (tab.fields) {
          // Check for table columns within this tab
          const tableField = tab.fields.find((f) => f.field_type === "table");
          if (tableField && tableField.columns) {
            if (
              tableField.columns.some(
                (col) =>
                  col.id !== fieldIdToExclude && // Exclude the column being edited
                  col.name.toLowerCase() === lowerCaseNewFieldName,
              )
            ) {
              return false;
            }
          }

          if (
            tab.fields.some(
              (field) =>
                field.id !== fieldIdToExclude && // Exclude the field being edited
                field.field_name.toLowerCase() === lowerCaseNewFieldName,
            )
          ) {
            return false;
          }
        }
      }
    }

    return true;
  };

  const getAllColumnNames = () => {
    const columnNames = [];
    if (formData && formData.lines) {
      for (const tab of formData.lines) {
        if (tab.fields) {
          const tableField = tab.fields.find((f) => f.field_type === "table");
          if (tableField && tableField.columns) {
            for (const col of tableField.columns) {
              columnNames.push(col.name);
            }
          }
        }
      }
    }
    return columnNames;
  };

  const {
    isLoading,
    data: formData,
    error,
  } = useQuery({
    queryKey: ["form", id],
    queryFn: () => getFormStructure(id),
    enabled: !!id,
  });

  const createTabMutation = useMutation({
    mutationFn: ({ level, tabData }) => createFormTab(id, level, tabData),
    onSuccess: () => {
      queryClient.invalidateQueries(["form", id]);
      toast.success("Tab added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add tab");
      console.error(error);
    },
  });

  const createFieldMutation = useMutation({
    mutationFn: ({ level, tabId, fieldData }) =>
      createFormField(id, level, tabId, fieldData),
    onSuccess: () => {
      queryClient.invalidateQueries(["form", id]);
      toast.success("Field added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add field");
      console.error(error);
    },
  });

  const updateTabFieldsMutation = useMutation({
    mutationFn: ({ level, tabId, newFields }) =>
      updateTabFields(id, level, tabId, newFields),
    onSuccess: () => {
      queryClient.invalidateQueries(["form", id]);
      toast.success("Tab fields updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update tab fields");
      console.error(error);
    },
  });

  const updateFormFieldMutation = useMutation({
    mutationFn: ({ level, tabId, fieldId, newFieldData }) =>
      updateTabFields(id, level, tabId, newFieldData),
    onSuccess: () => {
      queryClient.invalidateQueries(["form", id]);
      toast.success("Field updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update field");
      console.error(error);
    },
  });

  const deleteTabMutation = useMutation({
    mutationFn: ({ level, tabId }) => deleteFormTab(id, level, tabId),
    onSuccess: () => {
      queryClient.invalidateQueries(["form", id]);
      toast.success("Tab deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete tab");
      console.error(error);
    },
  });

  const deleteFieldMutation = useMutation({
    mutationFn: ({ level, tabId, fieldId }) =>
      deleteFormField(id, level, tabId, fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries(["form", id]);
      toast.success("Field deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete field");
      console.error(error);
    },
  });

  const handleAddTab = (level, parentTabId = null) => {
    setCurrentLevel(level);
    setCurrentParentTabId(parentTabId);
    setIsTabModalOpen(true);
  };

  const handleAddField = (level, tabId) => {
    setCurrentLevel(level);
    setCurrentTabId(tabId);
    setFieldToEdit(null); // Ensure we're adding a new field, not editing
    setColumnToEdit(null); // Ensure we're adding a new field, not editing a column
    if (level === "lines") {
      setAvailableFieldTypes(
        ALL_FIELD_TYPES.filter((type) => type.value === "table"),
      );
      setIsTableColumnModalOpen(true);
    } else {
      setAvailableFieldTypes(ALL_FIELD_TYPES);
      setIsFieldModalOpen(true);
    }
  };

  const handleEditField = (level, tabId, fieldId, fieldData) => {
    setCurrentLevel(level);
    setCurrentTabId(tabId);
    setFieldToEdit(fieldData); // Set the field to be edited
    setColumnToEdit(null); // Ensure we're editing a field, not a column
    setAvailableFieldTypes(
      ALL_FIELD_TYPES.filter((type) => type.value === fieldData.field_type),
    );
    setIsFieldModalOpen(true);
  };

  const handleEditColumn = (level, tabId, columnId, columnData) => {
    setCurrentLevel(level);
    setCurrentTabId(tabId);
    setColumnToEdit({
      ...columnData,
      isCalculated: columnData.isCalculated || false,
      calculationFormula: columnData.calculationFormula || "",
    }); // Create a new object and ensure all properties are present
    setFieldToEdit(null); // Ensure we're editing a column, not a field
    setIsTableColumnModalOpen(true);
  };

  const handleTabSubmit = (tabName) => {
    createTabMutation.mutate({
      level: currentLevel,
      tabData: { name: tabName },
    });
  };

  const handleFieldSubmit = (fieldData) => {
    if (
      !isFieldNameUnique(fieldData.field_name, currentTabId, fieldToEdit?.id)
    ) {
      toast.error(
        `Field name "${fieldData.field_name}" already exists. Please use a unique name.`,
      );
      return;
    }

    if (fieldToEdit) {
      // Handle update
      const currentTabs = formData[currentLevel];
      const targetTab = currentTabs.find((tab) => tab.id === currentTabId);
      const updatedFields = targetTab.fields.map((field) =>
        field.id === fieldToEdit.id ? { ...field, ...fieldData } : field,
      );
      updateFormFieldMutation.mutate({
        level: currentLevel,
        tabId: currentTabId,
        fieldId: fieldToEdit.id,
        newFieldData: updatedFields,
      });
    } else {
      // Handle create
      createFieldMutation.mutate({
        level: currentLevel,
        tabId: currentTabId,
        fieldData,
      });
    }
  };

  const handleColumnSubmit = async (columnsData) => {
    try {
      const currentTabs = formData[currentLevel];
      const targetTab = currentTabs.find((tab) => tab.id === currentTabId);

      if (!targetTab) {
        toast.error("Target tab not found.");
        return;
      }

      // Find the table field
      const tableFieldIndex = targetTab.fields.findIndex(
        (field) => field.field_type === "table",
      );

      if (tableFieldIndex === -1) {
        toast.error("Table field not found in the current tab.");
        return;
      }

      const existingTableField = targetTab.fields[tableFieldIndex];
      let updatedColumns;

      if (columnToEdit) {
        // Handle update of an existing column
        updatedColumns = existingTableField.columns.map((col) =>
          col.id === columnToEdit.id ? { ...col, ...columnsData[0] } : col,
        );
      } else {
        // Handle adding new columns
        // Validate uniqueness for new columns
        for (const col of columnsData) {
          if (!isFieldNameUnique(col.name, currentTabId)) {
            toast.error(
              `Column name "${col.name}" already exists. Please use a unique name.`,
            );
            return;
          }
        }

        const newColumns = columnsData.map((col) => ({
          ...col,
          id: crypto.randomUUID(),
          isCalculated: col.isCalculated || false,
          calculationFormula: col.calculationFormula || "",
        }));
        updatedColumns = [...(existingTableField.columns || []), ...newColumns];
      }

      const updatedTableField = {
        ...existingTableField,
        columns: updatedColumns,
      };

      const newFields = targetTab.fields.map((field, index) =>
        index === tableFieldIndex ? updatedTableField : field,
      );

      await updateTabFieldsMutation.mutateAsync({
        level: currentLevel,
        tabId: currentTabId,
        newFields: newFields,
      });

      toast.success(
        columnToEdit
          ? "Column updated successfully"
          : "Columns added successfully",
      );
    } catch (error) {
      toast.error(
        columnToEdit
          ? "Failed to update column"
          : "Failed to add one or more columns",
      );
      console.error(error);
    } finally {
      setColumnToEdit(null); // Clear column being edited after submission
    }
  };

  const handleDeleteTab = (level, tabId) => {
    if (
      confirm("Are you sure you want to delete this tab and all its contents?")
    ) {
      deleteTabMutation.mutate({ level, tabId });
    }
  };

  const handleDeleteField = (level, tabId, fieldId) => {
    if (confirm("Are you sure you want to delete this field?")) {
      deleteFieldMutation.mutate({ level, tabId, fieldId });
    }
  };

  if (isLoading) return null;

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center">
          <p className="text-gray-600">No form ID provided</p>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <Button onClick={() => navigate(-1)}>Back</Button>
        <h1 className="text-3xl font-bold text-gray-800">
          Form Builder: {formData?.templateName}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">
            Tree View
          </h2>

          {error && <p className="text-red-500">Error: {error.message}</p>}

          {formData && (
            <TreeView
              formData={formData}
              onAddTab={handleAddTab}
              onDeleteTab={handleDeleteTab}
              onAddField={handleAddField}
              onDeleteField={handleDeleteField}
              onEditField={handleEditField}
              onEditColumn={handleEditColumn} // Pass the new handler
            />
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">
            Form Preview
          </h2>
          {formData && <FormPreview formData={formData} isReadOnly={true} />}
        </div>
      </div>

      <TabModal
        isOpen={isTabModalOpen}
        onClose={() => setIsTabModalOpen(false)}
        onSubmit={(tabName) => handleTabSubmit(tabName)}
        level={currentLevel}
      />

      <FieldModal
        isOpen={isFieldModalOpen}
        onClose={() => {
          setIsFieldModalOpen(false);
          setFieldToEdit(null); // Clear field being edited on close
        }}
        onSubmit={handleFieldSubmit}
        availableFieldTypes={availableFieldTypes}
        fieldToEdit={fieldToEdit}
      />

      <TableColumnModal
        isOpen={isTableColumnModalOpen}
        onClose={() => {
          setIsTableColumnModalOpen(false);
          setColumnToEdit(null); // Clear column being edited on close
        }}
        onSubmit={handleColumnSubmit}
        columnToEdit={columnToEdit} // Pass the column to edit to the modal
        allColumnNames={getAllColumnNames()} // Pass all column names for formula hints
      />
    </div>
  );
}
