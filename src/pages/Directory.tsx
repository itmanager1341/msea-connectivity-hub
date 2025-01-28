import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

type ViewType = "company" | "member";

const Directory = () => {
  const [viewType, setViewType] = useState<ViewType>("company");
  const { toast } = useToast();

  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('active', true);
      
      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      
      return data;
    },
    retry: 1
  });

  // Group companies by membership type with improved membership detection
  const groupedCompanies = profiles?.reduce((acc, profile) => {
    if (!profile["Company Name"]) return acc;
    
    const membership = profile.Membership || "Other";
    if (!acc[membership]) {
      acc[membership] = new Set<string>();
    }
    acc[membership].add(profile["Company Name"]);
    return acc;
  }, {} as Record<string, Set<string>>);

  // Convert Sets to Arrays and sort company names
  const organizedCompanies = groupedCompanies ? 
    Object.entries(groupedCompanies).reduce((acc, [membership, companies]) => {
      acc[membership] = Array.from(companies as Set<string>).sort();
      return acc;
    }, {} as Record<string, string[]>) : {};

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-red-500">Error loading directory: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      {/* Header/Navigation */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-[#1A365D]">MSEA</h1>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/" className={navigationMenuTriggerStyle()}>
                    Home
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/about" className={navigationMenuTriggerStyle()}>
                    About
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/directory" className={navigationMenuTriggerStyle()}>
                    Directory
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Member Login
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#1A365D] mb-8">Member Directory</h1>
          
          {/* View Toggle */}
          <div className="flex gap-4 mb-8">
            <Button
              variant={viewType === "company" ? "default" : "outline"}
              onClick={() => setViewType("company")}
            >
              View by Company
            </Button>
            <Button
              variant={viewType === "member" ? "default" : "outline"}
              onClick={() => setViewType("member")}
            >
              View by Member
            </Button>
          </div>

          {isLoading ? (
            <div className="text-gray-600">Loading directory...</div>
          ) : viewType === "company" ? (
            // Company View
            <div className="space-y-8">
              {Object.entries(organizedCompanies).map(([membership, companies]) => (
                <div key={membership} className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-[#1A365D] mb-4">{membership}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {companies.map((company) => (
                      <div key={company} className="p-4 bg-gray-50 rounded">
                        {company}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Member View
            <div className="bg-white rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {profiles?.map((profile) => (
                  <div key={profile.record_id} className="p-4 bg-gray-50 rounded">
                    <h3 className="font-medium">{profile["Full Name"]}</h3>
                    <p className="text-sm text-gray-600">{profile["Company Name"]}</p>
                    <p className="text-sm text-gray-600">{profile["Job Title"]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Directory;