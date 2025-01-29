import { useState, useEffect } from "react";
import { FileText, Clock, Download, X, Lock, Upload } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ResourceComments } from "./ResourceComments";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

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

interface ResourcesSidebarProps {
  selectedResource: Resource | null;
  onClose: () => void;
  onResourceUpdate: () => void;
}

export const ResourcesSidebar = ({ selectedResource, onClose, onResourceUpdate }: ResourcesSidebarProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isCheckedOutByMe, setIsCheckedOutByMe] = useState(false);
  const { toast } = useToast();

  // Check if the current user is the one who checked out the resource
  useEffect(() => {
    const checkOwnership = async () => {
      if (!selectedResource) return;
      
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        setIsCheckedOutByMe(selectedResource.checked_out_by === user?.id);
      } catch (error) {
        console.error('Error checking ownership:', error);
        setIsCheckedOutByMe(false);
      }
    };

    checkOwnership();
  }, [selectedResource]);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${Math.round(kb)} KB`;
    }
    const mb = kb / 1024;
    return `${Math.round(mb * 10) / 10} MB`;
  };

  const handleDownload = async () => {
    if (!selectedResource) return;
    
    setIsDownloading(true);
    try {
      const filename = selectedResource.file_url.split('/').pop() || selectedResource.file_url;
      
      const { data, error: signedUrlError } = await supabase.storage
        .from('resources')
        .createSignedUrl(filename, 60);

      if (signedUrlError || !data?.signedUrl) {
        throw new Error("Failed to generate download URL");
      }

      window.open(data.signedUrl, '_blank');
      
      toast({
        title: "Download started",
        description: "Your file should begin downloading shortly.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedResource) return;
    
    setIsChecking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('resources')
        .update({
          checked_out_by: user.id,
          checked_out_at: new Date().toISOString()
        })
        .eq('id', selectedResource.id);

      if (error) throw error;

      toast({
        title: "Document checked out",
        description: "You can now download and edit the document.",
      });
      
      onResourceUpdate();
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: "There was an error checking out the document.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleCheckin = async () => {
    if (!selectedResource || !uploadFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to check in",
        variant: "destructive",
      });
      return;
    }
    
    setIsChecking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");

      // Upload new version
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(fileName, uploadFile);

      if (uploadError) throw uploadError;

      // Create version record
      const { error: versionError } = await supabase
        .from('resource_versions')
        .insert({
          resource_id: selectedResource.id,
          version: selectedResource.version,
          file_url: selectedResource.file_url,
          file_type: selectedResource.file_type,
          file_size: selectedResource.file_size,
          created_by: user.id
        });

      if (versionError) throw versionError;

      // Update resource record
      const { error: updateError } = await supabase
        .from('resources')
        .update({
          file_url: fileName,
          file_type: uploadFile.type,
          file_size: uploadFile.size,
          version: selectedResource.version + 1,
          checked_out_by: null,
          checked_out_at: null
        })
        .eq('id', selectedResource.id);

      if (updateError) throw updateError;

      toast({
        title: "Document checked in",
        description: "New version has been uploaded successfully.",
      });
      
      setUploadFile(null);
      onResourceUpdate();
    } catch (error) {
      console.error('Checkin error:', error);
      toast({
        title: "Checkin failed",
        description: "There was an error checking in the document.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const renderPreview = () => {
    if (!selectedResource) return null;

    const fileType = selectedResource.file_type.toLowerCase();
    const filename = selectedResource.file_url.split('/').pop() || selectedResource.file_url;
    
    if (fileType.startsWith("image/")) {
      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filename);

      return (
        <div className="mb-6">
          <img 
            src={publicUrl}
            alt={selectedResource.title}
            className="w-full rounded-lg"
          />
        </div>
      );
    }
    
    if (fileType === "application/pdf") {
      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filename);

      return (
        <div className="mb-6 h-[500px]">
          <iframe
            src={`${publicUrl}#view=FitH`}
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

  const isCheckedOut = !!selectedResource.checked_out_by;

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
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">{selectedResource?.title}</h4>
            {isCheckedOut && (
              <div className="flex items-center gap-2 text-amber-600">
                <Lock className="h-4 w-4" />
                <span className="text-xs">
                  {isCheckedOutByMe ? "Checked out by you" : "Checked out"}
                </span>
              </div>
            )}
          </div>
          {selectedResource?.description && (
            <p className="mt-1 text-sm text-gray-500">{selectedResource.description}</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{selectedResource?.file_type}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              Version {selectedResource.version} • Uploaded {selectedResource && format(new Date(selectedResource.created_at), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        {isCheckedOutByMe ? (
          <div className="space-y-4">
            <Input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={handleCheckin}
                disabled={isChecking || !uploadFile}
              >
                <Upload className="h-4 w-4 mr-2" />
                Check In
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            {!isCheckedOut && (
              <Button
                className="flex-1"
                onClick={handleCheckout}
                disabled={isChecking}
              >
                <Lock className="h-4 w-4 mr-2" />
                Check Out
              </Button>
            )}
            {(!isCheckedOut || isCheckedOutByMe) && (
              <Button 
                className="flex-1" 
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Downloading..." : `Download (${formatFileSize(selectedResource?.file_size)})`}
              </Button>
            )}
          </div>
        )}

        <Separator />

        {selectedResource && <ResourceComments resourceId={selectedResource.id} />}
      </div>
    </aside>
  );
};