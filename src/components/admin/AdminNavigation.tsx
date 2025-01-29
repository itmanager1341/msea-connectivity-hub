import { Link, useLocation } from "react-router-dom";
import { Settings, Users } from "lucide-react";
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

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: Users, label: "Member Management", href: "/admin" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export const AdminNavigation = ({ className = "" }: { className?: string }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar className={`w-[200px] shrink-0 ${className}`}>
      <SidebarHeader className="h-16 flex items-center px-4">
        <h2 className="text-sm font-semibold">Admin Navigation</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                tooltip={item.label}
                isActive={currentPath === item.href}
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
      <SidebarRail />
    </Sidebar>
  );
};