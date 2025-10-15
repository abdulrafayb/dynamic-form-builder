import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

export default function TabModal({ isOpen, onClose, onSubmit, level }) {
  const [tabName, setTabName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tabName.trim()) {
      onSubmit(tabName.trim());
      setTabName("");
      onClose();
    }
  };

  const handleClose = () => {
    setTabName("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">Add New Tab</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label
            htmlFor="tabName"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Tab Name
          </label>
          <input
            type="text"
            id="tabName"
            value={tabName}
            onChange={(e) => setTabName(e.target.value)}
            placeholder={`Enter tab name for ${level}`}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-3">
          <Button type="button" onClick={handleClose} variant="secondary">
            Cancel
          </Button>
          <Button type="submit" disabled={!tabName.trim()}>
            Add Tab
          </Button>
        </div>
      </form>
    </Modal>
  );
}
