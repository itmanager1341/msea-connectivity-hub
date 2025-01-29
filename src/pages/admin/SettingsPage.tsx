import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1A365D]">Settings</h1>
      </div>

      <Tabs defaultValue="cms" className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-transparent h-auto p-0 w-full">
          <TabsTrigger value="cms" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Website Content
          </TabsTrigger>
          <TabsTrigger value="portal" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Member Portal
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Integrations
          </TabsTrigger>
          <TabsTrigger value="admin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Admin Management
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            System Logs
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Security & API
          </TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Email Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cms">
          <Card>
            <CardHeader>
              <CardTitle>Website Content Management</CardTitle>
              <CardDescription>Manage content for public-facing pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">About Page</CardTitle>
                  </CardHeader>
                  <CardContent>Content management for About page coming soon</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Leadership Page</CardTitle>
                  </CardHeader>
                  <CardContent>Leadership page content management coming soon</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Homepage</CardTitle>
                  </CardHeader>
                  <CardContent>Homepage content and hero section management coming soon</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">News & Updates</CardTitle>
                  </CardHeader>
                  <CardContent>News and updates management coming soon</CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portal">
          <Card>
            <CardHeader>
              <CardTitle>Member Portal Settings</CardTitle>
              <CardDescription>Configure member portal features and defaults</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Directory Settings</CardTitle>
                  </CardHeader>
                  <CardContent>Directory configuration coming soon</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resource Management</CardTitle>
                  </CardHeader>
                  <CardContent>Resource categories and settings coming soon</CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Manage external service integrations and synchronization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">HubSpot Integration</CardTitle>
                  </CardHeader>
                  <CardContent>HubSpot sync settings coming soon</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sync Status</CardTitle>
                  </CardHeader>
                  <CardContent>Integration status monitoring coming soon</CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Admin Management</CardTitle>
              <CardDescription>Manage administrator access and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Admin Users</CardTitle>
                  </CardHeader>
                  <CardContent>Admin user management coming soon</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Activity Logs</CardTitle>
                  </CardHeader>
                  <CardContent>Admin activity monitoring coming soon</CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Logs & Monitoring</CardTitle>
              <CardDescription>View system logs and monitor performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Edge Function Logs</CardTitle>
                  </CardHeader>
                  <CardContent>Edge function monitoring coming soon</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Error Logs</CardTitle>
                  </CardHeader>
                  <CardContent>System error tracking coming soon</CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & API Settings</CardTitle>
              <CardDescription>Manage API keys and security configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">API Keys</CardTitle>
                  </CardHeader>
                  <CardContent>API key management coming soon</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent>Security configuration coming soon</CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure email templates and delivery settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Email Templates</CardTitle>
                  </CardHeader>
                  <CardContent>Email template management coming soon</CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Newsletter Settings</CardTitle>
                  </CardHeader>
                  <CardContent>Newsletter configuration coming soon</CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;