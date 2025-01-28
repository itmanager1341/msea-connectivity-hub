import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid, List, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemberCard } from "@/components/directory/MemberCard";
import { MemberList } from "@/components/directory/MemberList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ViewMode = "grid" | "list";

const DirectoryPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['member-profiles'],
    queryFn: async () => {
      console.log('Fetching member profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          profile_visibility (
            show_email,
            show_phone,
            show_linkedin
          )
        `)
        .eq('active', true)
        .order('"Company Name"', { ascending: true });

      if (error) {
        console.error('Error fetching profiles:', error);
        toast({
          title: "Error",
          description: "Failed to load member directory",
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
  });

  const filteredProfiles = profiles?.filter(profile => {
    const matchesSearch = searchQuery.toLowerCase() === '' || 
      profile["Full Name"]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile["Company Name"]?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry = industryFilter === 'all' || 
      profile.Industry?.toLowerCase() === industryFilter.toLowerCase();

    return matchesSearch && matchesIndustry;
  });

  const industries = [...new Set(profiles?.map(p => p.Industry).filter(Boolean))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Member Directory</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry?.toLowerCase() || ""}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-gray-600">Loading directory...</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles?.map((profile) => (
            <MemberCard key={profile.record_id} profile={profile} />
          ))}
        </div>
      ) : (
        <MemberList profiles={filteredProfiles || []} />
      )}
    </div>
  );
};

export default DirectoryPage;