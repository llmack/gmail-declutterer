import React from 'react';

const FeatherIcon: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M90 30C85 25 75 30 70 35C65 40 55 60 45 75C35 90 25 100 20 105"
        stroke="#444444"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M20 105C25 100 45 85 60 70C75 55 85 45 90 30"
        stroke="#444444"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M90 30C95 25 100 25 105 30C110 35 105 45 100 50C95 55 80 65 65 80C50 95 35 105 30 110"
        stroke="#444444"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M25 100C30 95 45 85 55 75"
        stroke="#444444"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M35 95C40 90 50 80 60 70"
        stroke="#444444"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M48 87C53 82 63 72 68 67"
        stroke="#444444"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M60 80C65 75 70 70 75 65"
        stroke="#444444"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M70 75C75 70 80 65 85 60"
        stroke="#444444"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M80 65C85 60 90 55 95 50"
        stroke="#444444"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        fill="#FFFFFF"
        d="M90 30C85 25 75 30 70 35C65 40 55 60 45 75C35 90 25 100 20 105C25 100 45 85 60 70C75 55 85 45 90 30Z"
      />
      <path
        fill="#FFFFFF"
        d="M90 30C95 25 100 25 105 30C110 35 105 45 100 50C95 55 80 65 65 80C50 95 35 105 30 110"
      />
      {/* Cute face on the feather */}
      <circle cx="90" cy="40" r="1.5" fill="#444444" />
      <circle cx="96" cy="40" r="1.5" fill="#444444" />
      <path
        d="M91 45C92.5 46.5 94.5 46.5 96 45"
        stroke="#444444"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default FeatherIcon;
