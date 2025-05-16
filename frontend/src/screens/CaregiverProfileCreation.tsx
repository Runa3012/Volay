import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { UserIcon } from "lucide-react";

export const CaregiverProfileCreation = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;
  const role = location.state?.role || "caregiver";
  const name = location.state?.name || "User"; // Fallback to "User" if name is not provided
  const profilePictureUrl = location.state?.profilePictureUrl; // URL of the uploaded profile picture

  const handleComplete = () => {
    navigate("/caregiver-dashboard", { state: { userId, role, name } });
  };

  const handleAddPatient = () => {
    navigate(`/caregiver/patient-signup/${userId}`, { state: { caregiverId: userId, role: "caregiver" } });
  };

  return (
    <main className="bg-[#f5f5eb] flex justify-center w-full min-h-screen p-4">
      <div className="w-full max-w-[412px] flex flex-col items-center">
        {/* Progress Indicator */}
        <div className="mt-4 w-full flex justify-center gap-2">
          <div className="w-8 h-2 bg-gray-300 rounded"></div>
          <div className="w-8 h-2 bg-gray-300 rounded"></div>
          <div className="w-8 h-2 bg-[#b1b199] rounded"></div>
        </div>

        {/* Profile Picture */}
        <div className="mt-6">
          <div className="w-[100px] h-[100px] bg-gray-200 border border-gray-200 rounded-full flex items-center justify-center">
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-12 h-12 text-gray-500" />
            )}
          </div>
        </div>

        <div className="mt-6 w-full text-center">
          <div className="font-['Montserrat',Helvetica] text-black text-[24px] leading-tight">
            <span className="font-bold">Welcome, {name}!</span>
          </div>
          <div className="font-['Montserrat',Helvetica] text-black text-[16px] mt-2">
            <span>Profile setup complete!</span>
          </div>
        </div>

        {/* Guidance Message */}
        <div className="mt-4 w-full text-center">
          <p className="font-['Montserrat',Helvetica] text-black text-sm">
            Adding patients allows you to manage their care. You can always add more patients from your dashboard.
          </p>
        </div>

        {/* Add Patients Button */}
        <Button
          onClick={handleAddPatient}
          className="w-full h-[40px] bg-[#DBDBC8] text-black rounded-lg border border-[#DBDBC8] hover:bg-[#b1b199] transition-all duration-300 mt-4 animate-fade-in"
        >
          <span className="font-['Montserrat',Helvetica] text-black text-sm">
            + Add Patients
          </span>
        </Button>

        {/* Go to Dashboard Button */}
        <Button
          onClick={handleComplete}
          className="w-full h-[40px] bg-[#DBDBC8] text-black rounded-lg border border-[#DBDBC8] hover:bg-[#b1b199] transition-all duration-300 mt-4 animate-fade-in"
        >
          <span className="font-['Montserrat',Helvetica] text-black text-sm">
            Go to Dashboard
          </span>
        </Button>
      </div>
    </main>
  );
};