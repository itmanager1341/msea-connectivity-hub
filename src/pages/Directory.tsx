import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Directory = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Member Directory</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <Button
              onClick={() => navigate("/portal")}
              className="bg-primary text-white"
            >
              Member Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Directory;