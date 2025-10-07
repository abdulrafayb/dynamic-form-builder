export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
}) {
  const baseClasses =
    "cursor-pointer rounded-lg px-8 py-2 text-lg font-medium shadow-sm transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

  const variantClasses = {
    primary:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:hover:bg-white",
    secondary:
      "border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:hover:bg-gray-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
}
