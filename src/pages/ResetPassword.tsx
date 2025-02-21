import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Get the hash fragment, handling both single and double hash cases
        const hashFragment = window.location.hash.replace(/^#+/, '#');
        console.log("Original URL:", window.location.href);
        console.log("Processed hash fragment:", hashFragment);
        
        // Check if we're in a recovery flow
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("Current session:", session ? "exists" : "none");
        
        if (session?.user) {
          console.log("User already in recovery flow");
          setIsTokenValid(true);
          return;
        }
        
        if (!hashFragment || hashFragment === '#') {
          console.error("No hash fragment found in URL");
          throw new Error("Invalid password reset link. Please request a new one.");
        }

        // Parse the hash parameters (remove the leading #)
        const params = new URLSearchParams(hashFragment.substring(1));
        const accessToken = params.get("access_token");
        const type = params.get("type");
        const refreshToken = params.get("refresh_token");

        console.log("Reset parameters:", { 
          hasAccessToken: !!accessToken,
          type,
          hasRefreshToken: !!refreshToken,
          tokenLength: accessToken?.length
        });

        if (!accessToken || type !== "recovery") {
          console.error("Invalid token or type:", { hasToken: !!accessToken, type });
          throw new Error("Invalid or expired password reset link. Please request a new one.");
        }

        // Set the session with the access token
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        });

        if (setSessionError) {
          console.error("Session error:", setSessionError);
          throw new Error("Unable to validate reset token. Please request a new password reset link.");
        }

        console.log("Successfully validated reset token");
        setIsTokenValid(true);
      } catch (error: any) {
        console.error("Password reset setup error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        // Delay navigation to allow toast to be seen
        setTimeout(() => navigate("/"), 3000); // Increased delay for better visibility
      }
    };

    handlePasswordReset();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isTokenValid) {
      console.error("Attempted password reset with invalid token");
      toast({
        title: "Error",
        description: "Invalid reset token. Please request a new password reset link.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting to update password");
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error("Password update error:", error);
        throw error;
      }

      console.log("Password updated successfully");
      toast({
        title: "Success",
        description: "Your password has been reset successfully. Please sign in with your new password.",
      });

      // Sign out and redirect to home
      await supabase.auth.signOut();
      setTimeout(() => navigate("/"), 3000); // Increased delay for better visibility
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please request a new password reset link
            </p>
          </div>
        </div>
      </div>
    );
  }

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