import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminPortal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const { data: profiles, isLoading, refetch } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      console.log('Fetching profiles for admin portal...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('"Last Name"', { ascending: true });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      console.log('Profiles fetched:', data);
      return data || [];
    }
  });

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await supabase.functions.invoke('sync-hubspot');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Sync failed');
      }

      const summary = response.data.summary;
      toast({
        title: "Sync Completed Successfully",
        description: `Updated ${summary.updated} records, added ${summary.inserted} new records, and marked ${summary.deactivated} records as inactive.`,
      });

      // Refresh the profiles list
      refetch();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredProfiles = profiles?.filter(profile => {
    const searchLower = searchTerm.toLowerCase();
    return (
      profile["Full Name"]?.toLowerCase().includes(searchLower) ||
      profile["Company Name"]?.toLowerCase().includes(searchLower) ||
      profile["Email"]?.toLowerCase().includes(searchLower) ||
      profile["Membership"]?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-[#F7FAFC] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1A365D] mb-8">Member Management</h1>
        
        {/* Search and Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <Input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync with HubSpot'}
            </Button>
            <Button>Add Member</Button>
          </div>
        </div>

        {/* Members Table */}
        {isLoading ? (
          <div className="text-center py-8">Loading members...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Membership</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles?.map((profile) => (
                  <TableRow key={profile["Record ID"]}>
                    <TableCell className="font-medium">
                      {profile["Full Name"]}
                    </TableCell>
                    <TableCell>{profile["Company Name"]}</TableCell>
                    <TableCell>{profile["Email"]}</TableCell>
                    <TableCell>{profile["Phone Number"]}</TableCell>
                    <TableCell>{profile["Membership"]}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profile.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {profile.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;