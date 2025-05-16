import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { UserIcon, Trash2Icon } from "lucide-react";
import BackArrow from "../components/ui/back-arrow";

export const PatientBasicInformation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { patientId, role, caregiverId } = location.state || {};

  // Redirect if required state is missing
  useEffect(() => {
    if (!patientId || !role || !caregiverId) {
      navigate(`/caregiver/patient-signup/${caregiverId || ""}`, {
        replace: true,
        state: { error: "Missing user information. Please try again." },
      });
    }
  }, [patientId, role, caregiverId, navigate]);

  // Profile fields
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [dementiaStage, setDementiaStage] = useState("");
  const [knownConditions, setKnownConditions] = useState<string[]>([]);
  const [cognitiveAbilities, setCognitiveAbilities] = useState({
    canRead: false,
    canSpeak: false,
    understandsImages: false,
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<
    { name: string; phone: string; relation: string }[]
  >([]);
  const [interests, setInterests] = useState("");
  const [pastOccupation, setPastOccupation] = useState("");
  const [memoryBookEntries, setMemoryBookEntries] = useState<File[]>([]);
  const [voiceSample, setVoiceSample] = useState<File | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [favoritePeople, setFavoritePeople] = useState<
    { name: string; photo: File | null }[]
  >([]);
  const [livingSituation, setLivingSituation] = useState("");
  const [mobilityLevel, setMobilityLevel] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isValidPhone = (phone: string) => {
    return /^\+?[1-9]\d{1,14}$/.test(phone);
  };

  const handleAddEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: "", phone: "", relation: "" }]);
  };

  const handleEmergencyContactChange = (
    index: number,
    field: "name" | "phone" | "relation",
    value: string
  ) => {
    const updatedContacts = [...emergencyContacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setEmergencyContacts(updatedContacts);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`emergencyContact${field}_${index}`];
      return newErrors;
    });
  };

  const handleDeleteEmergencyContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const handleAddFavoritePerson = () => {
    setFavoritePeople([...favoritePeople, { name: "", photo: null }]);
  };

  const handleFavoritePersonChange = (
    index: number,
    field: "name" | "photo",
    value: string | File | null
  ) => {
    const updatedPeople = [...favoritePeople];
    updatedPeople[index] = { ...updatedPeople[index], [field]: value };
    setFavoritePeople(updatedPeople);
  };

  const handleDeleteFavoritePerson = (index: number) => {
    setFavoritePeople(favoritePeople.filter((_, i) => i !== index));
  };

  const handleDeleteMemoryBookEntry = (index: number) => {
    setMemoryBookEntries(memoryBookEntries.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Please enter your name";
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Please enter your date of birth";
    }

    if (!gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!dementiaStage) {
      newErrors.dementiaStage = "Please select your dementia stage";
    }

    if (knownConditions.length === 0) {
      newErrors.knownConditions = "Please select at least one known condition";
    }

    if (
      !cognitiveAbilities.canRead &&
      !cognitiveAbilities.canSpeak &&
      !cognitiveAbilities.understandsImages
    ) {
      newErrors.cognitiveAbilities = "Please select at least one cognitive ability";
    }

    if (emergencyContacts.length === 0) {
      newErrors.emergencyContact = "Please add at least one emergency contact";
    } else {
      emergencyContacts.forEach((contact, index) => {
        if (!contact.name.trim()) {
          newErrors[`emergencyContactName_${index}`] = "Please enter the emergency contact name";
        }
        if (!contact.phone.trim()) {
          newErrors[`emergencyContactPhone_${index}`] = "Please enter the emergency contact phone number";
        } else if (!isValidPhone(contact.phone)) {
          newErrors[`emergencyContactPhone_${index}`] = "Please enter a valid phone number (e.g., +1234567890)";
        }
        if (!contact.relation) {
          newErrors[`emergencyContactRelation_${index}`] = "Please select the emergency contact relation";
        }
      });
    }

    if (!interests.trim()) {
      newErrors.interests = "Please enter your interests";
    }

    if (!pastOccupation.trim()) {
      newErrors.pastOccupation = "Please enter your past occupation";
    }

    if (!termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("date_of_birth", dateOfBirth);
    formData.append("gender", gender);
    formData.append("dementia_stage", dementiaStage);
    formData.append("known_conditions", JSON.stringify(knownConditions));
    formData.append("cognitive_abilities", JSON.stringify(cognitiveAbilities));
    formData.append("emergency_contact", JSON.stringify(emergencyContacts));
    formData.append("interests", interests);
    formData.append("past_occupation", pastOccupation);
    if (profilePicture) {
      formData.append("profile_picture", profilePicture);
    }
    memoryBookEntries.forEach((file, index) => {
      formData.append(`memory_book_entries_${index}`, file);
    });
    if (voiceSample) {
      formData.append("voice_sample", voiceSample);
    }
    favoritePeople.forEach((person, index) => {
      formData.append(`favorite_people_${index}_name`, person.name);
      if (person.photo) {
        formData.append(`favorite_people_${index}_photo`, person.photo);
      }
    });
    formData.append("living_situation", livingSituation);
    formData.append("mobility_level", mobilityLevel);

    try {
      const response = await fetch(`http://localhost:3001/patients/${patientId}`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update patient profile");
      }

      const profilePictureUrl = data.profilePictureUrl || (profilePicture ? URL.createObjectURL(profilePicture) : null);

      navigate("/patient-profile", { state: { role, patientId, name, profilePictureUrl, caregiverId } });
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        server: err.message || "An error occurred while updating the profile",
      }));
    }
  };

  const today = "2025-05-11"; // Current date as per system prompt

  return (
    <div className="bg-[#f5f5eb] flex flex-row justify-center w-full min-h-screen">
      <div className="w-full max-w-[412px] flex flex-col items-center p-4">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 absolute top-3 left-0.5 p-2"
          aria-label="Go back"
          onClick={() => navigate(`/caregiver/patient-signup/${caregiverId}`, { state: { role, caregiverId } })}
        >
          <BackArrow />
        </button>

        <div className="mt-6 w-full text-center">
          <div className="w-full font-['Montserrat',Helvetica] text-black text-[24px] leading-tight">
            <span className="font-bold">Patient Profile Creation</span>
          </div>
          <div className="w-full font-['Montserrat',Helvetica] text-black text-[16px] mt-2">
            <span>Basic Information</span>
          </div>
        </div>

        <div className="mt-6 w-full border border-black rounded-xl p-4 bg-white">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="w-full rounded-xl p-4 bg-white">
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
            </div>

            <div className="mt-4 relative">
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
              {errors.name && (
                <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.name}</p>
              )}
            </div>

            <div className="mt-4 relative">
              <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                Birthdate *
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={today}
                className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black appearance-none pr-3"
                required
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.dateOfBirth}</p>
              )}
            </div>

            <div className="mt-4 relative">
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
              {errors.gender && (
                <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.gender}</p>
              )}
            </div>

            <div className="mt-4 relative">
              <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                Stage of Dementia *
              </label>
              <select
                value={dementiaStage}
                onChange={(e) => setDementiaStage(e.target.value)}
                className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                required
              >
                <option value="">Select stage</option>
                <option value="Early">Early</option>
                <option value="Mid">Mid</option>
                <option value="Advanced">Advanced</option>
              </select>
              {errors.dementiaStage && (
                <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.dementiaStage}</p>
              )}
            </div>

            <div className="mt-4 relative">
              <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                Known Conditions *
              </label>
              <div className="flex flex-col gap-2">
                {["Alzheimer's", "Vascular", "Lewy Body"].map((condition) => (
                  <label key={condition} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={knownConditions.includes(condition)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setKnownConditions([...knownConditions, condition]);
                        } else {
                          setKnownConditions(knownConditions.filter((c) => c !== condition));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="font-['Montserrat',Helvetica] text-black text-sm">
                      {condition}
                    </span>
                  </label>
                ))}
              </div>
              {errors.knownConditions && (
                <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.knownConditions}</p>
              )}
            </div>

            <div className="mt-4 relative">
              <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                Cognitive Abilities *
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cognitiveAbilities.canRead}
                    onChange={(e) =>
                      setCognitiveAbilities({ ...cognitiveAbilities, canRead: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="font-['Montserrat',Helvetica] text-black text-sm">
                    Can Read
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cognitiveAbilities.canSpeak}
                    onChange={(e) =>
                      setCognitiveAbilities({ ...cognitiveAbilities, canSpeak: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="font-['Montserrat',Helvetica] text-black text-sm">
                    Can Speak
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cognitiveAbilities.understandsImages}
                    onChange={(e) =>
                      setCognitiveAbilities({
                        ...cognitiveAbilities,
                        understandsImages: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="font-['Montserrat',Helvetica] text-black text-sm">
                    Understands Images
                  </span>
                </label>
              </div>
              {errors.cognitiveAbilities && (
                <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.cognitiveAbilities}</p>
              )}
            </div>

            <div className="mt-4 relative">
              <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                Emergency Contacts *
              </label>
              {emergencyContacts.length === 0 ? (
                <p className="font-['Montserrat',Helvetica] text-gray-500 text-sm mb-2">
                  No contacts added
                </p>
              ) : (
                emergencyContacts.map((contact, index) => (
                  <div key={index} className="relative mb-4 border border-gray-300 rounded-lg p-3">
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteEmergencyContact(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2Icon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                        Name
                      </label>
                      <Input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleEmergencyContactChange(index, "name", e.target.value)}
                        placeholder="Emergency contact name"
                        className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      {errors[`emergencyContactName_${index}`] && (
                        <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">
                          {errors[`emergencyContactName_${index}`]}
                        </p>
                      )}
                    </div>
                    <div className="mt-2">
                      <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleEmergencyContactChange(index, "phone", e.target.value)}
                        placeholder="+91 Phone number"
                        className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      {errors[`emergencyContactPhone_${index}`] && (
                        <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">
                          {errors[`emergencyContactPhone_${index}`]}
                        </p>
                      )}
                    </div>
                    <div className="mt-2">
                      <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                        Relation
                      </label>
                      <select
                        value={contact.relation}
                        onChange={(e) => handleEmergencyContactChange(index, "relation", e.target.value)}
                        className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="">Select relation</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Child">Child</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors[`emergencyContactRelation_${index}`] && (
                        <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">
                          {errors[`emergencyContactRelation_${index}`]}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
              <Button
                type="button"
                onClick={handleAddEmergencyContact}
                className="w-full h-[40px] bg-[#DBDBC8] text-black rounded-lg border border-[#DBDBC8] hover:bg-[#b1b199] transition-all duration-300 mt-4"
              >
                <span className="font-['Montserrat',Helvetica] text-black text-sm">
                  + Add Emergency Contact
                </span>
              </Button>
              {errors.emergencyContact && (
                <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.emergencyContact}</p>
              )}
            </div>

            <div className="mt-4 relative">
              <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                Interests & Hobbies *
              </label>
              <Input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Enter your interests"
                className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
              {errors.interests && (
                <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.interests}</p>
              )}
            </div>

            <div className="mt-4 relative">
              <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                Past Occupation *
              </label>
              <Input
                type="text"
                value={pastOccupation}
                onChange={(e) => setPastOccupation(e.target.value)}
                placeholder="Past occupation"
                className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
              {errors.pastOccupation && (
                <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.pastOccupation}</p>
              )}
            </div>

            <div className="mt-4 relative">
              <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                Memory Book Initial Entries (Optional)
              </label>
              {memoryBookEntries.length === 0 ? (
                <p className="font-['Montserrat',Helvetica] text-gray-500 text-sm mb-2">
                  No file chosen
                </p>
              ) : (
                memoryBookEntries.map((file, index) => (
                  <div key={index} className="relative flex items-center justify-between border border-gray-300 rounded-lg p-2 mb-2">
                    <span className="font-['Montserrat',Helvetica] text-black text-sm truncate flex-1">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteMemoryBookEntry(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2Icon className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
              <label className="w-full h-[40px] bg-[#DBDBC8] text-black rounded-lg hover:bg-[#b1b199] transition-all duration-300 flex items-center justify-center cursor-pointer">
                <span className="font-['Montserrat',Helvetica] text-black text-sm">
                  + Add Memory Entry
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,text/plain"
                  onChange={(e) =>
                    setMemoryBookEntries([...memoryBookEntries, ...Array.from(e.target.files || [])])
                  }
                  className="hidden"
                />
              </label>
            </div>

            <div className="mt-4 relative">
              <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                Voice Sample (Optional)
              </label>
              {voiceSample ? (
                <div className="relative flex items-center justify-between border border-gray-300 rounded-lg p-2 mb-2">
                  <span className="font-['Montserrat',Helvetica] text-black text-sm truncate flex-1">
                    {voiceSample.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVoiceSample(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2Icon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <p className="font-['Montserrat',Helvetica] text-gray-500 text-sm mb-2">
                  No file chosen
                </p>
              )}
              <label className="w-full h-[40px] bg-[#DBDBC8] text-black rounded-lg hover:bg-[#b1b199] transition-all duration-300 flex items-center justify-center cursor-pointer">
                <span className="font-['Montserrat',Helvetica] text-black text-sm">
                  + Add Voice Sample
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setVoiceSample(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="mt-4 relative">
              <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                Favorite People (Optional)
              </label>
              {favoritePeople.length === 0 ? (
                <p className="font-['Montserrat',Helvetica] text-gray-500 text-sm mb-2">
                  No people added
                </p>
              ) : (
                favoritePeople.map((person, index) => (
                  <div key={index} className="relative mb-4 border border-gray-300 rounded-lg p-3">
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteFavoritePerson(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2Icon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                        Name
                      </label>
                      <Input
                        type="text"
                        value={person.name}
                        onChange={(e) => handleFavoritePersonChange(index, "name", e.target.value)}
                        placeholder="Name"
                        className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div className="mt-2">
                      <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                        Photo
                      </label>
                      {person.photo ? (
                        <div className="relative flex items-center justify-between border border-gray-300 rounded-lg p-2 mb-2">
                          <span className="font-['Montserrat',Helvetica] text-black text-sm truncate flex-1">
                            {person.photo.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleFavoritePersonChange(index, "photo", null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2Icon className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <p className="font-['Montserrat',Helvetica] text-gray-500 text-sm mb-2">
                          No file chosen
                        </p>
                      )}
                      <label className="w-full h-[40px] bg-gray-200 text-black rounded-lg border border-gray-300 hover:bg-gray-300 transition-all duration-300 flex items-center justify-center cursor-pointer">
                        <span className="font-['Montserrat',Helvetica] text-black text-sm">
                          + Add Photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFavoritePersonChange(index, "photo", e.target.files?.[0] || null)
                          }
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ))
              )}
              <Button
                type="button"
                onClick={handleAddFavoritePerson}
                className="w-full h-[40px] bg-[#DBDBC8] text-black rounded-lg border border-[#DBDBC8] hover:bg-[#b1b199] transition-all duration-300 mt-4"
              >
                <span className="font-['Montserrat',Helvetica] text-black text-sm">
                  + Add Favorite Person
                </span>
              </Button>
            </div>

            <div className="mt-4 relative">
              <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                Living Situation (Optional)
              </label>
              <select
                value={livingSituation}
                onChange={(e) => setLivingSituation(e.target.value)}
                className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select living situation</option>
                <option value="Alone">Alone</option>
                <option value="With Family">With Family</option>
                <option value="Assisted Living">Assisted Living</option>
              </select>
            </div>

            <div className="mt-4 relative">
              <label className="font-['Montserrat',Helvetica] text-black text-sm block mb-1">
                Mobility Level (Optional)
              </label>
              <select
                value={mobilityLevel}
                onChange={(e) => setMobilityLevel(e.target.value)}
                className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Select mobility level</option>
                <option value="Mobile">Mobile</option>
                <option value="Requires Aid">Requires Aid</option>
                <option value="Wheelchair-bound">Wheelchair-bound</option>
              </select>
            </div>

            <div className="mt-4 flex flex-col gap-2">
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
              {errors.termsAccepted && (
                <p className="mt-1 text-red-500 text-sm font-['Montserrat',Helvetica]">{errors.termsAccepted}</p>
              )}
            </div>

            {errors.server && (
              <p className="mt-4 text-red-500 text-center font-['Montserrat',Helvetica] text-sm">
                {errors.server}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-[40px] bg-[#DBDBC8] text-black rounded-lg border border-[#DBDBC8] hover:bg-[#b1b199] transition-all duration-300 mt-4"
            >
              <span className="font-['Montserrat',Helvetica] text-black text-sm">
                Next
              </span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};