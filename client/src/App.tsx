import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import { useAuth } from "@/hooks/useGoogleAuth";
import { useEffect } from "react";

function Router() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to home if not authenticated and trying to access dashboard
    if (!isAuthenticated && location.startsWith('/dashboard')) {
      setLocation('/');
    }

    // Redirect to dashboard if authenticated and on home page
    if (isAuthenticated && location === '/') {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, location, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
