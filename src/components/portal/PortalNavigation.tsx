import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Home, Users, FileText, Mail, MessageSquare, HelpCircle, User } from "lucide-react";
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

type NavItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
};

const navigationItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/portal" },
  { icon: User, label: "My Profile", href: "/portal/profile" },
  { icon: Users, label: "Directory", href: "/portal/directory" },
  { icon: FileText, label: "Resources", href: "/portal/resources" },
  { icon: Mail, label: "Newsletters", href: "/portal/newsletters" },
  { icon: MessageSquare, label: "Messages", href: "/portal/messages" },
  { icon: HelpCircle, label: "Support", href: "/portal/support" },
];

export const PortalNavigation = () => {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const navigate = useNavigate();

  const handleLogout = async () => {
    // TODO: Implement logout logic
    navigate("/");
  };

  return (
    <Sidebar className="w-[200px] shrink-0">
      <SidebarHeader className="h-16 flex items-center px-4">
        <h2 className="text-sm font-semibold">Navigation</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                tooltip={item.label}
                isActive={activeItem === item.label}
                onClick={() => setActiveItem(item.label)}
              >
                <Link to={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
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