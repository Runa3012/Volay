import React from "react";

interface BackArrowProps {
  className?: string;
}

const BackArrow: React.FC<BackArrowProps> = ({ className = "w-10 h-10 text-black" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
};

export default BackArrow;
