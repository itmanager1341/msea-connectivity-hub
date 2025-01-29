import { useState } from "react";
import { Grid, List, Upload, Plus, Search, File, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResourceUploadModal } from "@/components/resources/ResourceUploadModal";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
  checked_out_by: string | null;
  checked_out_at: string | null;
  version: number;
}

interface ResourcesPageProps {
  selectedResource: Resource | null;
  onResourceSelect: (resource: Resource | null) => void;
}

const ResourcesPage = ({ selectedResource, onResourceSelect }: ResourcesPageProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: resources, isLoading, refetch } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const resourcesWithUrls = await Promise.all(
        data.map(async (resource) => {
          const { data: { publicUrl } } = supabase
            .storage
            .from("resources")
            .getPublicUrl(resource.file_url);

          return {
            ...resource,
            file_url: publicUrl
          };
        })
      );

      return resourcesWithUrls as Resource[];
    },
  });

  const filteredResources = resources?.filter((resource) =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResourceClick = (resource: Resource) => {
    onResourceSelect(resource);
  };

  const handleUploadComplete = () => {
    refetch();
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredResources?.map((resource) => (
        <Card 
          key={resource.id} 
          className={`p-4 hover:shadow-lg transition-shadow cursor-pointer ${
            selectedResource?.id === resource.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleResourceClick(resource)}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-3 relative">
              <File className="w-8 h-8 text-gray-400" />
              {resource.checked_out_by && (
                <div className="absolute -top-2 -right-2 bg-amber-100 p-1 rounded-full">
                  <Lock className="w-4 h-4 text-amber-600" />
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-900 text-center mb-1">
              {resource.title}
            </h3>
            <p className="text-xs text-gray-500">
              Version {resource.version} • {new Date(resource.created_at).toLocaleDateString()}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-2">
      {filteredResources?.map((resource) => (
        <Card 
          key={resource.id} 
          className={`p-4 hover:bg-gray-50 cursor-pointer ${
            selectedResource?.id === resource.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleResourceClick(resource)}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center relative">
              <File className="w-5 h-5 text-gray-400" />
              {resource.checked_out_by && (
                <div className="absolute -top-1 -right-1 bg-amber-100 p-1 rounded-full">
                  <Lock className="w-3 h-3 text-amber-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">{resource.title}</h3>
              <p className="text-xs text-gray-500">
                Version {resource.version} • {new Date(resource.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              {resource.file_size ? `${Math.round(resource.file_size / 1024)} KB` : "N/A"}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Secondary Navigation */}
      <div className="flex items-center justify-between pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-sm text-gray-500 mt-1">
            Access and manage your documents and resources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>
      
      {/* Resource Management Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search resources..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Separator orientation="vertical" className="h-6" />
          <Tabs defaultValue="all" className="w-[300px]">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
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

      {/* Main Content Area */}
      <div className="flex-1 flex">
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          {isLoading ? (
            <div className="text-center text-gray-500">Loading resources...</div>
          ) : filteredResources?.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>No resources found</p>
              <p className="text-sm">Upload a document or create a new one to get started</p>
            </div>
          ) : (
            viewMode === "grid" ? <GridView /> : <ListView />
          )}
        </div>
      </div>

      <ResourceUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};

export default ResourcesPage;