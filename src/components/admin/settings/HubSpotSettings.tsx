
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

const settingsSchema = z.object({
  active_list_id: z.string().min(1, "List ID is required"),
});

type HubspotSettingsFormData = z.infer<typeof settingsSchema>;

export const HubSpotSettings = () => {
  const { toast } = useToast();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});

  const form = useForm<HubspotSettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      active_list_id: "",
    },
  });

  // Fetch existing settings
  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ["hubspot-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hubspot_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (data: HubspotSettingsFormData & { field_mappings?: Record<string, string> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      const { error } = await supabase
        .from("hubspot_settings")
        .upsert({
          active_list_id: data.active_list_id,
          field_mappings: data.field_mappings || fieldMappings,
          created_by: user.id,
        });

      if (error) throw error;
      
      // Refetch the settings after update
      await refetch();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "HubSpot integration settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test connection and fetch field mappings
  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const listId = form.getValues("active_list_id");
      
      if (!listId) {
        throw new Error("Please enter a list ID");
      }
      
      const { data: session } = await supabase.auth.getSession();
      
      console.log("Testing connection with list ID:", listId);
      console.log("Auth token available:", !!session?.session?.access_token);
      
      const response = await fetch(
        `/api/functions/v1/test-hubspot-list?listId=${listId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
        }
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log("Raw response body:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}...`);
      }
      
      if (!data.success) {
        throw new Error(data.error || "Failed to test HubSpot connection");
      }
      
      console.log("Connection test successful:", data);
      setFieldMappings(data.properties || {});

      // Save the settings immediately after successful test
      await updateSettings.mutateAsync({ 
        active_list_id: listId, 
        field_mappings: data.properties 
      });

      toast({
        title: "Connection successful",
        description: `Successfully connected to HubSpot list "${data.listName || listId}".`,
      });
    } catch (error) {
      console.error("Connection test error:", error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  useEffect(() => {
    if (settings) {
      form.reset({
        active_list_id: settings.active_list_id || "",
      });
      setFieldMappings(settings.field_mappings || {});
    }
  }, [settings, form]);

  const onSubmit = (data: HubspotSettingsFormData) => {
    updateSettings.mutate({ ...data, field_mappings: fieldMappings });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>HubSpot List Configuration</CardTitle>
              <CardDescription>
                Configure the HubSpot list ID for member synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="active_list_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active Member List ID</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input {...field} placeholder="Enter HubSpot list ID" />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={testConnection}
                          disabled={isTestingConnection || !field.value}
                        >
                          {isTestingConnection && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Test Connection
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter the HubSpot list ID for active members (e.g., 4959)
                    </FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Field Mappings</CardTitle>
              <CardDescription>
                Current mappings between HubSpot and database fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3">Database Field</th>
                      <th className="text-left p-3">HubSpot Field</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(fieldMappings).map(([dbField, hubspotField]) => (
                      <tr key={dbField} className="border-b">
                        <td className="p-3">{dbField}</td>
                        <td className="p-3">{hubspotField}</td>
                      </tr>
                    ))}
                    {Object.keys(fieldMappings).length === 0 && (
                      <tr>
                        <td colSpan={2} className="p-3 text-center text-muted-foreground">
                          Test the connection to view field mappings
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
