import { FileText, Clock, Download, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
}

interface ResourcesSidebarProps {
  selectedResource: Resource | null;
  onClose: () => void;
}

export const ResourcesSidebar = ({ selectedResource, onClose }: ResourcesSidebarProps) => {
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${Math.round(kb)} KB`;
    }
    const mb = kb / 1024;
    return `${Math.round(mb * 10) / 10} MB`;
  };

  const renderPreview = () => {
    if (!selectedResource) return null;

    const fileType = selectedResource.file_type.toLowerCase();
    
    if (fileType.startsWith("image/")) {
      return (
        <div className="mb-6">
          <img 
            src={selectedResource.file_url} 
            alt={selectedResource.title}
            className="w-full rounded-lg"
          />
        </div>
      );
    }
    
    if (fileType === "application/pdf") {
      return (
        <div className="mb-6 h-[500px]">
          <iframe
            src={`${selectedResource.file_url}#view=FitH`}
            className="w-full h-full rounded-lg border border-gray-200"
            title={selectedResource.title}
          />
        </div>
      );
    }

    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">Preview not available</p>
      </div>
    );
  };

  if (!selectedResource) {
    return (
      <aside className="hidden lg:block w-[280px] shrink-0 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p>Select a document to view details</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block w-[400px] shrink-0 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Document Details</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {renderPreview()}

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900">{selectedResource.title}</h4>
          {selectedResource.description && (
            <p className="mt-1 text-sm text-gray-500">{selectedResource.description}</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{selectedResource.file_type}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              Uploaded {format(new Date(selectedResource.created_at), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        <Button className="w-full" onClick={() => window.open(selectedResource.file_url)}>
          <Download className="h-4 w-4 mr-2" />
          Download ({formatFileSize(selectedResource.file_size)})
        </Button>
      </div>
    </aside>
  );
};