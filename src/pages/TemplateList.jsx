import { FaTrashAlt } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { HiArrowLeft } from "react-icons/hi";

import { createForm, deleteForm, getForms } from "../services/apiForm";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function TemplateList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { isLoading, data: forms } = useQuery({
    queryKey: ["forms"],
    queryFn: getForms,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [formToDeleteId, setFormToDeleteId] = useState(null);

  const {
    mutate,
    isLoading: isCreating,

    reset: resetCreateMutation,
  } = useMutation({
    mutationFn: createForm,
    onSuccess: () => {
      setTemplateName("");
      setIsCreateModalOpen(false);
      toast.success("Form template created successfully!");
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
    onError: (err) => {
      console.error("Error creating form:", err.message);
      toast.error(`Failed to create form: ${err.message}`);
    },
  });

  const {
    mutate: deleteMutate,
    isLoading: isDeleting,

    reset: resetDeleteMutation,
  } = useMutation({
    mutationFn: deleteForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      setIsConfirmModalOpen(false);
      setFormToDeleteId(null);
      toast.success("Form deleted successfully!");
    },
    onError: (err) => {
      console.error("Error deleting form:", err.message);
      toast.error(`Failed to delete form: ${err.message}`);
    },
  });

  const handleAddFormClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setTemplateName("");
    resetCreateMutation();
  };

  const handleCreateTemplate = () => {
    if (!templateName.trim()) {
      toast.error("Template name is required.");
      return;
    }

    mutate(templateName);
  };

  const handleDeleteFormClick = (id) => {
    setFormToDeleteId(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (formToDeleteId) {
      deleteMutate(formToDeleteId);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setFormToDeleteId(null);
    resetDeleteMutation();
  };

  const handleCardClick = (id) => {
    navigate(`/create-template/${id}`);
  };

  if (isLoading) return null;

  return (
    <section className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8 flex justify-between">
        <Button onClick={() => navigate(-1)}>
          <HiArrowLeft />
        </Button>
        <Button onClick={handleAddFormClick}>
          <FiPlus />
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-10">
        {forms.map((data) => (
          <div
            key={data.id}
            className="relative cursor-pointer rounded-lg border border-gray-200 bg-white p-8 text-lg font-normal text-gray-800 shadow-sm transition-shadow duration-200 hover:shadow-md"
            onClick={() => handleCardClick(data.id)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFormClick(data.id);
              }}
              disabled={isDeleting}
              className="absolute top-3.5 right-3.5 z-10 text-xl font-bold text-gray-400 transition-colors duration-200 hover:text-red-600"
              title="Delete Form"
            >
              <FaTrashAlt />
            </button>
            <h3 className="mb-2 font-semibold">Name:</h3>
            <p className="text-xl">
              <span className="font-medium">{data.templateName}</span>
            </p>
          </div>
        ))}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal}>
        <h2 className="mb-4 text-2xl font-bold">Create New Template</h2>
        <div className="mb-4">
          <label
            htmlFor="templateName"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            Insert Template Name
          </label>
          <input
            type="text"
            id="templateName"
            className={`focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none`}
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g., Invoice Template"
            disabled={isCreating}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleCreateTemplate} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isConfirmModalOpen} onClose={handleCancelDelete}>
        <h2 className="mb-4 text-2xl font-bold">Confirm Deletion</h2>
        <p className="mb-6 text-gray-700">
          Are you sure you want to delete this form? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-4">
          <Button onClick={handleCancelDelete} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="border-red-600 bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
