
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, LogIn, User, Key, Lock, Mail } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuthProps {
  onClose?: () => void;
}

const Auth = ({ onClose }: AuthProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        const site_url = process.env.REACT_APP_SITE_URL || window.location.origin;
        console.log("Using site URL:", site_url);
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${site_url}/reset-password`,
        });
        
        if (error) throw error;
        
        toast({
          title: "Password reset email sent",
          description: "Check your email for the reset link",
        });
        setIsForgotPassword(false);
      } else if (isSignUp) {
        const site_url = process.env.REACT_APP_SITE_URL || window.location.origin;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${site_url}/portal`,
          },
        });
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Account created successfully. Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Invalid email or password");
          }
          throw error;
        }
        navigate("/portal");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, check if this email exists in our profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("Email, active")
        .eq("Email", email)
        .single();

      // If profile doesn't exist or is not active
      if (profileError || !profileData || profileData.active === false) {
        throw new Error("This email is not registered or the account is inactive. Please contact support.");
      }

      // If profile exists and is active, send magic link
      const site_url = process.env.REACT_APP_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${site_url}/portal`,
        },
      });
      
      if (error) throw error;
      
      setMagicLinkSent(true);
      toast({
        title: "Magic link sent!",
        description: "Check your email for a secure login link",
      });
    } catch (error: any) {
      console.error("Magic link error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => {
    if (magicLinkSent) {
      return (
        <div className="space-y-4 text-center">
          <Mail className="w-12 h-12 mx-auto text-primary" />
          <h3 className="text-xl font-semibold">Check your email</h3>
          <p className="text-gray-500">
            We've sent a magic link to <span className="font-medium">{email}</span>
          </p>
          <p className="text-sm text-gray-500">
            The link will expire after 24 hours. Click the button in the email to log in.
          </p>
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => setMagicLinkSent(false)}
          >
            Back to login
          </Button>
        </div>
      );
    }

    if (isForgotPassword) {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                className="pl-10"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
          <button
            type="button"
            onClick={() => setIsForgotPassword(false)}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to login
          </button>
        </form>
      );
    }

    if (isSignUp) {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="signup-email"
                type="email"
                className="pl-10"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="signup-password"
                type="password"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create account"}
          </Button>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className="text-sm text-blue-600 hover:underline"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      );
    }

    return (
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
        </TabsList>
        
        <TabsContent value="password">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="mt-4 text-center space-y-2">
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-sm text-blue-600 hover:underline block w-full"
              >
                Don't have an account? Sign up
              </button>
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-blue-600 hover:underline block w-full"
              >
                Forgot password?
              </button>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="magic-link">
          <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="magic-link-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="magic-link-email"
                  type="email"
                  className="pl-10"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter your registered email to receive a secure login link
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Magic Link"}
            </Button>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="default" size="lg" className="bg-white text-[#1A365D] hover:bg-white/90">
          Member Login
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {magicLinkSent 
              ? "Magic Link Sent"
              : isForgotPassword
              ? "Reset Password"
              : isSignUp
              ? "Create an account"
              : "Welcome back"}
          </SheetTitle>
          <SheetDescription>
            {magicLinkSent
              ? "Check your email for the secure login link"
              : isForgotPassword
              ? "Enter your email to receive a password reset link"
              : isSignUp
              ? "Enter your email and password to create your account"
              : "Sign in to your account using your preferred method"}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">{renderForm()}</div>
      </SheetContent>
    </Sheet>
  );
};

export default Auth;
