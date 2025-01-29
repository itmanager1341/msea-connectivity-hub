import { Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalNavigation } from "@/components/portal/PortalNavigation";
import { PortalRightSidebar } from "@/components/portal/PortalRightSidebar";
import { ResourcesSidebar } from "@/components/resources/ResourcesSidebar";
import ProfilePage from "./portal/ProfilePage";
import DirectoryPage from "./portal/DirectoryPage";
import ResourcesPage from "./portal/ResourcesPage";

const MemberPortal = () => {
  const location = useLocation();
  const isResourcesPage = location.pathname.startsWith("/portal/resources");

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-[#F7FAFC]">
        <PortalHeader />
        <div className="flex w-full pt-16">
          <PortalNavigation />
          
          {/* Main Content Area */}
          <main className="flex-1 p-8">
            <div className="max-w-[1600px] mx-auto">
              <Routes>
                <Route path="/" element={
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
                    <div className="bg-white rounded-lg shadow p-6">
                      <p className="text-gray-600">Welcome to your member portal!</p>
                    </div>
                  </>
                } />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/directory" element={<DirectoryPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
              </Routes>
            </div>
          </main>

          {isResourcesPage ? <ResourcesSidebar /> : <PortalRightSidebar />}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MemberPortal;