import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mail, 
  Key, 
  Bell, 
  Tag, 
  Newspaper, 
  MessageSquare,
  BarChart,
  FileText
} from 'lucide-react';

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts: {
    tempCodes?: number;
    subscriptions?: number;
    promotions?: number;
    newsletters?: number;
    regular?: number;
    receipts?: number;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeCategory, 
  onCategoryChange,
  categoryCounts
}) => {
  const categories = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: <BarChart className="h-5 w-5" />,
      count: undefined
    },
    { 
      id: 'temp-codes', 
      name: 'Temporary Codes', 
      icon: <Key className="h-5 w-5" />,
      count: categoryCounts.tempCodes
    },
    { 
      id: 'subscriptions', 
      name: 'Subscriptions', 
      icon: <Bell className="h-5 w-5" />,
      count: categoryCounts.subscriptions
    },
    { 
      id: 'promotions', 
      name: 'Promotions', 
      icon: <Tag className="h-5 w-5" />,
      count: categoryCounts.promotions
    },
    { 
      id: 'newsletters', 
      name: 'Newsletters', 
      icon: <Newspaper className="h-5 w-5" />,
      count: categoryCounts.newsletters
    },
    { 
      id: 'receipts', 
      name: 'Orders & Receipts', 
      icon: <FileText className="h-5 w-5" />,
      count: categoryCounts.receipts
    },
    { 
      id: 'regular', 
      name: 'Regular Emails', 
      icon: <MessageSquare className="h-5 w-5" />,
      count: categoryCounts.regular
    }
  ];

  return (
    <div className="hidden md:block w-64 border-r border-gray-200 h-full">
      <div className="px-6 py-5">
        <h2 className="text-lg font-medium flex items-center">
          <Mail className="mr-2 h-5 w-5 text-[#4285F4]" />
          Email Categories
        </h2>
      </div>
      <ScrollArea className="h-[calc(100vh-9rem)]">
        <div className="px-3 py-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                flex items-center justify-between w-full p-3 rounded-md text-left mb-1
                ${activeCategory === category.id 
                  ? 'bg-[#4285F4]/10 text-[#4285F4]' 
                  : 'hover:bg-gray-100 text-gray-700'
                }
              `}
            >
              <div className="flex items-center">
                <span className={`mr-3 ${activeCategory === category.id ? 'text-[#4285F4]' : 'text-gray-500'}`}>
                  {category.icon}
                </span>
                <span>{category.name}</span>
              </div>
              {category.count !== undefined && (
                <span className={`
                  text-xs rounded-full px-2 py-0.5
                  ${activeCategory === category.id 
                    ? 'bg-[#4285F4] text-white' 
                    : 'bg-gray-200 text-gray-700'
                  }
                `}>
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;