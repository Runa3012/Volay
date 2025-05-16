import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { UserIcon, EyeIcon, EyeOffIcon } from "lucide-react";

export const ForgotPassword = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || "patient";

  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"request-otp" | "reset-password">("request-otp");
  const [error, setError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleGenerateOtp = async () => {
    console.log("Generate OTP button clicked"); // Debug log
    if (!identifier) {
      setError("Please enter your phone number or email.");
      console.log("Error: Identifier is empty"); // Debug log
      return;
    }

    try {
      console.log("Sending generate-otp request:", { identifier, role }); // Debug log
      const response = await fetch("http://localhost:3001/generate-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, role }),
      });

      console.log("Generate OTP response status:", response.status); // Debug log
      const data = await response.json();
      console.log("Generate OTP response data:", data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate OTP");
      }

      setStep("reset-password");
      setError(null);
      console.log("Step updated to reset-password"); // Debug log
    } catch (error: any) {
      console.error("Generate OTP error:", error.message);
      setError(error.message);
    }
  };

  const handleResetPassword = async () => {
    console.log("Reset Password button clicked"); // Debug log
    if (!otp || !newPassword) {
      setError("Please enter the OTP and new password.");
      console.log("Error: OTP or new password is empty"); // Debug log
      return;
    }

    try {
      console.log("Sending reset-password request:", { identifier, otp, newPassword, role }); // Debug log
      const response = await fetch("http://localhost:3001/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp, newPassword, role }),
      });

      console.log("Reset Password response status:", response.status); // Debug log
      const data = await response.json();
      console.log("Reset Password response data:", data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      console.log("Navigating to /signin after password reset"); // Debug log
      navigate("/signin", { state: { role } });
    } catch (error: any) {
      console.error("Reset password error:", error.message);
      setError(error.message);
    }
  };

  const handleSignInRedirect = () => {
    console.log("Sign In link clicked, navigating to /signin"); // Debug log
    navigate("/signin", { state: { role } });
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
    console.log("Toggled new password visibility:", !showNewPassword); // Debug log
  };

  return (
    <div className="bg-[#f5f5eb] flex justify-center w-full min-h-screen p-4">
      <div className="w-full max-w-[412px] flex flex-col items-center border border-black rounded-xl p-4 bg-white">
        <h1 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4">
          Reset Password
        </h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded-lg mb-4">{error}</div>}
        {step === "request-otp" ? (
          <>
            <div className="w-full relative">
              <label htmlFor="identifier" className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                Phone Number or Email
              </label>
              <div className="relative">
                <Input
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your phone number or email"
                  className="h-[40px] pr-10"
                />
                <UserIcon className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-black" />
              </div>
            </div>
            <Button
              onClick={handleGenerateOtp}
              className="w-full h-[40px] bg-[#DBDBC8] text-black rounded-lg border border-[#DBDBC8] hover:bg-[#b1b199] transition-all duration-300 mt-4"
            >
              <span className="font-['Montserrat',Helvetica] text-black text-sm">Generate OTP</span>
            </Button>
            <p className="font-['Montserrat',Helvetica] text-black text-sm mt-4 text-center">
              Remembered your password?{" "}
              <button onClick={handleSignInRedirect} className="font-bold italic text-black focus:outline-none underline">
                Sign In
              </button>
            </p>
          </>
        ) : (
          <>
            <div className="w-full">
              <label htmlFor="otp" className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                OTP
              </label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the OTP"
                className="h-[40px]"
              />
            </div>
            <div className="w-full relative mt-4">
              <label htmlFor="newPassword" className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="h-[40px] pr-10"
                />
                <button
                  type="button"
                  onClick={toggleNewPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black"
                >
                  {showNewPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              onClick={handleResetPassword}
              className="w-full h-[40px] bg-[#DBDBC8] text-black rounded-lg border border-[#DBDBC8] hover:bg-[#b1b199] transition-all duration-300 mt-4"
            >
              <span className="font-['Montserrat',Helvetica] text-black text-sm">Reset Password</span>
            </Button>
            <p className="font-['Montserrat',Helvetica] text-black text-sm mt-4 text-center">
              Password reset successful?{" "}
              <button onClick={handleSignInRedirect} className="font-bold italic text-black focus:outline-none underline">
                Sign In
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};