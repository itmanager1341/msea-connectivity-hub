import { Link } from "react-router-dom";
import { useState } from "react";
import Auth from "./Auth";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Welcome to MSEA</h1>
          <p className="mt-3 text-xl text-gray-500">
            Your gateway to professional excellence
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Sign In
            </button>
            <Link
              to="/about"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {showAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg w-full max-w-md mx-4">
            <Auth onClose={() => setShowAuth(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;