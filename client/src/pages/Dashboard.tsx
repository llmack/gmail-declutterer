import React, { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingState from "@/components/LoadingState";
import DashboardContent from "@/components/DashboardContent";
import PreviewDeleteModal from "@/components/PreviewDeleteModal";
import { useEmailAnalysis } from "@/hooks/useEmailAnalysis";
import { useAuth } from "@/hooks/useGoogleAuth";
import { useLocation } from "wouter";

const Dashboard: React.FC = () => {
  const { userInfo } = useAuth();
  const { loading, loadingMessage } = useEmailAnalysis();
  const [, setLocation] = useLocation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!userInfo.isAuthenticated) {
      setLocation("/");
    }
  }, [userInfo.isAuthenticated, setLocation]);

  if (!userInfo.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showProfile={true} />
      <main className="flex-grow container mx-auto px-4 py-6">
        {loading ? (
          <LoadingState message={loadingMessage} />
        ) : (
          <DashboardContent />
        )}
        <PreviewDeleteModal />
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
