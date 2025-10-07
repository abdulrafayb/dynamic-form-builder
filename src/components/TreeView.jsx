import { useState } from "react";
import { FiPlus, FiMinus, FiChevronRight } from "react-icons/fi";

export default function TreeView({
  formStructure,
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

  const getTabsForLevel = (level) => {
    return formStructure.tabs.filter(
      (tab) => tab.level === level && !tab.parent_tab_id,
    );
  };

  const getFieldsForTab = (tabId) => {
    return formStructure.fields.filter((field) => field.tab_id === tabId);
  };

  const getChildTabs = (parentTabId) => {
    return formStructure.tabs.filter((tab) => tab.parent_tab_id === parentTabId);
  };

  const renderField = (field) => {
    return (
      <div
        key={field.id}
        className="group ml-8 flex items-center justify-between rounded py-1 px-2 hover:bg-gray-50"
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            [{field.field_type}]
          </span>
          <span className="text-sm font-medium text-gray-700">
            {field.field_name}
          </span>
          {field.is_required && (
            <span className="text-xs text-red-500">*</span>
          )}
        </div>
        <button
          onClick={() => onDeleteField(field.id)}
          className="opacity-0 rounded p-1 text-red-500 transition-opacity hover:bg-red-50 group-hover:opacity-100"
          title="Delete field"
        >
          <FiMinus className="text-sm" />
        </button>
      </div>
    );
  };

  const renderTab = (tab, depth = 0) => {
    const fields = getFieldsForTab(tab.id);
    const childTabs = getChildTabs(tab.id);
    const hasChildren = fields.length > 0 || childTabs.length > 0;
    const isExpanded = expandedNodes[tab.id];

    return (
      <div key={tab.id} className="ml-4">
        <div className="group flex items-center justify-between rounded py-1 px-2 hover:bg-blue-50">
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
              onClick={() => onAddTab(tab.level, tab.id)}
              className="rounded p-1 text-blue-500 hover:bg-blue-100"
              title="Add sub-tab"
            >
              <FiPlus className="text-sm" />
            </button>
            <button
              onClick={() => onAddField(tab.id)}
              className="rounded p-1 text-green-500 hover:bg-green-100"
              title="Add field"
            >
              <FiPlus className="text-sm" />
            </button>
            <button
              onClick={() => onDeleteTab(tab.id)}
              className="rounded p-1 text-red-500 hover:bg-red-100"
              title="Delete tab"
            >
              <FiMinus className="text-sm" />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {childTabs.map((childTab) => renderTab(childTab, depth + 1))}
            {fields.map((field) => renderField(field))}
          </div>
        )}
      </div>
    );
  };

  const renderLevel = (level, label) => {
    const tabs = getTabsForLevel(level);
    const isExpanded = expandedNodes[level];

    return (
      <div key={level} className="mb-4">
        <div className="group flex items-center justify-between rounded bg-gray-100 py-2 px-3 hover:bg-gray-150">
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
            className="rounded p-1 text-blue-600 opacity-0 transition-opacity hover:bg-blue-100 group-hover:opacity-100"
            title={`Add tab to ${label}`}
          >
            <FiPlus />
          </button>
        </div>

        {isExpanded && tabs.length > 0 && (
          <div className="mt-2 border-l-2 border-gray-300 pl-2">
            {tabs.map((tab) => renderTab(tab))}
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
