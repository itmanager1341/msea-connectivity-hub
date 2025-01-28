import { Mail, Linkedin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  profile_visibility: Database['public']['Tables']['profile_visibility']['Row'] | null;
};

export const MemberList = ({ profiles }: { profiles: Profile[] }) => {
  const getVisibilityValue = (profile: Profile, field: 'show_email' | 'show_phone' | 'show_linkedin') => {
    return profile.profile_visibility?.[field] ?? false;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Name</th>
            <th className="text-left p-4">Company</th>
            <th className="text-left p-4">Location</th>
            <th className="text-left p-4">Industry</th>
            <th className="text-left p-4">Contact</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr key={profile.record_id} className="border-b hover:bg-muted/50">
              <td className="p-4">
                <div>
                  <p className="font-medium">{profile["Full Name"]}</p>
                  <p className="text-sm text-muted-foreground">{profile["Job Title"]}</p>
                </div>
              </td>
              <td className="p-4">{profile["Company Name"]}</td>
              <td className="p-4">
                {profile.City && profile["State/Region"] && (
                  <span>{profile.City}, {profile["State/Region"]}</span>
                )}
              </td>
              <td className="p-4">{profile.Industry}</td>
              <td className="p-4">
                <div className="flex gap-2">
                  {getVisibilityValue(profile, 'show_email') && profile.Email && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`mailto:${profile.Email}`} title="Email">
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  
                  {getVisibilityValue(profile, 'show_phone') && profile["Phone Number"] && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`tel:${profile["Phone Number"]}`} title="Call">
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  
                  {getVisibilityValue(profile, 'show_linkedin') && profile.LinkedIn && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={profile.LinkedIn} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};