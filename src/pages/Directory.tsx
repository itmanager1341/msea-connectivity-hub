import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const Directory = () => {
  const industryMembers = [
    { name: "Bank of America", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#bankofamerica" },
    { name: "BOK Financial", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#bokfinancial" },
    { name: "BSI Financial Services", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#bsi" },
    { name: "Carrington", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#carrington" },
    { name: "Fannie Mae", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#fanniemae" },
    { name: "Flagstar Bank", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#flagstar" },
    { name: "Freddie Mac", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#freddiemac" },
    { name: "Loancare", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#loancare" },
    { name: "Midland Mortgage", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#midland" },
    { name: "MidFirst Bank", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#midfirst" },
    { name: "Mr. Cooper", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#mrcooper" },
    { name: "M&T Bank", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#mtbank" },
    { name: "Servbank", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#servbank" },
    { name: "Specialized Loan Servicing", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#sls" },
    { name: "ServiceMac", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#servicemac" },
    { name: "Truist", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#truist" },
    { name: "US Bank", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#usbank" },
    { name: "Wells Fargo", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#wellsfargo" }
  ];

  const corporateMembers = [
    { name: "Auction.com", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#auction" },
    { name: "Altisource", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#altisource" },
    { name: "Aspen Grove", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#aspengrove" },
    { name: "Dimont", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#dimont" },
    { name: "Guardian Asset Management", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#guardian" },
    { name: "MCS", logo: "/lovable-uploads/23db8782-0b26-41ae-8300-9bb7a5ee664c.png#mcs" }
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

      {/* Directory Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Industry Members Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-[#1A365D] mb-8">MORTGAGE COMPANY MEMBERS</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {industryMembers.map((member) => (
              <div 
                key={member.name}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-center h-24"
              >
                <img
                  src={member.logo}
                  alt={`${member.name} logo`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Corporate Members Section */}
        <section>
          <h2 className="text-3xl font-bold text-[#1A365D] mb-8">CORPORATE MEMBERS</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {corporateMembers.map((member) => (
              <div 
                key={member.name}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-center h-24"
              >
                <img
                  src={member.logo}
                  alt={`${member.name} logo`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Directory;