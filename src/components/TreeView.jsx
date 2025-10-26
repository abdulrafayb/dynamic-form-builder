import { useState } from "react";
import { FiPlus, FiMinus, FiChevronRight } from "react-icons/fi";

export default function TreeView({
  formData,
  onAddTab,
  onDeleteTab,
  onAddField,
  onDeleteField,
}) {
  const [expandedNodes, setExpandedNodes] = useState({
    header: true,
    lines: true,
    lineDetails: true,
  });

  const toggleNode = (key) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderField = (level, tabId, field) => {
    if (field.field_type === "table_column") {
      return (
        <div
          key={field.id}
          className="group ml-8 flex items-center justify-between rounded border-l border-gray-200 px-2 py-1 hover:bg-gray-50"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              [Column: {field.type}]
            </span>
            <span className="text-sm font-medium text-gray-700">
              {field.name}
            </span>
          </div>
          <button
            onClick={() => onDeleteField(level, tabId, field.id)}
            className="rounded p-1 text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50"
            title="Delete column"
          >
            <FiMinus className="text-sm" />
          </button>
        </div>
      );
    }
    return (
      <div
        key={field.id}
        className="group ml-8 flex items-center justify-between rounded px-2 py-1 hover:bg-gray-50"
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">[{field.field_type}]</span>
          <span className="text-sm font-medium text-gray-700">
            {field.field_name}
          </span>
          {field.is_required && <span className="text-xs text-red-500">*</span>}
        </div>
        <button
          onClick={() => onDeleteField(level, tabId, field.id)}
          className="rounded p-1 text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50"
          title="Delete field"
        >
          <FiMinus className="text-sm" />
        </button>
      </div>
    );
  };

  const renderTab = (level, tab) => {
    const fields = tab.fields || [];
    const hasChildren = fields.length > 0;
    const isExpanded = expandedNodes[tab.id];

    return (
      <div key={tab.id} className="ml-4">
        <div className="group flex items-center justify-between rounded px-2 py-1 hover:bg-blue-50">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleNode(tab.id)}
              className="focus:outline-none"
              disabled={!hasChildren}
            >
              <FiChevronRight
                className={`text-gray-400 transition-transform ${
                  isExpanded && hasChildren ? "rotate-90" : ""
                } ${!hasChildren ? "invisible" : ""}`}
              />
            </button>
            <span className="text-sm font-semibold text-blue-700">
              {tab.name}
            </span>
          </div>
          <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onAddField(level, tab.id)}
              className="rounded p-1 text-green-500 hover:bg-green-100"
              title="Add field"
            >
              <FiPlus className="text-sm" />
            </button>
            <button
              onClick={() => onDeleteTab(level, tab.id)}
              className="rounded p-1 text-red-500 hover:bg-red-100"
              title="Delete tab"
            >
              <FiMinus className="text-sm" />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {fields.map((field) => renderField(level, tab.id, field))}
          </div>
        )}
      </div>
    );
  };

  const renderLevel = (level, label) => {
    const tabs = formData[level] || [];
    const isExpanded = expandedNodes[level];

    return (
      <div key={level} className="mb-4">
        <div className="group hover:bg-gray-150 flex items-center justify-between rounded bg-gray-100 px-3 py-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleNode(level)}
              className="focus:outline-none"
              disabled={tabs.length === 0}
            >
              <FiChevronRight
                className={`text-gray-600 transition-transform ${
                  isExpanded && tabs.length > 0 ? "rotate-90" : ""
                } ${tabs.length === 0 ? "invisible" : ""}`}
              />
            </button>
            <span className="font-bold text-gray-800">{label}</span>
            <span className="text-sm text-gray-500">[{tabs.length}]</span>
          </div>
          <button
            onClick={() => onAddTab(level)}
            className="rounded p-1 text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-blue-100"
            title={`Add tab to ${label}`}
          >
            <FiPlus />
          </button>
        </div>

        {isExpanded && tabs.length > 0 && (
          <div className="mt-2 border-l-2 border-gray-300 pl-2">
            {tabs.map((tab) => renderTab(level, tab))}
          </div>
        )}

        {isExpanded && tabs.length === 0 && (
          <div className="mt-2 ml-4 text-sm text-gray-500">
            No tabs yet. Click + to add one.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {renderLevel("header", "Header")}
      {renderLevel("lines", "Lines")}
      {renderLevel("lineDetails", "Line Details")}
    </div>
  );
}
