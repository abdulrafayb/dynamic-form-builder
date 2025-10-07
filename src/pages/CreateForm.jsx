import { useParams, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFormById } from "../services/apiForm";
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
    queryFn: () => getFormById(id),
    enabled: !!id,
  });

  const { data: formStructure } = useQuery({
    queryKey: ["formStructure", id],
    queryFn: () => getFormStructure(id),
    enabled: !!id,
  });

  const createTabMutation = useMutation({
    mutationFn: createFormTab,
    onSuccess: () => {
      queryClient.invalidateQueries(["formStructure", id]);
      toast.success("Tab added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add tab");
      console.error(error);
    },
  });

  const createFieldMutation = useMutation({
    mutationFn: createFormField,
    onSuccess: () => {
      queryClient.invalidateQueries(["formStructure", id]);
      toast.success("Field added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add field");
      console.error(error);
    },
  });

  const deleteTabMutation = useMutation({
    mutationFn: deleteFormTab,
    onSuccess: () => {
      queryClient.invalidateQueries(["formStructure", id]);
      toast.success("Tab deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete tab");
      console.error(error);
    },
  });

  const deleteFieldMutation = useMutation({
    mutationFn: deleteFormField,
    onSuccess: () => {
      queryClient.invalidateQueries(["formStructure", id]);
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

  const handleAddField = (tabId) => {
    setCurrentTabId(tabId);
    setIsFieldModalOpen(true);
  };

  const handleTabSubmit = (tabName) => {
    const tabs = formStructure?.tabs || [];
    const maxOrder =
      tabs.filter((t) => t.level === currentLevel).length > 0
        ? Math.max(
            ...tabs
              .filter((t) => t.level === currentLevel)
              .map((t) => t.order_index),
          )
        : -1;

    createTabMutation.mutate({
      form_id: id,
      parent_tab_id: currentParentTabId,
      level: currentLevel,
      name: tabName,
      order_index: maxOrder + 1,
    });
  };

  const handleFieldSubmit = (fieldData) => {
    const fields = formStructure?.fields || [];
    const maxOrder =
      fields.filter((f) => f.tab_id === currentTabId).length > 0
        ? Math.max(
            ...fields
              .filter((f) => f.tab_id === currentTabId)
              .map((f) => f.order_index),
          )
        : -1;

    createFieldMutation.mutate({
      form_id: id,
      tab_id: currentTabId,
      ...fieldData,
      order_index: maxOrder + 1,
    });
  };

  const handleDeleteTab = (tabId) => {
    if (confirm("Are you sure you want to delete this tab and all its contents?")) {
      deleteTabMutation.mutate(tabId);
    }
  };

  const handleDeleteField = (fieldId) => {
    if (confirm("Are you sure you want to delete this field?")) {
      deleteFieldMutation.mutate(fieldId);
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

          {formStructure && (
            <TreeView
              formStructure={formStructure}
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
