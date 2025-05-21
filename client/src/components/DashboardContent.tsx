import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useGoogleAuth";
import { useEmailAnalysis } from "@/hooks/useEmailAnalysis";
import StatsCard from "@/components/StatsCard";
import TemporaryCodeEmailsSection from "@/components/TemporaryCodeEmailsSection";
import GettingStartedSection from "@/components/GettingStartedSection";
import { useToast } from "@/hooks/use-toast";
import { formatBytes } from "@/lib/utils";

const DashboardContent: React.FC = () => {
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const {
    emailStats,
    analyzeEmails,
    analyzing,
    tempCodeEmails,
    fetchTempCodeEmails,
    loadingTempCodeEmails
  } = useEmailAnalysis();

  const handleAnalyze = async () => {
    try {
      await analyzeEmails();
      toast({
        title: "Analysis Complete",
        description: "Your inbox has been analyzed successfully.",
      });
      fetchTempCodeEmails();
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze your emails. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fade-in">
      {/* Welcome & quick stats */}
      <div className="mb-8">
        <h2 className="font-sans text-2xl font-medium text-text-primary mb-2">
          Hello, {userInfo.name?.split(" ")[0] || "User"}
        </h2>
        <p className="text-text-secondary">Let's clean up your Gmail inbox</p>
      </div>

      {/* Email analysis section */}
      <div className="bg-surface rounded-xl shadow-card p-6 mb-8">
        <h3 className="font-sans text-lg font-medium text-text-primary mb-4">
          Inbox Analysis
        </h3>

        {/* Email statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Emails"
            value={emailStats?.totalEmails?.toLocaleString() || "N/A"}
          />
          <StatsCard
            title="Storage Used"
            value={emailStats ? formatBytes(emailStats.storageUsed) : "N/A"}
          />
          <StatsCard
            title="Potential Cleanup"
            value={emailStats ? formatBytes(emailStats.potentialCleanup) : "N/A"}
          />
          <StatsCard
            title="Temporary Codes"
            value={emailStats?.tempCodeCount?.toLocaleString() || "0"}
          />
        </div>

        {/* Analysis CTAs */}
        <div className="flex flex-wrap gap-3">
          <Button
            className="inline-flex items-center justify-center"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="mr-1 h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {analyzing ? "Analyzing..." : "Analyze Inbox"}
          </Button>

          <Button variant="outline" className="inline-flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="mr-1 h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            Configure Rules
          </Button>
        </div>
      </div>

      {/* Temporary Code Emails Section */}
      <TemporaryCodeEmailsSection
        emails={tempCodeEmails}
        loading={loadingTempCodeEmails}
        refreshEmails={fetchTempCodeEmails}
      />

      {/* Getting Started Section */}
      <GettingStartedSection />
    </div>
  );
};

export default DashboardContent;
