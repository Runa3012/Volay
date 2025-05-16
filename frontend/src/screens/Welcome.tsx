import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";

export const Welcome: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/role"); // Navigate to Role screen after 3 sec
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [navigate]);

  return (
    <div className="bg-[#F5F5EB] flex flex-col items-center justify-center min-h-screen w-full">
      <Card className="bg-transparent border-none shadow-none w-full max-w-md">
        <CardContent className="flex items-center justify-center p-6">
          <h1 className="font-['Montserrat',Helvetica] font-bold text-black text-[75px] text-center">
            Volay
          </h1>
        </CardContent>
      </Card>
    </div>
  );
};

export default Welcome;
