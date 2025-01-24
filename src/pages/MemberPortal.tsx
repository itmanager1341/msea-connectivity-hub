import { SidebarProvider } from "@/components/ui/sidebar";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalNavigation } from "@/components/portal/PortalNavigation";
import { PortalRightSidebar } from "@/components/portal/PortalRightSidebar";

const MemberPortal = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-[#F7FAFC]">
        <PortalHeader />
        <div className="flex w-full pt-16">
          <PortalNavigation />
          
          {/* Main Content Area */}
          <main className="flex-1 p-8">
            <div className="max-w-[1600px] mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Welcome to your member portal!</p>
              </div>
            </div>
          </main>

          <PortalRightSidebar />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MemberPortal;