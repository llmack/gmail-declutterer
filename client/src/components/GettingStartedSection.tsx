import React from "react";

const GettingStartedSection: React.FC = () => {
  const steps = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      ),
      title: "Analyze",
      description: "Scan your inbox to find all email categories",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      ),
      title: "Configure",
      description: "Create rules for which emails to clean up",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
      title: "Clean",
      description: "Preview and safely remove unwanted emails",
    },
  ];

  return (
    <div className="bg-surface rounded-xl shadow-card p-6">
      <h3 className="font-sans text-lg font-medium text-text-primary mb-4">
        Getting Started
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-3 text-primary">
              {step.icon}
            </div>
            <h4 className="font-sans text-base font-medium text-text-primary mb-1">
              {step.title}
            </h4>
            <p className="text-sm text-text-secondary">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GettingStartedSection;
