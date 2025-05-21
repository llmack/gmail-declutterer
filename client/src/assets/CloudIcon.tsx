import React from 'react';

const CloudIcon: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 120 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M30 40C18.95 40 10 31.05 10 20C10 8.95 18.95 0 30 0C39.15 0 46.85 6.15 49.35 14.65C52.35 11.55 56.5 10 60 10C67.2 10 73.3 14.95 75.1 21.75C76.65 21.25 78.3 21 80 21C91.05 21 100 29.95 100 41C100 52.05 91.05 61 80 61H30C18.95 61 10 52.05 10 41C10 40.65 10.05 40.35 10.05 40H30Z"
        fill="#FFFFFF"
        stroke="#AAAAAA"
        strokeWidth="2"
      />
    </svg>
  );
};

export default CloudIcon;
