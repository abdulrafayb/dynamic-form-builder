import { useParams, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFormStructure,
  createFormTab,
  createFormField,
  deleteFormTab,
  deleteFormField,
} from "../services/apiFormBuilder";
import { useState } from "react";
import TreeView from "../components/TreeView";
import TabModal from "../ui/TabModal";
import FieldModal from "../ui/FieldModal";
import toast from "react-hot-toast";

export default function CreateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isTabModalOpen, setIsTabModalOpen] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentParentTabId, setCurrentParentTabId] = useState(null);
  const [currentTabId, setCurrentTabId] = useState(null);

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
    setIsFieldModalOpen(true);
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
          <p className="text-gray-600">
            Preview of your form will appear here.
          </p>
        </div>
      </div>

      <TabModal
        isOpen={isTabModalOpen}
        onClose={() => setIsTabModalOpen(false)}
        onSubmit={handleTabSubmit}
        level={currentLevel}
      />

      <FieldModal
        isOpen={isFieldModalOpen}
        onClose={() => setIsFieldModalOpen(false)}
        onSubmit={handleFieldSubmit}
      />
    </div>
  );
}
