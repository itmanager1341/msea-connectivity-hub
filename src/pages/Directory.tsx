import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Building2, Search, LogIn } from "lucide-react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";

const Directory = () => {
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
          <Button variant="outline" className="flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Member Login
          </Button>
        </div>
      </header>

      {/* Directory Hero Section */}
      <section className="bg-[#1A365D] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Member Directory</h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-gray-200">
            Connect with industry professionals and expand your network
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search members by name, company, or role..."
                className="pl-10 py-6"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Directory Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Example Member Cards */}
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-[#1A365D] rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#1A365D]">John Doe</h3>
                    <p className="text-sm text-gray-600">Senior Vice President</p>
                    <p className="text-sm text-gray-600 mb-3">ABC Mortgage Services</p>
                    <div className="flex items-center text-sm text-[#C4A484]">
                      <Building2 className="w-4 h-4 mr-1" />
                      <span>New York, NY</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#1A365D] mb-6">
            Not a Member Yet?
          </h2>
          <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
            Join our network of mortgage servicing professionals and unlock exclusive networking opportunities
          </p>
          <Button 
            className="bg-[#C4A484] hover:bg-[#B39374] text-white"
            size="lg"
          >
            Join MSEA Today
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Directory;