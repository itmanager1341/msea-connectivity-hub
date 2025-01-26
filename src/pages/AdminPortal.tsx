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
import { Checkbox } from "@/components/ui/checkbox";
import { Search, RefreshCw, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Updated Profile type to match database schema
type Profile = {
  record_id: number;
  "First Name": string | null;
  "Last Name": string | null;
  "Full Name": string | null;
  "Company Name": string | null;
  "Membership": string | null;
  "Email": string | null;
  "Job Title": string | null;
  "Profession - FSI": string | null;
  "Phone Number": string | null;
  "Create Date": string | null;
  "Industry": string | null;
  "State/Region": string | null;
  "City": string | null;
  "Email Domain": string | null;
  "Bio": string | null;
  "Member Since Date": string | null;
  "LinkedIn": string | null;
  active: boolean | null;
};

type SyncPreferences = {
  id: string;
  two_way_sync: boolean | null;
  updated_at: string | null;
  updated_by: string | null;
  last_sync_timestamp: string | null;
};

type SortableField = "Full Name" | "Company Name" | "Email" | "Phone Number" | "Membership" | "active";

type SortConfig = {
  key: SortableField;
  direction: 'asc' | 'desc';
};

const AdminPortal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: "Full Name", 
    direction: 'asc' 
  });
  const [editingMember, setEditingMember] = useState<Profile | null>(null);
  const { toast } = useToast();

  const { data: syncPrefs, refetch: refetchSyncPrefs } = useQuery<SyncPreferences>({
    queryKey: ['sync-preferences'],
    queryFn: async () => {
      console.log('Fetching sync preferences...');
      const { data, error } = await supabase
        .from('sync_preferences')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching sync preferences:', error);
        throw error;
      }
      console.log('Sync preferences:', data);
      return data as SyncPreferences;
    }
  });

  const { data: profiles = [], isLoading, refetch } = useQuery<Profile[]>({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      console.log('Fetching profiles for admin portal...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('Last Name', { ascending: true });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      // Ensure all required fields are present, even if null
      const processedData = (data || []).map(profile => ({
        ...profile,
        "LinkedIn": profile["LinkedIn"] || null
      })) as Profile[];

      console.log('Profiles fetched:', processedData);
      return processedData;
    }
  });

  const handleSort = (key: SortableField) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await supabase.functions.invoke('sync-hubspot', {
        body: { 
          memberIds: selectedMembers.length > 0 ? selectedMembers : undefined,
          direction: 'from_hubspot'
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Sync failed');
      }

      const summary = response.data.summary;
      toast({
        title: "Sync Completed Successfully",
        description: `Updated ${summary.updated} records, added ${summary.inserted} new records, and marked ${summary.deactivated} records as inactive.`,
      });

      setSelectedMembers([]);
      refetch();
    } catch (error: any) {
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

  const handleSaveMember = async () => {
    try {
      if (!editingMember) {
        console.error('No member data to save');
        return;
      }
      
      console.log('Attempting to save member data:', editingMember);
      
      // First, verify the profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('record_id', editingMember.record_id)
        .single();

      console.log('Fetch result:', { existingProfile, fetchError });

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw new Error(`Failed to verify profile: ${fetchError.message}`);
      }

      if (!existingProfile) {
        throw new Error(`Profile with record_id ${editingMember.record_id} not found`);
      }

      // Prepare update data
      const updateData = {
        "First Name": editingMember["First Name"],
        "Last Name": editingMember["Last Name"],
        "Full Name": `${editingMember["First Name"]} ${editingMember["Last Name"]}`.trim(),
        "Email": editingMember["Email"],
        "Phone Number": editingMember["Phone Number"],
        "Company Name": editingMember["Company Name"],
        "Job Title": editingMember["Job Title"],
        "Industry": editingMember["Industry"],
        "State/Region": editingMember["State/Region"],
        "City": editingMember["City"],
        "Bio": editingMember["Bio"],
        "LinkedIn": editingMember["LinkedIn"] || null
      };

      console.log('Updating profile with data:', updateData);

      const { data: updatedProfile, error: updateError } = await supabase
        .rpc('update_profile_by_record_id', { 
          record_id_param: editingMember.record_id,
          update_data: updateData 
        });

      console.log('Update result:', { updatedProfile, updateError });

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      if (!updatedProfile || updatedProfile.length === 0) {
        throw new Error('Profile update failed - no rows affected');
      }

      // Handle HubSpot sync if enabled
      if (syncPrefs?.two_way_sync) {
        console.log('Two-way sync is enabled, syncing to HubSpot...');
        try {
          const response = await supabase.functions.invoke('sync-hubspot', {
            body: { 
              memberIds: [editingMember.record_id],
              direction: 'to_hubspot'
            }
          });

          console.log('HubSpot sync response:', response);

          if (!response.data?.success) {
            console.error('HubSpot sync failed:', response.data?.error);
            toast({
              title: "Partial Update",
              description: "Member information updated locally, but HubSpot sync failed. Changes will sync on next automatic sync.",
              variant: "destructive",
            });
          } else {
            console.log('Synced to HubSpot successfully');
            toast({
              title: "Member Updated",
              description: "Member information has been updated and synced with HubSpot.",
            });
          }
        } catch (syncError: any) {
          console.error('Error during HubSpot sync:', syncError);
          toast({
            title: "Partial Update",
            description: "Member information updated locally, but HubSpot sync failed. Changes will sync on next automatic sync.",
            variant: "destructive",
          });
        }
      } else {
        console.log('Two-way sync is disabled, skipping HubSpot sync');
        toast({
          title: "Member Updated",
          description: "Member information has been updated. Note: Changes won't sync to HubSpot until two-way sync is enabled.",
        });
      }

      refetch();
      setEditingMember(null);
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleTwoWaySync = async () => {
    try {
      console.log('Toggling two-way sync...');
      const { error } = await supabase
        .from('sync_preferences')
        .upsert({
          id: syncPrefs?.id || undefined,
          two_way_sync: !syncPrefs?.two_way_sync,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating sync preferences:', error);
        throw error;
      }

      console.log('Sync preferences updated');
      refetchSyncPrefs();
      toast({
        title: "Sync Preferences Updated",
        description: `Two-way sync has been ${!syncPrefs?.two_way_sync ? 'enabled' : 'disabled'}.`,
      });
    } catch (error: any) {
      console.error('Error toggling two-way sync:', error);
      toast({
        title: "Error",
        description: "Failed to update sync preferences.",
        variant: "destructive",
      });
    }
  };

  const sortedProfiles = [...profiles].sort((a: Profile, b: Profile) => {
    const key = sortConfig.key;
    const aValue = a[key] === null ? '' : String(a[key]);
    const bValue = b[key] === null ? '' : String(b[key]);
    
    return sortConfig.direction === 'asc' 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const filteredProfiles = sortedProfiles.filter((profile: Profile) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      String(profile["Full Name"])?.toLowerCase().includes(searchLower) ||
      String(profile["Company Name"])?.toLowerCase().includes(searchLower) ||
      String(profile["Email"])?.toLowerCase().includes(searchLower) ||
      String(profile["Membership"])?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-[#F7FAFC] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#1A365D]">Member Management</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={syncPrefs?.two_way_sync || false}
                onCheckedChange={handleToggleTwoWaySync}
              />
              <Label>Two-way Sync</Label>
            </div>
          </div>
        </div>
        
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
              {isSyncing ? 'Syncing...' : `Sync ${selectedMembers.length ? `Selected (${selectedMembers.length})` : 'All'}`}
            </Button>
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
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedMembers.length === profiles?.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMembers(profiles?.map(p => p.record_id) || []);
                        } else {
                          setSelectedMembers([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead onClick={() => handleSort("Full Name")} className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort("Company Name")} className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      Company
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort("Email")} className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      Email
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort("Phone Number")} className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      Phone
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort("Membership")} className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      Membership
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort("active")} className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles?.map((profile) => (
                  <TableRow key={profile.record_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMembers.includes(profile.record_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMembers(prev => [...prev, profile.record_id]);
                          } else {
                            setSelectedMembers(prev => prev.filter(id => id !== profile.record_id));
                          }
                        }}
                      />
                    </TableCell>
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingMember(profile)}
                      >
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

      {/* Edit Member Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                First Name
              </Label>
              <Input
                id="firstName"
                value={editingMember?.["First Name"] || ""}
                onChange={(e) => setEditingMember(prev => ({ ...prev, "First Name": e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={editingMember?.["Last Name"] || ""}
                onChange={(e) => setEditingMember(prev => ({ ...prev, "Last Name": e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={editingMember?.["Email"] || ""}
                onChange={(e) => setEditingMember(prev => ({ ...prev, "Email": e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={editingMember?.["Phone Number"] || ""}
                onChange={(e) => setEditingMember(prev => ({ ...prev, "Phone Number": e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Company
              </Label>
              <Input
                id="company"
                value={editingMember?.["Company Name"] || ""}
                onChange={(e) => setEditingMember(prev => ({ ...prev, "Company Name": e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="linkedin" className="text-right">
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={editingMember?.["LinkedIn"] || ""}
                onChange={(e) => setEditingMember(prev => ({ ...prev, "LinkedIn": e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMember}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPortal;
