import { FileText, Clock, MessageSquare, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export const ResourcesSidebar = () => {
  return (
    <aside className="hidden lg:block w-[280px] shrink-0 bg-white border-l border-gray-200 p-4">
      {/* Document Info Section */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase">Document Info</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">No document selected</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Last modified: --</span>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Activity Section */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase">Recent Activity</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500">Uploaded new document</p>
              <p className="text-xs text-gray-400">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Alice Smith</p>
              <p className="text-xs text-gray-500">Added comments</p>
              <p className="text-xs text-gray-400">5 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Comments Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
          Comments
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">2</span>
        </h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Alice Smith</p>
              <p className="text-sm text-gray-600">Please review the latest changes.</p>
              <p className="text-xs text-gray-400">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-sm text-gray-600">Changes look good to me!</p>
              <p className="text-xs text-gray-400">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};