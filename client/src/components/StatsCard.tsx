import React from 'react';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color = 'text-[#4285F4]' }) => {
  return (
    <Card className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-medium ${color === 'text-[#4285F4]' ? 'text-gray-900' : color}`}>
            {value}
          </p>
        </div>
        <div className={`text-2xl ${color}`}>{icon}</div>
      </div>
    </Card>
  );
};

export default StatsCard;
