import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import About from "./pages/About";
import Directory from "./pages/Directory";
import Resources from "./pages/Resources";
import AdminPortal from "./pages/AdminPortal";
import MemberPortal from "./pages/MemberPortal";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

function App() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Initializing auth state...");
    
    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("Session check completed", { session, error });
      if (error) {
        console.error("Session check error:", error);
        setError(error.message);
      }
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session);
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (isLoading && !session) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/resources" element={<Resources />} />
          
          {/* Auth routes */}
          <Route 
            path="/login" 
            element={session ? <Navigate to="/portal" replace /> : <Auth />} 
          />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route
            path="/admin"
            element={session ? <AdminPortal /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/portal/*"
            element={session ? <MemberPortal /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;