import { useState, useEffect } from "react";
import Modal from "./Modal";
import Button from "./Button";

export default function FieldModal({
  isOpen,
  onClose,
  onSubmit,
  availableFieldTypes,
  fieldToEdit, // New prop to receive field data for editing
}) {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState(
    availableFieldTypes[0]?.value || "text",
  );
  const [placeholder, setPlaceholder] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState("");
  const [columnNames, setColumnNames] = useState(""); // New state for column names
  const [rowCount, setRowCount] = useState(1); // New state for row count

  // Effect to populate form when fieldToEdit changes (for editing)
  useEffect(() => {
    if (fieldToEdit) {
      setFieldName(fieldToEdit.field_name || "");
      setFieldType(
        fieldToEdit.field_type || availableFieldTypes[0]?.value || "text",
      );
      setPlaceholder(fieldToEdit.field_placeholder || "");
      setIsRequired(fieldToEdit.is_required || false);
      setOptions(
        fieldToEdit.field_options ? fieldToEdit.field_options.join("\n") : "",
      );
      setColumnNames(
        fieldToEdit.columnNames ? fieldToEdit.columnNames.join(",") : "",
      );
      setRowCount(fieldToEdit.rowCount || 1);
    } else {
      resetForm();
    }
  }, [fieldToEdit, availableFieldTypes]);

  const needsOptions = ["select", "radio", "checkbox"].includes(fieldType);
  const isTableField = fieldType === "table"; // New variable to check if field type is table

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fieldName.trim() || isTableField) {
      const fieldData = {
        field_name: isTableField ? "" : fieldName.trim(),
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

      if (isTableField) {
        fieldData.columnNames = columnNames
          .split(",")
          .map((name) => name.trim());
        fieldData.rowCount = rowCount;
        fieldData.tableData = Array(rowCount).fill({}); // Initialize table data
      }

      onSubmit(fieldData);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setFieldName("");
    setFieldType(availableFieldTypes[0]?.value || "text");
    setPlaceholder("");
    setIsRequired(false);
    setOptions("");
    setColumnNames(""); // Reset column names
    setRowCount(1); // Reset row count
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">
        {fieldToEdit ? "Edit Form Field" : "Add Form Field"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isTableField && (
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              autoFocus
            />
          </div>
        )}

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
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            disabled={!!fieldToEdit} // Disable field type editing when editing a field
          >
            {availableFieldTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {!isTableField && !needsOptions && (
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>
        )}

        {!isTableField && needsOptions && (
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>
        )}

        {isTableField && (
          <>
            <div className="mb-6">
              <label
                htmlFor="columnNames"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Column Names (comma-separated)
              </label>
              <input
                type="text"
                id="columnNames"
                value={columnNames}
                onChange={(e) => setColumnNames(e.target.value)}
                placeholder="e.g., Name, Age, City"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="rowCount"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Number of Rows
              </label>
              <input
                type="number"
                id="rowCount"
                value={rowCount}
                onChange={(e) => setRowCount(Number(e.target.value))}
                min="1"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>
          </>
        )}

        {!isTableField && (
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
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <Button type="submit" disabled={!fieldName.trim() && !isTableField}>
            {fieldToEdit ? "Update Field" : "Add Field"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
