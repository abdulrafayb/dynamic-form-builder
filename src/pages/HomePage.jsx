import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const Card = ({ title, description, onClick }) => (
    <div
      onClick={onClick}
      className="transform cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md"
    >
      <h2 className="mb-2 text-xl font-semibold text-gray-800">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-10 text-center text-4xl font-extrabold text-gray-900">
        Dynamic Form Builder
      </h1>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        <Card
          title="Create New Form Template"
          description="Design and build custom forms with a drag-and-drop interface."
          onClick={() => navigate("/template-list")}
        />
        <Card
          title="Insert Data Into Saved Forms Templates"
          description="Browse and manage all your previously created form templates."
          onClick={() => navigate("/form-list")}
        />
        <Card
          title="View Data Collected From Forms"
          description="Inspect and interact with data collected from your forms."
          onClick={() => navigate("/table-view")}
        />
      </div>
    </div>
  );
}

export default HomePage;
