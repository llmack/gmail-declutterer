import React from "react";

interface StatsCardProps {
  title: string;
  value: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value }) => {
  return (
    <div className="bg-background rounded-lg p-4">
      <p className="text-text-secondary text-sm mb-1">{title}</p>
      <p className="font-sans text-2xl font-medium text-text-primary">{value}</p>
    </div>
  );
};

export default StatsCard;
