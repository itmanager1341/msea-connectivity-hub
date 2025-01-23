import { useState } from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type ViewType = "company" | "member";

const Directory = () => {
  const [viewType, setViewType] = useState<ViewType>("company");

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('"Company Name"', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Group companies by membership type
  const groupedCompanies = profiles?.reduce((acc, profile) => {
    if (profile["Company Name"] && profile.Membership) {
      const membership = profile.Membership.toLowerCase();
      if (!acc[membership]) {
        acc[membership] = new Set();
      }
      acc[membership].add(profile["Company Name"]);
    }
    return acc;
  }, {} as Record<string, Set<string>>);

  const industryMembers = Array.from(groupedCompanies?.industry || []);
  const corporateMembers = Array.from(groupedCompanies?.corporate || []);

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
                <NavigationMenuItem>
                  <Link to="/resources" className={navigationMenuTriggerStyle()}>
                    Resources
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Member Login
          </Button>
        </div>
      </header>

      {/* Directory Content */}
      <div className="container mx-auto px-4 py-12">
        {/* View Toggle */}
        <div className="mb-8 flex justify-end">
          <Select value={viewType} onValueChange={(value: ViewType) => setViewType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="company">Company View</SelectItem>
              <SelectItem value="member">Member View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {viewType === "company" ? (
          <>
            {/* Industry Members Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-[#1A365D] mb-8">MORTGAGE COMPANY MEMBERS</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {industryMembers.map((company) => (
                  <div 
                    key={company}
                    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-center h-24 text-center"
                  >
                    <span className="text-lg font-medium text-gray-800">{company}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Corporate Members Section */}
            <section>
              <h2 className="text-3xl font-bold text-[#1A365D] mb-8">CORPORATE MEMBERS</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {corporateMembers.map((company) => (
                  <div 
                    key={company}
                    className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-center h-24 text-center"
                  >
                    <span className="text-lg font-medium text-gray-800">{company}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section>
            <h2 className="text-3xl font-bold text-[#1A365D] mb-8">MEMBER DIRECTORY</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profiles?.map((profile) => (
                <div 
                  key={profile["Record ID"]}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {profile["Full Name"]}
                  </h3>
                  <p className="text-gray-600 mb-1">{profile["Job Title"]}</p>
                  <p className="text-gray-600 mb-1">{profile["Company Name"]}</p>
                  <p className="text-gray-600">{profile["City"]}, {profile["State/Region"]}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {isLoading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <p className="text-gray-600">Loading directory...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Directory;