import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useGoogleAuth";
import { useToast } from "@/hooks/use-toast";

const AuthView: React.FC = () => {
  const { initiateLogin, loading } = useAuth();
  const { toast } = useToast();

  const handleLogin = async () => {
    try {
      await initiateLogin();
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Could not connect to Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fade-in">
      <div className="max-w-2xl mx-auto py-12">
        {/* Welcome illustration */}
        <div className="mb-8 text-center">
          <svg
            className="mx-auto w-64 h-64"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="100" height="100" fill="#f5f9ff" rx="10" ry="10" />
            <g transform="translate(20, 20) scale(0.6)">
              {/* Gmail Logo */}
              <path
                d="M10,10 L90,10 L90,90 L10,90 L10,10 Z"
                fill="#ffffff"
                stroke="#e0e0e0"
                strokeWidth="2"
              />
              <path
                d="M10,10 L50,45 L90,10 L90,90 L10,90 L10,10 Z"
                fill="none"
                stroke="#ea4335"
                strokeWidth="6"
              />
              <path
                d="M10,10 L50,45 L90,10"
                fill="none"
                stroke="#ea4335"
                strokeWidth="6"
              />
              {/* Broom */}
              <path
                d="M80,60 L60,80"
                stroke="#4285f4"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M60,80 C60,80 65,85 70,90 C75,95 80,90 75,85 C70,80 65,75 65,75"
                fill="#fbbc05"
                stroke="#4285f4"
                strokeWidth="1"
              />
              {/* Trash bin */}
              <rect
                x="30"
                y="60"
                width="20"
                height="25"
                fill="#9aa0a6"
                rx="2"
                ry="2"
              />
              <rect
                x="28"
                y="57"
                width="24"
                height="3"
                fill="#5f6368"
                rx="1"
                ry="1"
              />
              <line
                x1="35"
                y1="65"
                x2="35"
                y2="80"
                stroke="#ffffff"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <line
                x1="45"
                y1="65"
                x2="45"
                y2="80"
                stroke="#ffffff"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              {/* Small envelope in trash */}
              <path
                d="M33,70 L37,73 L41,70 L41,74 L33,74 L33,70 Z"
                fill="#ffffff"
                stroke="#e0e0e0"
                strokeWidth="0.5"
              />
            </g>
          </svg>
        </div>

        <div className="bg-surface rounded-xl shadow-card p-8">
          <h2 className="font-sans text-2xl font-medium text-text-primary mb-4">
            Welcome to Gmail Declutter
          </h2>

          <p className="text-text-secondary mb-6">
            Gmail Declutter helps you clean up your inbox by identifying and
            removing unnecessary emails while preserving important ones. Connect
            your Gmail account to get started.
          </p>

          {/* Permission explanations */}
          <div className="bg-background rounded-lg p-4 mb-6">
            <h3 className="font-sans text-base font-medium text-text-primary mb-2">
              Required Permissions
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="h-5 w-5 text-primary mt-0.5 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-text-primary text-sm font-medium">
                    View and manage your mail
                  </p>
                  <p className="text-text-secondary text-xs">
                    Required to analyze your emails and help you declutter your
                    inbox
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="h-5 w-5 text-primary mt-0.5 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-text-primary text-sm font-medium">
                    View your email address
                  </p>
                  <p className="text-text-secondary text-xs">
                    Required to identify your account
                  </p>
                </div>
              </li>
            </ul>
            <div className="mt-4 text-xs text-text-secondary">
              <p>
                We never store your email content. All processing is done
                securely and we only keep metadata for your declutter rules.
              </p>
            </div>
          </div>

          {/* Authentication button */}
          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              className="inline-flex items-center justify-center text-base"
              onClick={handleLogin}
              disabled={loading}
            >
              <svg
                className="w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              {loading ? "Connecting..." : "Sign in with Google"}
            </Button>
          </div>
        </div>

        {/* Security note */}
        <div className="mt-6 flex items-center justify-center text-text-secondary text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-4 w-4 mr-1"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0110 0v4"></path>
          </svg>
          <span>Secure authentication via Google OAuth 2.0</span>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
