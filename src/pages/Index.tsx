import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, Users, BookOpen, ArrowRight, LogIn } from "lucide-react";
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
          <Button variant="outline" className="flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Member Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#1A365D] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Mortgage Servicing Executive Alliance
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              The premier platform for nurturing the next generation of mortgage leaders
            </p>
            <Button 
              className="bg-[#C4A484] hover:bg-[#B39374] text-white"
              size="lg"
            >
              Join MSEA Today
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#1A365D] mb-8">Our Mission</h2>
            <p className="text-lg text-[#4A5568] mb-12 leading-relaxed">
              Mortgage Servicing Executive Alliance (MSEA) is the premier platform for nurturing the next generation of mortgage leaders. We offer exclusive access to mentorship, collaboration, and professional growth opportunities within a network of industry experts and visionaries.
              <br /><br />
              As a cornerstone for innovation and success, MSEA is steadfast in its commitment to shaping a more resilient, adaptive, and forward-thinking mortgage industry.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                "Supportive",
                "Visionary",
                "Exclusive",
                "Collaborative",
                "Knowledgeable",
                "Approachable",
                "Inspirational",
                "Adaptable",
              ].map((value) => (
                <div key={value} className="bg-[#F7FAFC] p-4 rounded-lg">
                  <p className="font-medium text-[#1A365D]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#1A365D] mb-12">
            Member Benefits
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <Users className="w-12 h-12 text-[#C4A484] mb-4" />
              <h3 className="text-xl font-semibold text-[#1A365D] mb-3">
                Exclusive Network
              </h3>
              <p className="text-[#4A5568]">
                Connect with industry leaders and peers in mortgage servicing
              </p>
            </Card>
            <Card className="p-6">
              <BookOpen className="w-12 h-12 text-[#C4A484] mb-4" />
              <h3 className="text-xl font-semibold text-[#1A365D] mb-3">
                Resource Library
              </h3>
              <p className="text-[#4A5568]">
                Access exclusive industry insights and best practices
              </p>
            </Card>
            <Card className="p-6">
              <Building2 className="w-12 h-12 text-[#C4A484] mb-4" />
              <h3 className="text-xl font-semibold text-[#1A365D] mb-3">
                Industry Leadership
              </h3>
              <p className="text-[#4A5568]">
                Shape the future of mortgage servicing
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Corporate Members Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#1A365D] mb-12">
            Our Corporate Members
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="w-40 h-20 bg-gray-100 rounded flex items-center justify-center"
              >
                <span className="text-gray-400">Logo {index}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#1A365D] mb-12">
            Latest Updates
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-6">
              <p className="text-sm text-[#4A5568] mb-2">March 15, 2024</p>
              <h3 className="text-xl font-semibold text-[#1A365D] mb-3">
                Quarterly Newsletter Released
              </h3>
              <p className="text-[#4A5568] mb-4">
                Explore the latest industry trends and insights in our newest newsletter
              </p>
              <Button variant="link" className="text-[#C4A484] p-0">
                Read More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-[#4A5568] mb-2">March 1, 2024</p>
              <h3 className="text-xl font-semibold text-[#1A365D] mb-3">
                New Resource Documents
              </h3>
              <p className="text-[#4A5568] mb-4">
                Access the latest guidelines and best practices documents
              </p>
              <Button variant="link" className="text-[#C4A484] p-0">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1A365D] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Join the Leading Mortgage Servicing Network
          </h2>
          <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Connect with industry leaders, access exclusive resources, and stay ahead of industry trends
          </p>
          <Button 
            className="bg-[#C4A484] hover:bg-[#B39374] text-white"
            size="lg"
          >
            Become a Member
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;