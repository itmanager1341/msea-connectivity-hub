import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Building2, BookOpen, LogIn } from "lucide-react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";

const Index = () => {
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
                  <Link to="/resources" className={navigationMenuTriggerStyle()}>
                    Resources
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <Link to="/login">
            <Button variant="outline" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Member Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#1A365D] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to MSEA
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Connecting mortgage servicing professionals through leadership, innovation, and excellence
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/login">
                <Button className="bg-[#C4A484] hover:bg-[#B39374] text-white">
                  Join Our Network
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="text-white border-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <Users className="w-12 h-12 text-[#C4A484] mb-4" />
              <h3 className="text-xl font-semibold text-[#1A365D] mb-3">
                Professional Network
              </h3>
              <p className="text-[#4A5568]">
                Connect with industry leaders and peers in mortgage servicing
              </p>
            </Card>
            <Card className="p-6">
              <Building2 className="w-12 h-12 text-[#C4A484] mb-4" />
              <h3 className="text-xl font-semibold text-[#1A365D] mb-3">
                Industry Insights
              </h3>
              <p className="text-[#4A5568]">
                Stay informed with the latest trends and developments
              </p>
            </Card>
            <Card className="p-6">
              <BookOpen className="w-12 h-12 text-[#C4A484] mb-4" />
              <h3 className="text-xl font-semibold text-[#1A365D] mb-3">
                Resources & Tools
              </h3>
              <p className="text-[#4A5568]">
                Access exclusive resources and professional development tools
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;