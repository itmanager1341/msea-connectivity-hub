import { Link } from "react-router-dom";
import { Search, Bell, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define types for profile and session
interface UserProfile {
  "First Name": string | null;
  "Last Name": string | null;
  "Full Name": string;
  "Email": string;
  "record_id": number;
}

interface HeaderProps {
  className?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
}

// Separate user menu into its own component
const UserMenu = ({ profile, session, onSignOut }: { 
  profile: UserProfile | null; 
  session: any;
  onSignOut: () => void;
}) => {
  const getInitials = () => {
    if (profile?.["First Name"] && profile?.["Last Name"]) {
      return `${profile["First Name"][0]}${profile["Last Name"][0]}`;
    }
    return "";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src="/placeholder.svg" 
              alt={profile?.["Full Name"] || "User"}
              className="bg-primary/10"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials() || <User className="h-4 w-4 text-primary" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.["Full Name"]}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/portal/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/portal/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const PortalHeader = ({ 
  className = "", 
  showSearch = true, 
  showNotifications = true 
}: HeaderProps) => {
  // Get current user's session and profile using React Query
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });

  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ["profile", session?.user?.email],
    queryFn: async () => {
      if (!session?.user?.email) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("\"First Name\", \"Last Name\", \"Full Name\", \"Email\", record_id")
        .eq("Email", session.user.email)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!session?.user?.email,
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className={`bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between fixed w-full top-0 z-50 ${className}`}>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-xl font-bold text-[#1A365D]">MSEA Portal</h1>
        </div>
        <Link 
          to="/" 
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Main Site
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative max-w-md w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              type="search" 
              placeholder="Search..." 
              className="pl-10 w-full bg-gray-50"
            />
          </div>
        )}
        
        {showNotifications && (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </Button>
        )}
        
        <UserMenu 
          profile={profile} 
          session={session} 
          onSignOut={handleSignOut}
        />
      </div>
    </header>
  );
};