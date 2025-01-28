import { useState } from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type ViewType = "company" | "member";
type Profile = Database['public']['Tables']['profiles']['Row'];

const Directory = () => {
  const [viewType, setViewType] = useState<ViewType>("company");
  const { toast } = useToast();
</lov-replace>

<lov-search>
  const fetchHubSpotCompanies = async () => {
    setIsFetching(true);
    try {
      console.log('Invoking fetch-hubspot-companies function...');
      const { data, error } = await supabase.functions.invoke('fetch-hubspot-companies');
      
      if (error) {
        console.error('Error fetching companies:', error);
        toast({
          title: "Error",
          description: "Failed to fetch companies from HubSpot",
          variant: "destructive",
        });
        return;
      }

      console.log('HubSpot companies response:', data);
      toast({
        title: "Success",
        description: "Companies fetched successfully. Check the function logs for details.",
      });
    } catch (error) {
      console.error('Function invocation error:', error);
      toast({
        title: "Error",
        description: "Failed to invoke the function",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

</lov-search>
<lov-replace>
  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      console.log('Starting profiles fetch from Supabase...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('"Company Name"', { ascending: true });
      
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log('Profiles data received:', data);
      return data as Profile[];
    },
    retry: 1
  });

  const fetchHubSpotCompanies = async () => {
    setIsFetching(true);
    try {
      console.log('Invoking fetch-hubspot-companies function...');
      const { data, error } = await supabase.functions.invoke('fetch-hubspot-companies');
      
      if (error) {
        console.error('Error fetching companies:', error);
        toast({
          title: "Error",
          description: "Failed to fetch companies from HubSpot",
          variant: "destructive",
        });
        return;
      }

      console.log('HubSpot companies response:', data);
      toast({
        title: "Success",
        description: "Companies fetched successfully. Check the function logs for details.",
      });
    } catch (error) {
      console.error('Function invocation error:', error);
      toast({
        title: "Error",
        description: "Failed to invoke the function",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  // Group companies by membership type with improved membership detection
  const groupedCompanies = profiles?.reduce((acc, profile) => {
    console.log('Processing profile for grouping:', profile);
    
    if (profile["Company Name"] && profile.Membership) {
      // Convert to lowercase for case-insensitive comparison
      const membership = profile.Membership.toLowerCase();
      
      // Check if it's a corporate member
      if (membership.includes('msea - corporate')) {
        if (!acc.corporate) {
          acc.corporate = new Set<string>();
        }
        acc.corporate.add(profile["Company Name"]);
        console.log(`Added ${profile["Company Name"]} to corporate members`);
      }
      // Check if it's an industry member (has MSEA but not corporate)
      else if (membership.includes('msea')) {
        if (!acc.industry) {
          acc.industry = new Set<string>();
        }
        acc.industry.add(profile["Company Name"]);
        console.log(`Added ${profile["Company Name"]} to industry members`);
      }
    } else {
      console.warn('Profile missing Company Name or Membership:', profile);
    }
    
    return acc;
  }, { corporate: new Set<string>(), industry: new Set<string>() });

  console.log('Final grouped companies:', groupedCompanies);

  const industryMembers = Array.from(groupedCompanies?.industry || []);
  const corporateMembers = Array.from(groupedCompanies?.corporate || []);

  console.log('Industry members:', industryMembers);
  console.log('Corporate members:', corporateMembers);

  if (error) {
    console.error('Rendering error state:', error);
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Directory</h2>
          <p className="text-gray-600">{error.message}</p>
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
                <NavigationMenuItem>
                  <Link to="/resources" className={navigationMenuTriggerStyle()}>
                    Resources
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={fetchHubSpotCompanies}
              disabled={isFetching}
            >
              {isFetching ? "Fetching..." : "Test HubSpot Companies"}
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Member Login
            </Button>
          </div>
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

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <p className="text-gray-600">Loading directory...</p>
          </div>
        ) : viewType === "company" ? (
          <>
            {/* Industry Members Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-[#1A365D] mb-8">MORTGAGE COMPANY MEMBERS</h2>
              {!industryMembers || industryMembers.length === 0 ? (
                <p className="text-gray-600">No industry members found</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {industryMembers.map((company: string) => (
                    <div 
                      key={company}
                      className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-center h-24 text-center"
                    >
                      <span className="text-lg font-medium text-gray-800">{company}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Corporate Members Section */}
            <section>
              <h2 className="text-3xl font-bold text-[#1A365D] mb-8">CORPORATE MEMBERS</h2>
              {!corporateMembers || corporateMembers.length === 0 ? (
                <p className="text-gray-600">No corporate members found</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {corporateMembers.map((company: string) => (
                    <div 
                      key={company}
                      className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-center h-24 text-center"
                    >
                      <span className="text-lg font-medium text-gray-800">{company}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <section>
            <h2 className="text-3xl font-bold text-[#1A365D] mb-8">MEMBER DIRECTORY</h2>
            {!profiles || profiles.length === 0 ? (
              <p className="text-gray-600">No members found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {profiles.map((profile) => (
                  <div 
                    key={profile.record_id}
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
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Directory;
