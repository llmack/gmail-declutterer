import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 py-4">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-xs text-gray-500 mb-2 md:mb-0">
          © {new Date().getFullYear()} Gmail Declutter. Not affiliated with Google.
        </p>
        <div className="flex space-x-4">
          <Link href="/privacy">
            <a className="text-xs text-[#4285F4] hover:underline">Privacy Policy</a>
          </Link>
          <Link href="/terms">
            <a className="text-xs text-[#4285F4] hover:underline">Terms of Service</a>
          </Link>
          <Link href="/help">
            <a className="text-xs text-[#4285F4] hover:underline">Help</a>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
