import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { UserIcon } from "lucide-react";

export const CaregiverBasicInformation = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId || localStorage.getItem("userId"); // Fallback to localStorage
  const role = location.state?.role || localStorage.getItem("role") || "caregiver";

  // Profile fields
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [relationship, setRelationship] = useState("");
  const [age, setAge] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [numPatients, setNumPatients] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [backupContactName, setBackupContactName] = useState("");
  const [backupContactPhone, setBackupContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notifications, setNotifications] = useState({ email: false, sms: false, app: false });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate userId
    if (!userId) {
      setError("User ID not found. Please sign in again.");
      navigate("/signin", { state: { role: "caregiver" } });
      return;
    }

    // Validate required fields
    if (
      !name ||
      !relationship ||
      !age ||
      !birthdate ||
      !gender ||
      !numPatients ||
      !termsAccepted ||
      !experienceLevel
    ) {
      setError("All required fields must be filled, and you must accept the terms.");
      return;
    }

    // Validate age (must be 18 or above)
    const ageNumber = parseInt(age, 10);
    if (isNaN(ageNumber) || ageNumber < 18) {
      setError("You must be 18 years or older to register as a caregiver.");
      return;
    }

    // Prepare form data for file upload
    const formData = new FormData();
    formData.append("name", name);
    formData.append("address", address);
    formData.append("relationship", relationship);
    formData.append("age", age);
    formData.append("birthdate", birthdate);
    formData.append("gender", gender);
    formData.append("num_patients", numPatients);
    formData.append("experience_level", experienceLevel);
    formData.append("backup_contact_name", backupContactName);
    formData.append("backup_contact_phone", backupContactPhone);
    formData.append("notifications_email", notifications.email ? "1" : "0");
    formData.append("notifications_sms", notifications.sms ? "1" : "0");
    formData.append("notifications_app", notifications.app ? "1" : "0");
    if (profilePicture) {
      formData.append("profile_picture", profilePicture);
    }

    // Log the form data for debugging
    console.log("Submitting form data to server:");
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      const response = await fetch(`http://localhost:3001/caregivers/${userId}`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update caregiver profile");
      }

      // Update name in localStorage if changed
      if (name !== localStorage.getItem("name")) {
        localStorage.setItem("name", name);
      }

      // Navigate to the profile creation confirmation page, passing name and profilePictureUrl
      const profilePictureUrl = data.profilePictureUrl || (profilePicture ? URL.createObjectURL(profilePicture) : null);
      navigate("/caregiver-profile", { state: { role, userId, name, profilePictureUrl } });
    } catch (err: any) {
      setError(err.message || "An error occurred while updating the profile");
    }
  };

  // Current date for max attribute
  const today = "2025-05-05";

  return (
    <main className="bg-[#f5f5eb] flex justify-center w-full min-h-screen">
      <div className="w-full max-w-[412px] flex flex-col items-center p-4">
        <div className="mt-6 w-full text-center">
          <div className="font-['Montserrat',Helvetica] text-black text-[24px] leading-tight">
            <span className="font-bold">Caregiver Profile Creation</span>
          </div>
          <div className="font-['Montserrat',Helvetica] text-black text-[16px] mt-2">
            <span>Basic Information</span>
          </div>
        </div>

        <div className="mt-6 w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Profile Picture */}
            <div className="w-full border-2 border-black rounded-xl p-4 bg-white">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-[100px] h-[100px] bg-[#DBDBC8] rounded-full flex items-center justify-center">
                    {profilePicture ? (
                      <img
                        src={URL.createObjectURL(profilePicture)}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-black" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#b1b199] rounded-full flex items-center justify-center cursor-pointer">
                    <span className="text-black text-sm">+</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="mt-4">
                <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                  Name *
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              {/* Address */}
              <div className="mt-4">
                <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                  Address (Optional)
                </label>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address"
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Relationship to Patient */}
              <div className="mt-4">
                <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                  Relationship to Patient(s) *
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="">Select relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Age */}
              <div className="mt-4">
                <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                  Age *
                </label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              {/* Birthdate */}
              <div className="mt-4">
                <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                  Birthdate *
                </label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  max={today}
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black appearance-none pr-3"
                  required
                />
              </div>

              {/* Gender */}
              <div className="mt-4">
                <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Number of Patients */}
              <div className="mt-4">
                <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                  Number of Patients You Care For *
                </label>
                <Input
                  type="number"
                  value={numPatients}
                  onChange={(e) => setNumPatients(e.target.value)}
                  placeholder="Enter number of patients"
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              {/* Experience Level */}
              <div className="mt-4">
                <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                  Experience Level *
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="">Select experience level</option>
                  <option value="First-time">First-time</option>
                  <option value="Experienced">Experienced</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>

              {/* Backup Contact Info */}
              <div className="mt-4">
                <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                  Backup Contact Name (Optional)
                </label>
                <Input
                  type="text"
                  value={backupContactName}
                  onChange={(e) => setBackupContactName(e.target.value)}
                  placeholder="Backup contact name"
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="mt-4">
                <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                  Backup Contact Phone (Optional)
                </label>
                <Input
                  type="tel"
                  value={backupContactPhone}
                  onChange={(e) => setBackupContactPhone(e.target.value)}
                  placeholder="Backup contact phone"
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Notifications Settings */}
              <div className="mt-4">
                <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                  Notifications Settings (Optional)
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="font-['Montserrat',Helvetica] text-black text-sm">
                      Email Notifications
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="font-['Montserrat',Helvetica] text-black text-sm">
                      SMS Notifications
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={notifications.app}
                      onChange={(e) => setNotifications({ ...notifications, app: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="font-['Montserrat',Helvetica] text-black text-sm">
                      App Notifications
                    </span>
                  </label>
                </div>
              </div>

              {/* Consent Agreement */}
              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4"
                    required
                  />
                  <span className="font-['Montserrat',Helvetica] text-black text-sm">
                    I agree to the terms and conditions
                  </span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-[40px] bg-[#DBDBC8] text-black rounded-lg border border-[#DBDBC8] hover:bg-[#b1b199] transition-all duration-300 mt-4"
            >
              <span className="font-['Montserrat',Helvetica] text-black text-sm">
                Next
              </span>
            </Button>
          </form>

          {error && (
            <p className="text-red-500 font-['Montserrat',Helvetica] text-sm mt-4 text-center">{error}</p>
          )}
        </div>
      </div>
    </main>
  );
};