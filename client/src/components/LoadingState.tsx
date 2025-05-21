import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="py-16 flex flex-col items-center justify-center">
      <div className="flex space-x-2 mb-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 bg-[#4285F4] rounded-full inline-block animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <p className="text-gray-600 text-center">
        Analyzing your inbox to find decluttering opportunities...
      </p>
    </div>
  );
};

export default LoadingState;
