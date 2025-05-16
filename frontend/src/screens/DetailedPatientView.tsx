import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { UserIcon, ArrowLeftIcon, ActivityIcon, HeartIcon } from "lucide-react";

export const DetailedPatientView = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    // Fetch patient details from backend
    fetch(`http://localhost:3001/patients/${id}`)
      .then((res) => res.json())
      .then((data) => setPatient(data))
      .catch((err) => console.error("Failed to fetch patient details:", err));
  }, [id]);

  if (!patient) {
    return (
      <div className="bg-[#f5f5eb] min-h-screen p-4">
        <p className="font-['Montserrat',Helvetica] text-black text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5eb] min-h-screen p-4">
      <div className="w-full max-w-[412px] mx-auto">
        {/* Back Button */}
        <Button
          onClick={() => navigate("/caregiver-dashboard")}
          className="mb-4 bg-[#DBDBC8] text-black hover:bg-[#b1b199]"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        {/* Patient Profile */}
        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="w-[60px] h-[60px] bg-gray-200 rounded-full flex items-center justify-center">
              {patient.profilePictureUrl ? (
                <img
                  src={patient.profilePictureUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <div>
              <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold">{patient.name}</h2>
              <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">Patient ID: {patient.id}</p>
            </div>
          </div>

          {/* Health Stats */}
          <div className="mt-4">
            <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold flex items-center gap-2">
              <HeartIcon className="w-5 h-5" /> Health Stats
            </h3>
            <p className="font-['Montserrat',Helvetica] text-black text-sm mt-2">
              Mood: {patient.mood || "Unknown"}
            </p>
            <p className="font-['Montserrat',Helvetica] text-black text-sm">
              Cognitive Score: {patient.cognitiveScore || "N/A"}
            </p>
            <p className="font-['Montserrat',Helvetica] text-black text-sm">
              Heart Rate: {patient.heartRate || "N/A"} bpm
            </p>
            <p className="font-['Montserrat',Helvetica] text-black text-sm">
              Sleep: {patient.sleep || "N/A"} hours
            </p>
          </div>

          {/* Recent Activities */}
          <div className="mt-4">
            <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold flex items-center gap-2">
              <ActivityIcon className="w-5 h-5" /> Recent Activities
            </h3>
            <p className="font-['Montserrat',Helvetica] text-black text-sm mt-2">
              Last Activity: {patient.lastActivity || "No recent activity"}
            </p>
            {/* Add more activity logs as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};