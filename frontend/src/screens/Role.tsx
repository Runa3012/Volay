import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { UserIcon, HeartIcon } from "lucide-react";
import UnionImage from "../components/ui/Union.png";

export const Role = (): JSX.Element => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState<string | null>(null);

  const roleOptions = [
    { id: 1, label: "Caregiver", description: "For those managing care for loved ones.", icon: <UserIcon className="w-6 h-6" /> },
    { id: 2, label: "Patient", description: "For individuals receiving care (must be registered by a caregiver).", icon: <HeartIcon className="w-6 h-6" /> },
  ];

  const handleSelectRole = (role: string) => {
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === "caregiver") {
      navigate("/signup", { state: { role: normalizedRole } });
    } else if (normalizedRole === "patient") {
      setNotification("Patients must be registered by a caregiver to sign in. If you haven’t been registered, please contact your caregiver.");
      navigate("/signin", { state: { role: normalizedRole } });
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <main className="bg-[#ffffff] flex justify-center w-full min-h-screen">
      <div className="bg-[#ffffff]/80 backdrop-blur-sm w-full max-w-[412px] relative min-h-[917px] flex flex-col items-center rounded-lg shadow-lg">
        {notification && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-3/4 max-w-[350px] bg-[#DBDBC8] text-black p-4 rounded-lg shadow-md z-50 animate-slideDown">
            <p className="font-['Montserrat',Helvetica] text-sm text-center">{notification}</p>
          </div>
        )}

        <img
          className="h-[470px] object-cover animate-fadeIn"
          alt="Decorative curved shape"
          src={UnionImage}
        />

        <div className="mt-6 px-4 w-full text-center">
          <div className="font-['Montserrat',Helvetica] text-black text-[36px] leading-tight">
            <span className="font-bold drop-shadow-md">
              Welcome to Volay.
              <br />
            </span>
            <span className="italic text-lg text-gray-800 drop-shadow-sm">
              Your trusted companion for safer, smarter, and more connected <br /> elderly care.
            </span>
          </div>
        </div>

        <div className="mt-12 mb-6">
          <h2 className="font-['Montserrat',Helvetica] font-normal text-black text-[34px] text-center mb-10 drop-shadow-md">
            Choose your role:
          </h2>

          <div className="flex justify-center gap-6">
            {roleOptions.map((role) => (
              <div key={role.id} className="flex flex-col items-center">
                <Button
                  onClick={() => handleSelectRole(role.label)}
                  className="w-[160px] h-[52px] bg-[#DBDBC8] text-black rounded-lg border border-[#DBDBC8] hover:bg-[#b1b199] transition-all duration-300 flex items-center justify-center gap-2"
                  aria-label={`Select ${role.label} role`}
                >
                  {role.icon}
                  <span className="font-['Montserrat',Helvetica] font-bold text-black text-xl">
                    {role.label}
                  </span>
                </Button>
                <p className="mt-2 text-center font-['Montserrat',Helvetica] text-black text-sm max-w-[160px]">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 1s ease-in-out;
          }
          .animate-slideDown {
            animation: slideDown 0.5s ease-in-out;
          }
        `}
      </style>
    </main>
  );
};

export default Role;