import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Home, Users, FileText, Mail, MessageSquare, HelpCircle, User, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  adminOnly?: boolean;
}

interface PortalNavigationProps {
  className?: string;
  showAdminLink?: boolean;
}

// Separate navigation items into categories
const MAIN_NAV_ITEMS: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/portal" },
  { icon: User, label: "My Profile", href: "/portal/profile" },
  { icon: Users, label: "Directory", href: "/portal/directory" },
];

const RESOURCE_NAV_ITEMS: NavItem[] = [
  { icon: FileText, label: "Resources", href: "/portal/resources" },
  { icon: Mail, label: "Newsletters", href: "/portal/newsletters" },
];

const SUPPORT_NAV_ITEMS: NavItem[] = [
  { icon: MessageSquare, label: "Messages", href: "/portal/messages" },
  { icon: HelpCircle, label: "Support", href: "/portal/support" },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { icon: Shield, label: "Admin Portal", href: "/admin", adminOnly: true },
];

// Separate navigation section into its own component
const NavigationSection = ({ 
  items, 
  activeItem, 
  onItemClick 
}: { 
  items: NavItem[];
  activeItem: string;
  onItemClick: (label: string) => void;
}) => (
  <>
    {items.map((item) => (
      <SidebarMenuItem key={item.label}>
        <SidebarMenuButton
          asChild
          tooltip={item.label}
          isActive={activeItem === item.label}
          onClick={() => onItemClick(item.label)}
        >
          <Link to={item.href}>
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))}
  </>
);

export const PortalNavigation = ({ 
  className = "",
  showAdminLink = true 
}: PortalNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeItem, setActiveItem] = useState(() => {
    const currentPath = location.pathname;
    const allItems = [...MAIN_NAV_ITEMS, ...RESOURCE_NAV_ITEMS, ...SUPPORT_NAV_ITEMS, ...ADMIN_NAV_ITEMS];
    const matchingItem = allItems.find(item => currentPath.startsWith(item.href));
    return matchingItem?.label || "Dashboard";
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (error) throw error;
        setIsAdmin(!!data);
      } catch (error: any) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate("/login");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar className={`w-[200px] shrink-0 ${className}`}>
      <SidebarHeader className="h-16 flex items-center px-4">
        <h2 className="text-sm font-semibold">Navigation</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {/* Main Navigation */}
          <NavigationSection
            items={MAIN_NAV_ITEMS}
            activeItem={activeItem}
            onItemClick={setActiveItem}
          />
          
          {/* Resource Navigation */}
          <NavigationSection
            items={RESOURCE_NAV_ITEMS}
            activeItem={activeItem}
            onItemClick={setActiveItem}
          />
          
          {/* Support Navigation */}
          <NavigationSection
            items={SUPPORT_NAV_ITEMS}
            activeItem={activeItem}
            onItemClick={setActiveItem}
          />
          
          {/* Admin Navigation */}
          {showAdminLink && isAdmin && (
            <NavigationSection
              items={ADMIN_NAV_ITEMS}
              activeItem={activeItem}
              onItemClick={setActiveItem}
            />
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};