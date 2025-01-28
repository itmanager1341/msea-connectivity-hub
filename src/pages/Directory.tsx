import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Directory = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Member Directory</h1>
        <Card>
          <CardHeader>
            <CardTitle>Welcome to the Member Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Access the member directory by logging into your account. If you're already a member,
              click below to sign in and view the directory.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => navigate("/portal")}
                className="bg-primary text-white"
              >
                Member Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Directory;