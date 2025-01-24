import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Home, Users, FileText, Mail, MessageSquare, HelpCircle, User, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type SidebarItem = {
  icon: LucideIcon;
  label: string;
  href: string;
};

const leftSidebarItems: SidebarItem[] = [
  { icon: Home, label: "Dashboard", href: "/portal" },
  { icon: User, label: "My Profile", href: "/portal/profile" },
  { icon: Users, label: "Directory", href: "/portal/directory" },
  { icon: FileText, label: "Resources", href: "/portal/resources" },
  { icon: Mail, label: "Newsletters", href: "/portal/newsletters" },
  { icon: MessageSquare, label: "Messages", href: "/portal/messages" },
  { icon: HelpCircle, label: "Support", href: "/portal/support" },
];

const MemberPortal = () => {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const navigate = useNavigate();

  const handleLogout = async () => {
    // TODO: Implement logout logic
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-[#1A365D]">MSEA Portal</h1>
          <Link 
            to="/" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Main Site
          </Link>
        </div>
      </header>

      <SidebarProvider>
        <div className="flex w-full">
          {/* Left Sidebar using shadcn Sidebar */}
          <Sidebar>
            <SidebarHeader className="h-16 flex items-center px-4">
              <SidebarTrigger />
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {leftSidebarItems.map((item) => (
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
          </Sidebar>

          {/* Main Content Area */}
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{activeItem}</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Welcome to your member portal!</p>
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block w-80 bg-white border-l border-gray-200 p-4">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase">Messages</h3>
              <div className="mt-4 space-y-4">
                <p className="text-sm text-gray-600">No new messages</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase">Recent Connections</h3>
              <div className="mt-4 space-y-4">
                <p className="text-sm text-gray-600">No recent connections</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase">Upcoming Events</h3>
              <div className="mt-4 space-y-4">
                <p className="text-sm text-gray-600">No upcoming events</p>
              </div>
            </div>
          </aside>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default MemberPortal;