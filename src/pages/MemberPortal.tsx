import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut, Home, Users, FileText, Mail, MessageSquare, HelpCircle, User, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarItem = {
  icon: LucideIcon;  // Changed from React.ComponentType to LucideIcon
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
    <div className="min-h-screen bg-[#F7FAFC] flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-[#1A365D]">MSEA Portal</h1>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-2">
            {leftSidebarItems.map((item) => (
              <li key={item.label}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2",
                    activeItem === item.label && "bg-blue-50 text-blue-600"
                  )}
                  onClick={() => setActiveItem(item.label)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <Button
          variant="ghost"
          className="mt-auto w-full justify-start gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{activeItem}</h2>
          {/* Content will be added based on active section */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Welcome to your member portal!</p>
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 bg-white border-l border-gray-200 p-4">
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
  );
};

export default MemberPortal;