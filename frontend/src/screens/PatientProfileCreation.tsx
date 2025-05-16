import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { UserIcon } from "lucide-react";
import BackArrow from "../components/ui/back-arrow";

export const PatientProfileCreation = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId, role, name, profilePictureUrl, caregiverId } = location.state || {};

  // Validate required state
  if (!patientId || !role || !name) {
    return <div>Error: Missing user information. Please go back and try again.</div>;
  }

  const handleComplete = () => {
    // Pass all relevant data to the dashboard and include patientId in the URL
    navigate(`/patient-dashboard/${patientId}`, { state: { patientId, role, name, profilePictureUrl, caregiverId } });
  };

  const handleBack = () => {
    navigate("/patient-basic-information", { state: { patientId, role, caregiverId } });
  };

  return (
    <main className="bg-[#f5f5eb] flex justify-center w-full min-h-screen p-4">
      <div className="w-full max-w-[412px] flex flex-col items-center border border-black rounded-xl p-4 bg-white relative">
        {/* Back Button */}
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 absolute top-3 left-0.5 p-2"
          aria-label="Go back"
          onClick={handleBack}
        >
          <BackArrow />
        </button>

        {/* Profile Picture */}
        <div className="mt-6">
          <div className="w-[100px] h-[100px] bg-gray-200 rounded-full flex items-center justify-center">
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
        <Button
          onClick={handleComplete}
          className="w-full h-[40px] bg-[#DBDBC8] text-black rounded-lg border border-[#DBDBC8] hover:bg-[#b1b199] transition-all duration-300 mt-2"
        >
          <span className="font-['Montserrat',Helvetica] text-black text-sm">
            Go to Dashboard
          </span>
        </Button>
      </div>
    </main>
  );
};