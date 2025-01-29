import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import MemberManagementPage from "./admin/MemberManagementPage";
import SettingsPage from "./admin/SettingsPage";

const AdminPortal = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#F7FAFC]">
        <PortalHeader />
        <div className="flex w-full pt-16">
          <AdminNavigation />
          
          {/* Main Content Area */}
          <main className="flex-1 p-8">
            <Routes>
              <Route path="/" element={<MemberManagementPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminPortal;