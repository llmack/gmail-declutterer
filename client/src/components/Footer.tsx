import React from "react";
import { Link } from "wouter";

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-border py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-text-secondary text-sm mb-2 md:mb-0">
            © {new Date().getFullYear()} Gmail Declutter
          </p>
          <div className="flex items-center space-x-4">
            <Link href="#" className="text-text-secondary hover:text-primary text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-text-secondary hover:text-primary text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-text-secondary hover:text-primary text-sm transition-colors">
              Help
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
