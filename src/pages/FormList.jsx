import React, { useEffect, useState } from "react";
import { getTablesData } from "../services/apiTables";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { deleteForm } from "../services/apiForm";
import Modal from "../ui/Modal";
import { FaTrashAlt } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { HiArrowLeft } from "react-icons/hi";
import Button from "../ui/Button";

function FormList() {
  const [tableData, setTableData] = useState([]);
  const navigate = useNavigate();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [formToDeleteId, setFormToDeleteId] = useState(null);

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

  async function handleDelete(id, e) {
    e.stopPropagation(); // Prevent navigation when delete is clicked
    setFormToDeleteId(id);
    setIsConfirmModalOpen(true);
  }

  async function confirmDelete() {
    if (formToDeleteId) {
      try {
        await deleteForm(formToDeleteId);
        setTableData((prevData) =>
          prevData.filter((item) => item.id !== formToDeleteId),
        );
        toast.success("Form successfully deleted!");
        setIsConfirmModalOpen(false);
        setFormToDeleteId(null);
      } catch (error) {
        toast.error("Error deleting form: " + error.message);
      }
    }
  }

  function cancelDelete() {
    setIsConfirmModalOpen(false);
    setFormToDeleteId(null);
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <Button onClick={() => navigate(-1)}>
          <HiArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">Saved Form Tables</h1>
      </div>
      {tableData.length === 0 ? (
        <p className="text-gray-600">No saved form data available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tableData.map((item) => (
            <div
              key={item.id}
              className="relative cursor-pointer rounded-lg border border-gray-200 bg-white p-8 text-lg font-normal text-gray-800 shadow-sm transition-shadow hover:shadow-md"
              onClick={() => navigate(`/form-detail/${item.id}`)}
            >
              <h2 className="text-lg font-semibold text-gray-800">
                Table ID: {item.id}
              </h2>
              <p className="text-sm text-gray-600">
                Last Updated: {new Date(item.createdAt).toLocaleDateString()}
              </p>
              <button
                onClick={(e) => handleDelete(item.id, e)}
                className="focus:ring-opacity-50 absolute top-3.5 right-3.5 z-10 text-xl font-bold text-gray-400 transition-colors duration-200 hover:text-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
                title="Delete Form"
              >
                <FaTrashAlt />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isConfirmModalOpen} onClose={cancelDelete}>
        <h2 className="mb-4 text-2xl font-bold">Confirm Deletion</h2>
        <p className="mb-6 text-gray-700">
          Are you sure you want to delete this form? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={cancelDelete}
            className="rounded px-4 py-2 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default FormList;
