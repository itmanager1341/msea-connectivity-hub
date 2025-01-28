import { Mail, Linkedin, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  profile_visibility: Database['public']['Tables']['profile_visibility']['Row'] | null;
};

export const MemberCard = ({ profile }: { profile: Profile }) => {
  const initials = `${profile["First Name"]?.[0] || ""}${profile["Last Name"]?.[0] || ""}`;

  const getVisibilityValue = (field: 'show_email' | 'show_phone' | 'show_linkedin') => {
    return profile.profile_visibility?.[field] ?? false;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold">{profile["Full Name"]}</h3>
          <p className="text-sm text-muted-foreground">{profile["Job Title"]}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-medium">{profile["Company Name"]}</p>
            <p className="text-sm text-muted-foreground">{profile.Industry}</p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {profile.City && profile["State/Region"] && (
              <p>{profile.City}, {profile["State/Region"]}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {getVisibilityValue('show_email') && profile.Email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${profile.Email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </a>
              </Button>
            )}
            
            {getVisibilityValue('show_phone') && profile["Phone Number"] && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${profile["Phone Number"]}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </a>
              </Button>
            )}
            
            {getVisibilityValue('show_linkedin') && profile.LinkedIn && (
              <Button variant="outline" size="sm" asChild>
                <a href={profile.LinkedIn} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};