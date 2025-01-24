import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Lock, Edit2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const ProfilePage = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .single();

      if (error) throw error;
      setFormData(profile);
      return profile;
    },
  });

  // Fetch visibility settings using the profile's email as the identifier
  const { data: visibility } = useQuery({
    queryKey: ["visibility"],
    queryFn: async () => {
      if (!profile?.Email) return null;
      
      const { data, error } = await supabase
        .from("profile_visibility")
        .select("*")
        .eq("profile_id", profile.Email)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.Email,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("Record ID", formData["Record ID"]);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVisibilityChange = async (field: string) => {
    try {
      if (!profile?.Email) return;

      const { error } = await supabase
        .from("profile_visibility")
        .upsert({
          profile_id: profile.Email,
          [field]: !visibility?.[field],
        })
        .eq("profile_id", profile.Email);

      if (error) throw error;

      toast({
        title: "Visibility updated",
        description: "Your visibility settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update visibility settings.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Profile Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>
                {profile?.["First Name"]?.[0]}
                {profile?.["Last Name"]?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                {profile?.["First Name"]} {profile?.["Last Name"]}
              </CardTitle>
              <CardDescription>{profile?.["Job Title"]}</CardDescription>
            </div>
          </div>
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Save
              </>
            ) : (
              <>
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </>
            )}
          </Button>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input
              value={formData?.["First Name"] || ""}
              onChange={(e) => handleInputChange("First Name", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input
              value={formData?.["Last Name"] || ""}
              onChange={(e) => handleInputChange("Last Name", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Input
                value={formData?.Email || ""}
                disabled
                className="pr-10"
              />
              <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={visibility?.show_email}
                onCheckedChange={() => handleVisibilityChange("show_email")}
              />
              <Label>Show email to other members</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              value={formData?.["Phone Number"] || ""}
              onChange={(e) => handleInputChange("Phone Number", e.target.value)}
              disabled={!isEditing}
            />
            <div className="flex items-center space-x-2">
              <Switch
                checked={visibility?.show_phone}
                onCheckedChange={() => handleVisibilityChange("show_phone")}
              />
              <Label>Show phone to other members</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              value={formData?.["Company Name"] || ""}
              onChange={(e) => handleInputChange("Company Name", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label>Job Title</Label>
            <Input
              value={formData?.["Job Title"] || ""}
              onChange={(e) => handleInputChange("Job Title", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <Input
              value={formData?.Industry || ""}
              onChange={(e) => handleInputChange("Industry", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn</Label>
            <Input
              value={formData?.LinkedIn || ""}
              onChange={(e) => handleInputChange("LinkedIn", e.target.value)}
              disabled={!isEditing}
            />
            <div className="flex items-center space-x-2">
              <Switch
                checked={visibility?.show_linkedin}
                onCheckedChange={() => handleVisibilityChange("show_linkedin")}
              />
              <Label>Show LinkedIn to other members</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={formData?.City || ""}
              onChange={(e) => handleInputChange("City", e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label>State/Region</Label>
            <Input
              value={formData?.["State/Region"] || ""}
              onChange={(e) => handleInputChange("State/Region", e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={formData?.Bio || ""}
              onChange={(e) => handleInputChange("Bio", e.target.value)}
              disabled={!isEditing}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Membership Information */}
      <Card>
        <CardHeader>
          <CardTitle>Membership Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Member Since</Label>
            <Input
              value={formData?.["Member Since Date"] || ""}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label>Membership Type</Label>
            <Input
              value={formData?.Membership || ""}
              disabled
              className="bg-muted"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;