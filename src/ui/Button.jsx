export default function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-gray-300 bg-white px-8 py-2 text-lg font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-100"
    >
      {children}
    </button>
  );
}
