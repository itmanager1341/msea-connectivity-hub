
import { Mail, Linkedin, Phone } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

export const MemberCard = ({ profile }: { profile: Profile }) => {
  const initials = `${profile["First Name"]?.[0] || ""}${profile["Last Name"]?.[0] || ""}`;

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={profile.Headshot || ""}
            alt={profile["Full Name"] || ""}
          />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-h-[4rem] flex flex-col justify-center">
          {profile.LinkedIn ? (
            <a 
              href={profile.LinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-semibold line-clamp-1 hover:underline"
            >
              {profile["Full Name"]}
            </a>
          ) : (
            <h3 className="text-xl font-semibold line-clamp-1">{profile["Full Name"]}</h3>
          )}
          <p className="text-sm text-muted-foreground line-clamp-1">{profile["Job Title"]}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          <div className="min-h-[4rem]">
            <p className="font-medium line-clamp-1">{profile["Company Name"]}</p>
            <p className="text-sm text-muted-foreground line-clamp-1">{profile.Industry}</p>
          </div>
          
          <div className="text-sm text-muted-foreground min-h-[1.5rem]">
            {profile.City && profile["State/Region"] && (
              <p className="line-clamp-1">{profile.City}, {profile["State/Region"]}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-auto pt-4">
            {profile.Email && (
              <Button variant="outline" size="sm" asChild className="flex-1">
                <a href={`mailto:${profile.Email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </a>
              </Button>
            )}
            
            {profile["Phone Number"] && (
              <Button variant="outline" size="sm" asChild className="flex-1">
                <a href={`tel:${profile["Phone Number"]}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </a>
              </Button>
            )}
            
            {profile.LinkedIn && (
              <Button variant="outline" size="sm" asChild className="flex-1">
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
