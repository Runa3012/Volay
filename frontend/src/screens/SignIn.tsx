import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { UserIcon, EyeIcon, EyeOffIcon } from "lucide-react";

export const SignIn = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || "patient";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    console.log("Sign In button clicked");
    if (!identifier) {
      setError("Please enter your phone number or email.");
      console.log("Error: Identifier is empty");
      return;
    }

    if (role === "caregiver" && !password) {
      setError("Password is required for caregivers.");
      console.log("Error: Password is required for caregivers");
      return;
    }

    try {
      console.log("Sending sign-in request:", { identifier, password, role });
      const response = await fetch("http://localhost:3001/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, role }),
      });

      console.log("Sign-in response status:", response.status);
      const data = await response.json();
      console.log("Sign-in response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Sign-in failed");
      }

      // Store userId and role in localStorage
      localStorage.setItem("userId", data.userId.toString());
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name || ""); // Store name for display purposes
      console.log("Stored in localStorage:", { userId: data.userId, role: data.role, name: data.name });

      // Navigate to the appropriate dashboard
      if (data.role === "patient") {
        console.log(`Navigating to /patient-dashboard/${data.userId}`);
        navigate(`/patient-dashboard/${data.userId}`, { state: { patientId: data.userId, role: data.role } });
      } else {
        console.log("Navigating to /caregiver-dashboard");
        navigate("/caregiver-dashboard", { state: { userId: data.userId, role: data.role } });
      }
    } catch (error: any) {
      console.error("Sign-in error:", error.message);
      setError(error.message);
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot Password clicked, navigating to /forgot-password");
    navigate("/forgot-password", { state: { role } });
  };

  const handleSignUpRedirect = () => {
    console.log("Sign Up link clicked, navigating to /signup");
    navigate("/signup", { state: { role } });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    console.log("Toggled password visibility:", !showPassword);
  };

  return (
    <div className="bg-[#f5f5eb] flex flex-col items-center w-full min-h-screen p-4">
      <div className="w-full max-w-[412px] flex justify-center mb-4">
        <h1 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold">
          Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
        </h1>
      </div>
      <div className="w-full max-w-[412px] flex flex-col items-center border border-black rounded-xl p-4 bg-white">
        {error && <div className="bg-red-100 text-red-700 p-2 rounded-lg mb-4">{error}</div>}
        <div className="w-full relative">
          <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
            Phone number or Email
          </label>
          <div className="relative">
            <Input
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Phone Number or Email"
              className="h-[40px] pr-10"
            />
            <UserIcon className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-black" />
          </div>
        </div>
        <div className="w-full relative mt-4">
          <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={role === "patient" ? "Password" : "Password"}
              className="h-[40px] pr-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black"
            >
              {showPassword ? (
                <EyeOffIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <button
          onClick={handleForgotPassword}
          className="font-['Montserrat',Helvetica] text-black text-sm mt-2 self-start"
        >
          Forgot Password?
        </button>
        <Button
          onClick={handleSignIn}
          className="w-full h-[40px] bg-[#DBDBC8] text-black rounded-lg border border-[#DBDBC8] hover:bg-[#b1b199] transition-all duration-300 mt-4"
        >
          <span className="font-['Montserrat',Helvetica] text-black text-sm">Sign In</span>
        </Button>
        <p className="font-['Montserrat',Helvetica] text-black text-sm mt-4 text-center">
          Don’t have an account?{" "}
          <button onClick={handleSignUpRedirect} className="font-bold italic text-black focus:outline-none underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};