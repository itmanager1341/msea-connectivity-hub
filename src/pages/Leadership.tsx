import { Users } from "lucide-react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

const Leadership = () => {
  const leadershipTeam = [
    {
      name: "John Smith",
      title: "President",
      company: "ABC Mortgage Services",
      bio: "John has over 20 years of experience in mortgage servicing and has been instrumental in shaping industry standards.",
    },
    {
      name: "Sarah Johnson",
      title: "Vice President",
      company: "XYZ Financial",
      bio: "Sarah brings extensive expertise in regulatory compliance and strategic planning to the MSEA leadership team.",
    },
    {
      name: "Michael Chen",
      title: "Secretary",
      company: "Global Mortgage Solutions",
      bio: "Michael's background in technology and mortgage servicing has helped modernize industry practices.",
    },
    {
      name: "Lisa Rodriguez",
      title: "Treasurer",
      company: "First Service Financial",
      bio: "Lisa's financial acumen and industry knowledge help guide MSEA's fiscal responsibilities.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      {/* Header/Navigation */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-[#1A365D]">MSEA</h1>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/" className={navigationMenuTriggerStyle()}>
                    Home
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/about" className={navigationMenuTriggerStyle()}>
                    About
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/directory" className={navigationMenuTriggerStyle()}>
                    Directory
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/leadership" className={navigationMenuTriggerStyle()}>
                    Leadership
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </header>

      {/* Leadership Hero Section */}
      <section className="bg-[#1A365D] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <Users className="w-12 h-12 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">Our Leadership Team</h1>
          </div>
          <p className="text-xl text-center max-w-3xl mx-auto text-gray-200">
            Meet the dedicated professionals who guide MSEA's mission and strategic direction
          </p>
        </div>
      </section>

      {/* Leadership Team Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {leadershipTeam.map((leader, index) => (
              <Card key={index} className="p-6 flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-[#1A365D] rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-[#1A365D]">{leader.name}</h3>
                    <p className="text-[#4A5568] font-medium">{leader.title}</p>
                    <p className="text-[#718096]">{leader.company}</p>
                  </div>
                </div>
                <p className="text-[#4A5568] leading-relaxed">{leader.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Leadership;