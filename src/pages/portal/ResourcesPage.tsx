import { useState } from "react";
import { Grid, List, Upload, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ResourcesPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="h-full flex flex-col">
      {/* Secondary Navigation */}
      <div className="flex items-center justify-between pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-sm text-gray-500 mt-1">
            Collaborate on documents, white papers, and newsletters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Document
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
      <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500">
          <p>No resources yet</p>
          <p className="text-sm">Upload a document or create a new one to get started</p>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;