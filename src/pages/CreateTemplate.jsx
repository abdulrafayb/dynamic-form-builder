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

  const handleTabSubmit = (tabName) => {
    createTabMutation.mutate({
      level: currentLevel,
      tabData: { name: tabName },
    });
  };

  const handleFieldSubmit = (fieldData) => {
    createFieldMutation.mutate({
      level: currentLevel,
      tabId: currentTabId,
      fieldData,
    });
  };

  const handleColumnSubmit = async (columnsData) => {
    try {
      const currentTabs = formData[currentLevel];
      const targetTab = currentTabs.find((tab) => tab.id === currentTabId);

      if (!targetTab) {
        toast.error("Target tab not found.");
        return;
      }

      let updatedFields = [...(targetTab.fields || [])];
      let tableFieldIndex = updatedFields.findIndex(
        (field) => field.field_type === "table",
      );

      if (tableFieldIndex === -1) {
        // If no table field exists, create one
        const newTableField = {
          id: crypto.randomUUID(),
          field_name: "New Table", // Default name for the table
          field_type: "table",
          columns: columnsData.map((col) => ({
            ...col,
            id: crypto.randomUUID(),
          })), // Add unique ID to each column
          rowCount: 5, // Default row count
          tableData: [],
        };
        updatedFields.push(newTableField);
      } else {
        // If table field exists, update its columns
        const existingTableField = updatedFields[tableFieldIndex];
        const newColumns = columnsData.map((col) => ({
          ...col,
          id: crypto.randomUUID(),
        }));
        existingTableField.columns = [
          ...(existingTableField.columns || []),
          ...newColumns,
        ];
        updatedFields[tableFieldIndex] = existingTableField;
      }

      await updateTabFieldsMutation.mutateAsync({
        level: currentLevel,
        tabId: currentTabId,
        newFields: updatedFields,
      });

      toast.success("Columns added successfully");
    } catch (error) {
      toast.error("Failed to add one or more columns");
      console.error(error);
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
            />
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">
            Form Preview
          </h2>
          {formData && <FormPreview formData={formData} />}
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
        onClose={() => setIsFieldModalOpen(false)}
        onSubmit={handleFieldSubmit}
        availableFieldTypes={availableFieldTypes}
      />

      <TableColumnModal
        isOpen={isTableColumnModalOpen}
        onClose={() => setIsTableColumnModalOpen(false)}
        onSubmit={handleColumnSubmit}
      />
    </div>
  );
}
