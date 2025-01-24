import { Link } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const PortalHeader = () => {
  return (
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
  );
};