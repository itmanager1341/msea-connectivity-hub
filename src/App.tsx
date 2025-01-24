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
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

function App() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setShowAuth(false); // Hide auth modal when user is logged in
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/resources" element={<Resources />} />
          <Route
            path="/admin"
            element={
              session ? (
                <AdminPortal />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/portal/*"
            element={
              session ? (
                <MemberPortal />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
        {showAuth && !session && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg w-full max-w-md mx-4">
              <Auth onClose={() => setShowAuth(false)} />
            </div>
          </div>
        )}
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;