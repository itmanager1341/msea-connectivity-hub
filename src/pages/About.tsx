
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Building2, BookOpen } from "lucide-react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import Auth from "./Auth";

const About = () => {
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
          <Auth />
        </div>
      </header>

      {/* About Hero Section */}
      <section className="bg-[#1A365D] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">About MSEA</h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-gray-200">
            Empowering the future of mortgage servicing through collaboration, innovation, and excellence
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-12">
              {/* History Section */}
              <div>
                <h2 className="text-3xl font-bold text-[#1A365D] mb-6">Our History</h2>
                <p className="text-lg text-[#4A5568] leading-relaxed">
                  Founded by industry veterans, MSEA emerged from a shared vision to create a platform where mortgage servicing professionals could connect, learn, and grow together. Our journey began with a commitment to fostering leadership and innovation in the mortgage servicing industry.
                </p>
              </div>

              {/* Leadership Values */}
              <div>
                <h2 className="text-3xl font-bold text-[#1A365D] mb-6">Leadership Values</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <Users className="w-12 h-12 text-[#C4A484] mb-4" />
                    <h3 className="text-xl font-semibold text-[#1A365D] mb-3">
                      Collaborative Leadership
                    </h3>
                    <p className="text-[#4A5568]">
                      We believe in the power of collective wisdom and shared experiences to drive industry innovation.
                    </p>
                  </Card>
                  <Card className="p-6">
                    <Building2 className="w-12 h-12 text-[#C4A484] mb-4" />
                    <h3 className="text-xl font-semibold text-[#1A365D] mb-3">
                      Industry Excellence
                    </h3>
                    <p className="text-[#4A5568]">
                      Setting high standards and promoting best practices in mortgage servicing.
                    </p>
                  </Card>
                  <Card className="p-6">
                    <BookOpen className="w-12 h-12 text-[#C4A484] mb-4" />
                    <h3 className="text-xl font-semibold text-[#1A365D] mb-3">
                      Continuous Learning
                    </h3>
                    <p className="text-[#4A5568]">
                      Fostering an environment of ongoing education and professional development.
                    </p>
                  </Card>
                </div>
              </div>

              {/* Join Us Section */}
              <div className="bg-white rounded-lg p-8 text-center">
                <h2 className="text-3xl font-bold text-[#1A365D] mb-6">Join Our Community</h2>
                <p className="text-lg text-[#4A5568] mb-8 max-w-2xl mx-auto">
                  Become part of a dynamic network of mortgage servicing professionals dedicated to shaping the future of our industry.
                </p>
                <Button 
                  className="bg-[#C4A484] hover:bg-[#B39374] text-white"
                  size="lg"
                >
                  Become a Member
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
