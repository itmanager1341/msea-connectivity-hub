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
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      // Get the full URL for debugging
      const fullUrl = window.location.href;
      console.log("Full URL:", fullUrl);

      // Parse both hash and query parameters
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      
      // Check both locations for the token
      const accessToken = hashParams.get("access_token") || queryParams.get("token");
      const refreshToken = hashParams.get("refresh_token");
      const type = queryParams.get("type");
      
      console.log("Token check:", { 
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        type,
        tokenLocation: accessToken ? (hashParams.get("access_token") ? "hash" : "query") : "none"
      });

      if (!accessToken) {
        console.error("No reset token found in URL");
        toast({
          title: "Error",
          description: "Invalid or missing reset token. Please request a new password reset link.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      try {
        if (refreshToken) {
          // Handle hash-based token (old format)
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          console.log("Session set successfully with hash token");
        } else {
          // Handle query-based token (new format)
          const { error } = await supabase.auth.verifyOtp({
            token_hash: accessToken,
            type: (type as 'recovery' | 'email' | 'phone' | 'magiclink') || 'recovery'
          });
          if (error) throw error;
          console.log("OTP verified successfully");
        }
        setHasToken(true);
      } catch (error: any) {
        console.error("Error verifying token:", error);
        toast({
          title: "Error",
          description: "Invalid reset token. Please request a new password reset link.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    checkToken();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasToken) {
      toast({
        title: "Error",
        description: "Invalid session. Please request a new password reset link.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

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

      if (error) throw error;

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

  if (!hasToken) {
    return null;
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