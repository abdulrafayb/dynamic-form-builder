import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

const FIELD_TYPES = [
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
];

export default function FieldModal({ isOpen, onClose, onSubmit }) {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [placeholder, setPlaceholder] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState("");

  const needsOptions = ["select", "radio", "checkbox"].includes(fieldType);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fieldName.trim()) {
      const fieldData = {
        field_name: fieldName.trim(),
        field_type: fieldType,
        field_placeholder: placeholder.trim() || null,
        is_required: isRequired,
        field_options: needsOptions
          ? options
              .split("\n")
              .map((opt) => opt.trim())
              .filter((opt) => opt)
          : null,
      };
      onSubmit(fieldData);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setFieldName("");
    setFieldType("text");
    setPlaceholder("");
    setIsRequired(false);
    setOptions("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">
        Add Form Field
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="fieldName"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Field Name
          </label>
          <input
            type="text"
            id="fieldName"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            placeholder="e.g., Full Name, Email Address"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            autoFocus
          />
        </div>

        <div>
          <label
            htmlFor="fieldType"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Field Type
          </label>
          <select
            id="fieldType"
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {FIELD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {!needsOptions && (
          <div>
            <label
              htmlFor="placeholder"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Placeholder (Optional)
            </label>
            <input
              type="text"
              id="placeholder"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="e.g., Enter your name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        )}

        {needsOptions && (
          <div>
            <label
              htmlFor="options"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Options (one per line)
            </label>
            <textarea
              id="options"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isRequired"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <label
            htmlFor="isRequired"
            className="ml-2 text-sm font-medium text-gray-700"
          >
            Required Field
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" onClick={handleClose} variant="secondary">
            Cancel
          </Button>
          <Button type="submit" disabled={!fieldName.trim()}>
            Add Field
          </Button>
        </div>
      </form>
    </Modal>
  );
}
