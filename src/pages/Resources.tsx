import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, FileText, Video, Download, LogIn } from "lucide-react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";

const Resources = () => {
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

      {/* Resources Hero Section */}
      <section className="bg-[#1A365D] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Member Resources</h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-gray-200">
            Access exclusive industry insights, best practices, and educational materials
          </p>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <BookOpen className="w-12 h-12 text-[#C4A484] mb-4" />
              <h3 className="text-xl font-semibold text-[#1A365D] mb-3">
                Industry Guides
              </h3>
              <p className="text-[#4A5568] mb-4">
                Comprehensive guides on mortgage servicing best practices and industry standards
              </p>
              <Button variant="outline" className="w-full">
                View Guides
              </Button>
            </Card>
            <Card className="p-6">
              <Video className="w-12 h-12 text-[#C4A484] mb-4" />
              <h3 className="text-xl font-semibold text-[#1A365D] mb-3">
                Webinar Recordings
              </h3>
              <p className="text-[#4A5568] mb-4">
                Access recordings of our expert-led webinars and educational sessions
              </p>
              <Button variant="outline" className="w-full">
                Watch Videos
              </Button>
            </Card>
            <Card className="p-6">
              <FileText className="w-12 h-12 text-[#C4A484] mb-4" />
              <h3 className="text-xl font-semibold text-[#1A365D] mb-3">
                Templates & Tools
              </h3>
              <p className="text-[#4A5568] mb-4">
                Download useful templates and tools for mortgage servicing professionals
              </p>
              <Button variant="outline" className="w-full">
                Access Tools
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Resources */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#1A365D] mb-12 text-center">
            Latest Resources
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#1A365D] rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#4A5568] mb-1">March 15, 2024</p>
                    <h3 className="text-lg font-semibold text-[#1A365D] mb-2">
                      2024 Servicing Guidelines Update
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Updated guidelines for mortgage servicing operations in 2024
                    </p>
                    <Button variant="ghost" className="h-8 px-0 text-[#C4A484]">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Member Access CTA */}
      <section className="bg-[#1A365D] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Access Premium Resources
          </h2>
          <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Join MSEA to unlock our full library of resources and stay ahead of industry trends
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

export default Resources;