import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const PortalRightSidebar = () => {
  return (
    <aside className="hidden lg:block w-[280px] shrink-0 bg-white border-l border-gray-200 p-4">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase">Messages</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500">New message about the project...</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Alice Smith</p>
              <p className="text-xs text-gray-500">Updated the meeting schedule...</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase">Recent Connections</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>RJ</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Robert Johnson</p>
              <p className="text-xs text-gray-500">Senior Developer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>MP</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Maria Parker</p>
              <p className="text-xs text-gray-500">Product Manager</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase">Upcoming Events</h3>
        <div className="mt-4 space-y-4">
          <div className="rounded-md border p-3">
            <p className="text-sm font-medium">Team Meeting</p>
            <p className="text-xs text-gray-500">Tomorrow at 10:00 AM</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-sm font-medium">Project Review</p>
            <p className="text-xs text-gray-500">Friday at 2:00 PM</p>
          </div>
        </div>
      </div>
    </aside>
  );
};