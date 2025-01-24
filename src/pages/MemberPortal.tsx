import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Home, Users, FileText, Mail, MessageSquare, HelpCircle, User, Search, Bell } from "lucide-react";
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
  SidebarRail,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type SidebarItem = {
  icon: React.ComponentType<{ className?: string }>;
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
    <SidebarProvider>
      <div className="min-h-screen w-full bg-[#F7FAFC]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between fixed w-full top-0 z-50">
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
          
          {/* Search and User Actions */}
          <div className="flex items-center gap-4">
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                type="search" 
                placeholder="Search..." 
                className="pl-10 w-full bg-gray-50"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
            
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>MS</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex w-full pt-16">
          {/* Left Sidebar */}
          <Sidebar className="w-[200px] shrink-0">
            <SidebarHeader className="h-16 flex items-center px-4">
              <h2 className="text-sm font-semibold">Navigation</h2>
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
            <SidebarRail />
          </Sidebar>

          {/* Main Content Area */}
          <main className="flex-1 p-8">
            <div className="max-w-[1600px] mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{activeItem}</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Welcome to your member portal!</p>
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0 bg-white border-l border-gray-200 p-4">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase">Messages</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-gray-500">New message about the project...</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Alice Smith</p>
                    <p className="text-xs text-gray-500">Updated the meeting schedule...</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase">Recent Connections</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>RJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Robert Johnson</p>
                    <p className="text-xs text-gray-500">Senior Developer</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>MP</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Maria Parker</p>
                    <p className="text-xs text-gray-500">Product Manager</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase">Upcoming Events</h3>
              <div className="mt-4 space-y-4">
                <div className="rounded-md border p-3">
                  <p className="text-sm font-medium">Team Meeting</p>
                  <p className="text-xs text-gray-500">Tomorrow at 10:00 AM</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-sm font-medium">Project Review</p>
                  <p className="text-xs text-gray-500">Friday at 2:00 PM</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MemberPortal;