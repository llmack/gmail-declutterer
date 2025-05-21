import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemporaryCodeEmail } from '@/lib/types';
import { getDaysAgoText } from '@/lib/utils';
import PreviewModal from './PreviewModal';

interface EmailCategoryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  emails: TemporaryCodeEmail[];
  onCleanup: (emailIds: string[]) => void;
  isLoading?: boolean;
}

const EmailCategoryCard: React.FC<EmailCategoryCardProps> = ({
  icon,
  title,
  description,
  emails,
  onCleanup,
  isLoading = false
}) => {
  const [showPreview, setShowPreview] = useState(false);
  
  const handleCleanup = () => {
    const emailIds = emails.map(email => email.id);
    onCleanup(emailIds);
  };

  return (
    <>
      <Card className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-[#4285F4] mr-2">{icon}</span>
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600 mr-2">{emails.length}</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-[#4285F4]">
                {emails.length > 0 ? 'Found' : 'None found'}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Sender</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Subject</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {emails.length > 0 ? (
                emails.slice(0, 3).map((email) => (
                  <tr key={email.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{email.sender}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{email.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{getDaysAgoText(email.daysAgo)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-sm text-center text-gray-600">
                    No temporary code emails found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <CardFooter className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center">
          <div>
            {emails.length > 3 && (
              <Button 
                variant="link" 
                className="text-sm text-[#4285F4] hover:text-blue-700 font-medium p-0"
                onClick={() => setShowPreview(true)}
              >
                View all
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="px-3 py-1.5 text-sm rounded-md bg-neutral-100 border border-neutral-300 hover:bg-neutral-200 transition-colors duration-200"
              onClick={() => setShowPreview(true)}
              disabled={emails.length === 0 || isLoading}
            >
              Preview
            </Button>
            <Button
              variant="default"
              size="sm"
              className="px-3 py-1.5 text-sm rounded-md bg-[#4285F4] text-white hover:bg-blue-600 transition-colors duration-200"
              onClick={handleCleanup}
              disabled={emails.length === 0 || isLoading}
            >
              {isLoading ? 'Processing...' : 'Clean up'}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleCleanup}
        emails={emails}
        title={`Preview ${title} Cleanup`}
        isLoading={isLoading}
      />
    </>
  );
};

export default EmailCategoryCard;
