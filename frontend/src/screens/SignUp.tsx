import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { UserIcon, MailIcon, PhoneIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import BackArrow from "../components/ui/back-arrow";

export const SignUp = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { caregiverId } = useParams();

  const isPatientSignup = !!caregiverId;
  const role = isPatientSignup ? "patient" : (location.state?.role || "patient");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    return /^\+?[1-9]\d{1,14}$/.test(phone);
  };

  const isValidPassword = (password: string) => {
    return password.length >= 8 && password.length <= 20;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Please enter your full name";
    }

    if (!isPatientSignup) {
      if (!email.trim()) {
        newErrors.email = "Please enter your email";
      } else if (!isValidEmail(email)) {
        newErrors.email = "Please enter a valid email";
      }
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Please enter your phone number";
    } else if (!isValidPhone(phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number (e.g., +1234567890)";
    }

    if (isPatientSignup && !dob) {
      newErrors.dob = "Please enter the date of birth";
    }

    if (!isPatientSignup) {
      if (!password.trim()) {
        newErrors.password = "Please enter a password";
      } else if (!isValidPassword(password)) {
        newErrors.password = "Password must be 8-20 characters long";
      }

      if (!confirmPassword.trim()) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (!termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and conditions";
    }

    if (!privacyAccepted) {
      newErrors.privacyAccepted = "You must accept the privacy policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const endpoint = isPatientSignup
        ? `http://localhost:3001/caregivers/${caregiverId}/patients`
        : "http://localhost:3001/signup/email";

      const payload = isPatientSignup
        ? {
            name,
            dob,
            contactInfo: phoneNumber,
            medicalHistory: "",
            dementiaStage: "",
            emergencyContact: "",
          }
        : {
            name,
            email,
            phoneNumber,
            password,
            role,
            termsAccepted,
            privacyAccepted,
            newsletterSubscribed,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      if (isPatientSignup) {
        if (!data.patientId) {
          throw new Error("Patient ID not returned from the server");
        }
        // Store patientId and role in localStorage for ProtectedRoute
        localStorage.setItem("userId", data.patientId.toString());
        localStorage.setItem("role", "patient");
        localStorage.setItem("name", name); // Store name for display
        navigate("/patient-basic-information", {
          state: { patientId: data.patientId, role: "patient", caregiverId },
        });
      } else {
        if (!data.userId) {
          throw new Error("User ID not returned from the server");
        }
        // Store userId, role, and name in localStorage for ProtectedRoute
        localStorage.setItem("userId", data.userId.toString());
        localStorage.setItem("role", role);
        localStorage.setItem("name", name);
        const nextRoute = role.toLowerCase() === "caregiver" ? "/caregiver-basic-information" : "/patient-basic-information";
        navigate(nextRoute, { state: { userId: data.userId, role } });
      }
    } catch (error: any) {
      console.error("Signup error:", error.message);
      setErrors((prev) => ({ ...prev, server: error.message }));
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-[#f5f5eb] flex flex-row justify-center w-full min-h-screen">
      <div className="w-full max-w-[412px] flex flex-col items-center p-4">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 absolute top-3 left-0.5 p-2"
          aria-label="Go back"
          onClick={() => navigate(isPatientSignup ? "/caregiver-dashboard" : "/role")} // Changed to caregiver-dashboard for consistency
        >
          <BackArrow />
        </button>

        <div className="mt-6 w-full text-center">
          <div className="w-full font-['Montserrat',Helvetica] text-black text-[24px] leading-tight">
            <span className="font-bold">
              {isPatientSignup ? "Add a New Patient" : "Create a new account"}
            </span>
          </div>
          <div className="w-full font-['Montserrat',Helvetica] text-black text-[16px] mt-2">
            <span>Basic Information</span>
          </div>
        </div>

        <div className="mt-6 w-full border border-black rounded-xl p-4 bg-white">
          <div className="relative">
            <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
              Full Name
            </label>
            <div className="relative">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black pr-10"
              />
              <UserIcon className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-black" />
            </div>
            {errors.name && (
              <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.name}</p>
            )}
          </div>

          {isPatientSignup && (
            <div className="mt-4 relative">
              <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                Birthdate *
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={today}
                className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black appearance-none pr-3"
                required
              />
              {errors.dob && (
                <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.dob}</p>
              )}
            </div>
          )}

          {!isPatientSignup && (
            <div className="mt-4 relative">
              <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                Email Address (used for login)
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black pr-10"
                />
                <MailIcon className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-black" />
              </div>
              {errors.email && (
                <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.email}</p>
              )}
            </div>
          )}

          <div className="mt-4 relative">
            <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
              Phone number
            </label>
            <div className="relative">
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 Phone number"
                className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black pr-10"
              />
              <PhoneIcon className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-black" />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.phoneNumber}</p>
            )}
          </div>

          {!isPatientSignup && (
            <>
              <div className="mt-4 relative">
                <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                  Create password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black pr-10"
                  />
                  {showPassword ? (
                    <EyeOffIcon
                      className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-black cursor-pointer"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <EyeIcon
                      className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-black cursor-pointer"
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </div>
                {errors.password && (
                  <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.password}</p>
                )}
              </div>

              <div className="mt-4 relative">
                <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                  Confirm password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black pr-10"
                  />
                  {showConfirmPassword ? (
                    <EyeOffIcon
                      className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-black cursor-pointer"
                      onClick={() => setShowConfirmPassword(false)}
                    />
                  ) : (
                    <EyeIcon
                      className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-black cursor-pointer"
                      onClick={() => setShowConfirmPassword(true)}
                    />
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="font-['Montserrat',Helvetica] text-black text-sm">
                I accept the terms and conditions
              </span>
            </label>
            {errors.termsAccepted && (
              <p className="text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.termsAccepted}</p>
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="font-['Montserrat',Helvetica] text-black text-sm">
                I accept the privacy policy
              </span>
            </label>
            {errors.privacyAccepted && (
              <p className="text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.privacyAccepted}</p>
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newsletterSubscribed}
                onChange={(e) => setNewsletterSubscribed(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="font-['Montserrat',Helvetica] text-black text-sm">
                I would like to subscribe to Volay’s email newsletter
              </span>
            </label>
          </div>

          {errors.server && (
            <p className="mt-4 text-red-500 text-center font-['Montserrat',Helvetica] text-sm whitespace-normal break-words w-full">
              {errors.server}
            </p>
          )}

          <Button
            onClick={handleSignUp}
            disabled={!termsAccepted || !privacyAccepted}
            className={`w-full h-[40px] text-black rounded-lg transition-all duration-300 mt-4 ${
              !termsAccepted || !privacyAccepted
                ? 'bg-[#DBDBC8] cursor-not-allowed'
                : 'bg-[#DBDBC8] hover:bg-[#b1b199]'
            }`}
          >
            <span className="font-['Montserrat',Helvetica] text-black text-sm">
              {isPatientSignup ? "Add Patient" : "Next"}
            </span>
          </Button>
        </div>

        {!isPatientSignup && (
          <p className="mt-4 text-center font-['Montserrat',Helvetica] font-normal text-black text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/signin", { state: { role } })}
              className="font-bold italic text-black focus:outline-none underline"
            >
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );
};