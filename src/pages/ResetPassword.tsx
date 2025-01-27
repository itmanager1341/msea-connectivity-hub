import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for token in both URL formats
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    
    const accessToken = hashParams.get("access_token") || queryParams.get("token");
    const refreshToken = hashParams.get("refresh_token");
    
    console.log("Reset password page loaded", { accessToken, type: accessToken ? "Found token" : "No token" });
    
    if (!accessToken) {
      console.error("No reset token found in URL");
      toast({
        title: "Error",
        description: "Invalid or missing reset token. Please request a new password reset link.",
        variant: "destructive",
      });
      navigate("/login");
    }
    
    // If we have an access token, set the session
    if (accessToken) {
      if (refreshToken) {
        // Handle hash-based token (old format)
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      } else {
        // Handle query-based token (new format)
        // The token will be automatically handled by Supabase
        console.log("Using query parameter token");
      }
    }
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error("Error updating password:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Your password has been reset successfully. Please log in with your new password.",
      });

      // Sign out the user and redirect to login
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your new password below
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="new-password"
                  type="password"
                  className="pl-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirm-password"
                  type="password"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;