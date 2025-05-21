import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthView from "@/components/AuthView";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <AuthView />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
