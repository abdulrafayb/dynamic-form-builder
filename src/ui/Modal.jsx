import { IoClose } from "react-icons/io5";
import { useRef } from "react";

export default function Modal({ isOpen, onClose, children }) {
  const modalContentRef = useRef();

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (
      modalContentRef.current &&
      !modalContentRef.current.contains(e.target)
    ) {
      onClose();
    }
  };

  return (
    <div
      className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-600"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalContentRef}
        className="relative w-full max-w-sm rounded-lg bg-white p-8 shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-600"
        >
          <IoClose />
        </button>
        {children}
      </div>
    </div>
  );
}
