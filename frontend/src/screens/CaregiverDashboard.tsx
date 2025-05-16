import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  UserIcon,
  LogOutIcon,
  BellIcon,
  MessageSquareIcon,
  FileTextIcon,
  SettingsIcon,
  AlertCircleIcon,
  PillIcon,
  BrainIcon,
  SendIcon,
  ClockIcon,
  ActivityIcon,
  ImageIcon,
} from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// Define types for mood data
interface MoodEntry {
  date: string;
  time: string;
  score: number;
  tags: string;
  notes: string;
}

// Define types for other data
interface Patient {
  id: string;
  name: string;
  dob: string;
  contactInfo: string;
  medicalHistory: string;
  dementiaStage: string;
  emergencyContact: string;
  mood?: string;
  cognitive_score?: number;
  last_activity?: string;
  known_conditions?: string;
  interests?: string;
  past_occupation?: string;
  memory_book_entries?: string;
  voice_sample?: string;
  favorite_people?: string;
  living_situation?: string;
  mobility_level?: string;
  address?: string;
}

interface Alert {
  id: string;
  type: string;
  patient_name: string;
  time: string;
  message: string;
  timestamp: string;
}

interface Medication {
  id: string;
  patient_id: string;
  patient_name: string;
  dose: string;
  time: string;
  status: "Taken" | "Missed" | "Pending";
}

interface Message {
  patient_id: string;
  patient_name: string | null;
  sender: "Caregiver" | "Patient";
  content: string;
  type: "text";
  timestamp: string;
}

interface ProgressReport {
  id: string;
  date: string;
  summary: string;
}

interface Schedule {
  id: string;
  event: string;
  time: string;
  task: string;
  medication_note?: string;
  completed: boolean;
}

interface Activity {
  id: string;
  activity: string;
  created_at: string;
  timestamp: string;
}

interface Flashback {
  id: string;
  type: "image" | "text";
  content: string;
  created_at: string;
  src: string;
  alt: string;
  caption: string;
  details?: string;
}

interface Reminder {
  id: string;
  title: string;
  time: string;
}

interface MedicalHistoryEntry {
  id: string;
  history: string;
  patient_id: string;
  recorded_at: string;
}

export const CaregiverDashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUserId = localStorage.getItem("userId");
  const storedName = localStorage.getItem("name");
  const storedRole = localStorage.getItem("role");
  const userId = location.state?.userId || storedUserId;
  const [name, setName] = useState(storedName || "Caregiver");
  const [activeSection, setActiveSection] = useState("Overview");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isErrorVisible, setIsErrorVisible] = useState(false); // New state for error visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newMessageSent, setNewMessageSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<number | null>(null);
  const errorTimeoutRef = useRef<number | null>(null); // Ref for error timeout

  // State for database data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [flashbacks, setFlashbacks] = useState<Flashback[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryEntry[]>([]);

  // State for adding patients and updating emergency contacts
  const [newPatient, setNewPatient] = useState({
    name: "",
    dob: "",
    contactInfo: "",
    medicalHistory: "",
    dementiaStage: "",
    emergencyContact: "",
  });
  const [emergencyContact, setEmergencyContact] = useState("");
  const [alertPreferences, setAlertPreferences] = useState({
    panicButton: true,
    geofence: true,
    healthAnomalies: true,
  });

  // State for editing functionalities
  const [newSchedule, setNewSchedule] = useState({
    event: "",
    time: "",
    task: "",
    medication_note: "",
    completed: false,
  });
  const [editMedication, setEditMedication] = useState<Medication | null>(null);
  const [newMemoryEntry, setNewMemoryEntry] = useState("");
  const [editFlashback, setEditFlashback] = useState<Flashback | null>(null);
  const [newReminder, setNewReminder] = useState({ title: "", time: "" });
  const [editReminder, setEditReminder] = useState<Reminder | null>(null);

  // Check if the user is logged in as a caregiver
  useEffect(() => {
    if (!userId || storedRole !== "caregiver") {
      console.log("User is not logged in as a caregiver, redirecting to /signin");
      navigate("/signin", { state: { role: "caregiver" } });
      setIsLoading(false);
      return;
    }

    if (!storedName) {
      console.error("Caregiver name not found in localStorage, fetching from server");
      fetch(`http://localhost:3001/caregivers/${userId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch caregiver: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched caregiver data:", data);
          if (data.role !== "caregiver") {
            throw new Error("User is not a caregiver");
          }
          if (data.name) {
            setName(data.name);
            localStorage.setItem("name", data.name);
            console.log("Fetched caregiver name:", data.name);
            setIsLoading(false);
          } else {
            throw new Error("Caregiver name not found in response");
          }
        })
        .catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
          console.error("Failed to fetch caregiver details:", errorMessage);
          setErrorWithTimeout(`Failed to fetch caregiver details: ${errorMessage}`);
          navigate("/signin", { state: { role: "caregiver" } });
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [userId, storedName, storedRole, navigate]);

  // Fetch patients for the caregiver
  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:3001/caregivers/${userId}/patients`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch patients: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched patients:", data);
          if (Array.isArray(data)) {
            setPatients(data);
            if (data.length === 1 && data[0].name === "Anna K") {
              setSelectedPatient(data[0].name);
              setSelectedPatientId(data[0].id);
            }
          } else {
            console.error("Patients data is not an array:", data);
            setPatients([]);
            setErrorWithTimeout("Invalid patients data received from server");
          }
        })
        .catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
          console.error("Failed to fetch patients:", errorMessage);
          setErrorWithTimeout(`Failed to fetch patients: ${errorMessage}`);
          setPatients([]);
        });
    }
  }, [userId]);

  // Fetch alerts for the caregiver's patients
  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:3001/alerts?caregiver_id=${userId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch alerts: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched alerts:", data);
          if (Array.isArray(data)) {
            setAlerts(data);
          } else {
            setAlerts([]);
            setErrorWithTimeout("Invalid alerts data received from server");
          }
        })
        .catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
          console.error("Failed to fetch alerts:", errorMessage);
          setErrorWithTimeout(`Failed to fetch alerts: ${errorMessage}`);
          setAlerts([]);
        });
    }
  }, [userId]);

  // Fetch medications for the selected patient
  useEffect(() => {
    if (selectedPatientId) {
      fetch(`http://localhost:3001/medications?patient_id=${selectedPatientId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch medications: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched medications:", data);
          if (Array.isArray(data)) {
            setMedications(data);
          } else {
            setMedications([]);
            setErrorWithTimeout("Invalid medications data received from server");
          }
        })
        .catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
          console.error("Failed to fetch medications:", errorMessage);
          setErrorWithTimeout(`Failed to fetch medications: ${errorMessage}`);
          setMedications([]);
        });
    }
  }, [selectedPatientId]);

  // Fetch mood data for the selected patient
  useEffect(() => {
    if (selectedPatientId) {
      fetch(`http://localhost:3001/mood-entries?patient_id=${selectedPatientId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch mood data: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched mood data:", data);
          if (Array.isArray(data)) {
            setMoodData(data);
          } else {
            setMoodData([]);
            setErrorWithTimeout("Invalid mood data received from server");
          }
        })
        .catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
          console.error("Failed to fetch mood data:", errorMessage);
          setErrorWithTimeout(`Failed to fetch mood data: ${errorMessage}`);
          setMoodData([]);
        });
    }
  }, [selectedPatientId]);

  // Fetch progress reports for the selected patient
  useEffect(() => {
    if (selectedPatientId) {
      fetch(`http://localhost:3001/progress-reports?patient_id=${selectedPatientId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch progress reports: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched progress reports:", data);
          if (Array.isArray(data)) {
            setProgressReports(data);
          } else {
            setProgressReports([]);
            setErrorWithTimeout("Invalid progress reports data received from server");
          }
        })
        .catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
          console.error("Failed to fetch progress reports:", errorMessage);
          setErrorWithTimeout(`Failed to fetch progress reports: ${errorMessage}`);
          setProgressReports([]);
        });
    }
  }, [selectedPatientId]);

  // Fetch schedules for the selected patient
  useEffect(() => {
    if (selectedPatientId) {
      fetch(`http://localhost:3001/schedules?patient_id=${selectedPatientId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch schedules: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched schedules:", data);
          if (Array.isArray(data)) {
            setSchedules(data);
          } else {
            setSchedules([]);
            setErrorWithTimeout("Invalid schedules data received from server");
          }
        })
        .catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
          console.error("Failed to fetch schedules:", errorMessage);
          setErrorWithTimeout(`Failed to fetch schedules: ${errorMessage}`);
          setSchedules([]);
        });
    }
  }, [selectedPatientId]);

  // Fetch recent activities for the selected patient
  useEffect(() => {
    if (selectedPatientId) {
      fetch(`http://localhost:3001/activities?patient_id=${selectedPatientId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch activities: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched activities:", data);
          if (Array.isArray(data)) {
            setActivities(data);
          } else {
            setActivities([]);
            setErrorWithTimeout("Invalid activities data received from server");
          }
        })
        .catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
          console.error("Failed to fetch activities:", errorMessage);
          setErrorWithTimeout(`Failed to fetch activities: ${errorMessage}`);
          setActivities([]);
        });
    }
  }, [selectedPatientId]);

  // Fetch flashbacks for the selected patient
  useEffect(() => {
    if (selectedPatientId) {
      fetch(`http://localhost:3001/flashbacks?patient_id=${selectedPatientId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch flashbacks: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched flashbacks:", data);
          if (Array.isArray(data)) {
            setFlashbacks(data);
          } else {
            setFlashbacks([]);
            setErrorWithTimeout("Invalid flashbacks data received from server");
          }
        })
        .catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
          console.error("Failed to fetch flashbacks:", errorMessage);
          setErrorWithTimeout(`Failed to fetch flashbacks: ${errorMessage}`);
          setFlashbacks([]);
        });
    }
  }, [selectedPatientId]);

  // Fetch upcoming reminders for the selected patient
  useEffect(() => {
    if (selectedPatientId) {
      fetch(`http://localhost:3001/reminders?patient_id=${selectedPatientId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch reminders: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched reminders:", data);
          if (Array.isArray(data)) {
            setReminders(data);
          } else {
            setReminders([]);
            setErrorWithTimeout("Invalid reminders data received from server");
          }
        })
        .catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
          console.error("Failed to fetch reminders:", errorMessage);
          setErrorWithTimeout(`Failed to fetch reminders: ${errorMessage}`);
          setReminders([]);
        });
    }
  }, [selectedPatientId]);

  // Fetch medical history for the selected patient
  useEffect(() => {
    if (selectedPatientId) {
      fetch(`http://localhost:3001/medical-history?patient_id=${selectedPatientId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch medical history: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Fetched medical history:", data);
          if (Array.isArray(data)) {
            setMedicalHistory(data);
          } else {
            setMedicalHistory([]);
            setErrorWithTimeout("Invalid medical history data received from server");
          }
        })
        .catch((err: unknown) => {
          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
          console.error("Failed to fetch medical history:", errorMessage);
          setErrorWithTimeout(`Failed to fetch medical history: ${errorMessage}`);
          setMedicalHistory([]);
        });
    }
  }, [selectedPatientId]);

  // Fetch messages for the caregiver's patients with polling
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:3001/caregiver-messages?caregiver_id=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        const data = await response.json();
        console.log("Fetched messages:", data);
        if (Array.isArray(data)) {
          setMessages(
            data.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp).toLocaleString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                month: "short",
                day: "numeric",
              }),
            }))
          );
        } else {
          setMessages([]);
          setErrorWithTimeout("Invalid messages data received from server");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Error fetching messages:", errorMessage);
        setErrorWithTimeout(errorMessage);
      }
    };

    if (userId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [userId, newMessageSent]);

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Function to set error and hide it after 5 seconds
  const setErrorWithTimeout = (message: string) => {
    setError(message);
    setIsErrorVisible(true);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      setIsErrorVisible(false);
      setError(null);
      errorTimeoutRef.current = null;
    }, 5000);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPatientId) {
      setErrorWithTimeout("Please select a patient and enter a message");
      return;
    }

    const timestamp = new Date().toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
    const message: Message = {
      patient_id: selectedPatientId,
      patient_name: selectedPatient ?? "Unknown Patient",
      sender: "Caregiver",
      content: newMessage,
      type: "text",
      timestamp,
    };

    try {
      const response = await fetch("http://localhost:3001/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...message,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      setNewMessageSent((prev) => !prev);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error sending message:", errorMessage);
      setErrorWithTimeout(`Failed to send message: ${errorMessage}`);
    }
  };

  const handleClearMessages = () => {
    if (!selectedPatient) {
      setErrorWithTimeout("Please select a patient to clear messages");
      return;
    }
    setMessages((prev) => prev.filter((msg) => msg.patient_name !== selectedPatient));
  };

  const handleAddPatient = async () => {
    if (!newPatient.name || !newPatient.dob || !newPatient.contactInfo || !newPatient.medicalHistory || !newPatient.dementiaStage || !newPatient.emergencyContact) {
      setErrorWithTimeout("All fields are required to add a patient");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/caregivers/${userId}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient),
      });

      if (!response.ok) {
        throw new Error("Failed to add patient");
      }

      const data = await response.json();
      setPatients((prev) => [...prev, { ...newPatient, id: data.patientId }]);
      setNewPatient({
        name: "",
        dob: "",
        contactInfo: "",
        medicalHistory: "",
        dementiaStage: "",
        emergencyContact: "",
      });
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error adding patient:", errorMessage);
      setErrorWithTimeout(`Failed to add patient: ${errorMessage}`);
    }
  };

  const handleUpdateEmergencyContact = async () => {
    if (!selectedPatientId || !emergencyContact) {
      setErrorWithTimeout("Please select a patient and enter an emergency contact");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/patients/${selectedPatientId}/emergency-contacts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyContact }),
      });

      if (!response.ok) {
        throw new Error("Failed to update emergency contact");
      }

      setPatients((prev) =>
        prev.map((patient) =>
          patient.id === selectedPatientId ? { ...patient, emergencyContact } : patient
        )
      );
      setEmergencyContact("");
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error updating emergency contact:", errorMessage);
      setErrorWithTimeout(`Failed to update emergency contact: ${errorMessage}`);
    }
  };

  const handleAddSchedule = async () => {
    if (!selectedPatientId || !newSchedule.event || !newSchedule.time || !newSchedule.task) {
      setErrorWithTimeout("Please fill in all required fields to add a schedule");
      return;
    }

    const schedule = { ...newSchedule, patient_id: selectedPatientId };
    try {
      const response = await fetch(`http://localhost:3001/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });

      if (!response.ok) {
        throw new Error("Failed to add schedule");
      }

      const data = await response.json();
      setSchedules((prev) => [...prev, { ...schedule, id: data.id }]);
      setNewSchedule({ event: "", time: "", task: "", medication_note: "", completed: false });
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error adding schedule:", errorMessage);
      setErrorWithTimeout(`Failed to add schedule: ${errorMessage}`);
    }
  };

  const handleMarkTaken = async (medicationId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/medications/${medicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Taken" }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark medication as taken");
      }

      setMedications((prev) =>
        prev.map((med) =>
          med.id === medicationId ? { ...med, status: "Taken" as const } : med
        )
      );
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error marking medication as taken:", errorMessage);
      setErrorWithTimeout(`Failed to mark medication as taken: ${errorMessage}`);
    }
  };

  const handleReschedule = async (medicationId: string, newTime: string) => {
    try {
      const response = await fetch(`http://localhost:3001/medications/${medicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: newTime }),
      });

      if (!response.ok) {
        throw new Error("Failed to reschedule medication");
      }

      setMedications((prev) =>
        prev.map((med) =>
          med.id === medicationId ? { ...med, time: newTime } : med
        )
      );
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error rescheduling medication:", errorMessage);
      setErrorWithTimeout(`Failed to reschedule medication: ${errorMessage}`);
    }
  };

  const handleEditMedication = async () => {
    if (!editMedication) return;

    try {
      const response = await fetch(`http://localhost:3001/medications/${editMedication.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editMedication),
      });

      if (!response.ok) {
        throw new Error("Failed to update medication");
      }

      setMedications((prev) =>
        prev.map((med) =>
          med.id === editMedication.id ? editMedication : med
        )
      );
      setEditMedication(null);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error updating medication:", errorMessage);
      setErrorWithTimeout(`Failed to update medication: ${errorMessage}`);
    }
  };

  const handleUpdateMemoryEntry = async () => {
    if (!selectedPatientId || !newMemoryEntry) {
      setErrorWithTimeout("Please enter a memory entry");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/patients/${selectedPatientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memory_book_entries: newMemoryEntry }),
      });

      if (!response.ok) {
        throw new Error("Failed to update memory entry");
      }

      setPatients((prev) =>
        prev.map((patient) =>
          patient.id === selectedPatientId ? { ...patient, memory_book_entries: newMemoryEntry } : patient
        )
      );
      setNewMemoryEntry("");
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error updating memory entry:", errorMessage);
      setErrorWithTimeout(`Failed to update memory entry: ${errorMessage}`);
    }
  };

  const handleEditFlashback = async () => {
    if (!editFlashback) return;

    try {
      const response = await fetch(`http://localhost:3001/flashbacks/${editFlashback.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFlashback),
      });

      if (!response.ok) {
        throw new Error("Failed to update flashback");
      }

      setFlashbacks((prev) =>
        prev.map((fb) => (fb.id === editFlashback.id ? editFlashback : fb))
      );
      setEditFlashback(null);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error updating flashback:", errorMessage);
      setErrorWithTimeout(`Failed to update flashback: ${errorMessage}`);
    }
  };

  const handleAddReminder = async () => {
    if (!selectedPatientId || !newReminder.title || !newReminder.time) {
      setErrorWithTimeout("Please fill in all fields to add a reminder");
      return;
    }

    const reminder = { ...newReminder, patient_id: selectedPatientId };
    try {
      const response = await fetch(`http://localhost:3001/reminders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reminder),
      });

      if (!response.ok) {
        throw new Error("Failed to add reminder");
      }

      const data = await response.json();
      setReminders((prev) => [...prev, { ...reminder, id: data.id }]);
      setNewReminder({ title: "", time: "" });
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error adding reminder:", errorMessage);
      setErrorWithTimeout(`Failed to add reminder: ${errorMessage}`);
    }
  };

  const handleEditReminder = async () => {
    if (!editReminder) return;

    try {
      const response = await fetch(`http://localhost:3001/reminders/${editReminder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editReminder),
      });

      if (!response.ok) {
        throw new Error("Failed to update reminder");
      }

      setReminders((prev) =>
        prev.map((rem) => (rem.id === editReminder.id ? editReminder : rem))
      );
      setEditReminder(null);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error updating reminder:", errorMessage);
      setErrorWithTimeout(`Failed to update reminder: ${errorMessage}`);
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
      timeoutRef.current = null;
    }, 3000);
  };

  // Mood chart data
  const moodChartData = {
    labels: moodData.map((data) => new Date(data.date).toLocaleDateString()),
    datasets: [
      {
        label: "Mood Score",
        data: moodData.map((data) => data.score),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  const moodChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Mood Trends (Last 7 Days)" },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
      },
    },
  };

  // Medication adherence chart data
  const adherenceChartData = {
    labels: ["Taken", "Missed", "Pending"],
    datasets: [
      {
        label: "Medication Adherence",
        data: [
          medications.filter((med) => med.status === "Taken").length,
          medications.filter((med) => med.status === "Missed").length,
          medications.filter((med) => med.status === "Pending").length,
        ],
        backgroundColor: ["#4CAF50", "#F44336", "#FFC107"],
      },
    ],
  };

  const adherenceChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Medication Adherence" },
    },
  };

  // Show a loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="bg-[#f5f5eb] min-h-screen flex items-center justify-center">
        <p className="font-['Montserrat',Helvetica] text-black text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5eb] min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-300 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold">Volay</span>
        </div>
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-600" />
            </div>
            <span className="font-['Montserrat',Helvetica] text-black text-sm">{name} (Caregiver)</span>
          </button>
          <div
            className={`absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg transition-opacity duration-200 ${
              isDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          >
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-black hover:bg-gray-100"
            >
              <LogOutIcon className="w-4 h-4" />
              <span className="font-['Montserrat',Helvetica] text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-300 p-4">
          <nav className="flex flex-col gap-2">
            {[
              "Overview",
              "Patient List",
              "Medication Tracker",
              "Emergency & Alerts",
              "Chat Messages",
              "Documents & Reports",
              "Mood Insights",
              "Schedules",
              "Flashbacks",
              "Reminders",
              "Settings",
            ].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`w-full text-left px-4 py-2 rounded-lg font-['Montserrat',Helvetica] text-sm ${
                  activeSection === section ? "bg-[#DBDBC8] text-black" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {section}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {error && isErrorVisible && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 transition-opacity duration-500">
              {error}
            </div>
          )}

          {activeSection === "Overview" && (
            <div>
              <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold flex items-center gap-2">
                    <ActivityIcon className="w-5 h-5 text-blue-500" /> Daily Summary
                  </h3>
                  <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm mt-2">
                    {patients.length} patients under your care
                  </p>
                  <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                    {alerts.length} active alerts today
                  </p>
                  <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                    {medications.filter((med) => med.status === "Missed").length} missed medications
                  </p>
                </div>
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold flex items-center gap-2">
                    <BellIcon className="w-5 h-5 text-red-500" /> Active Alerts
                  </h3>
                  {alerts.length === 0 ? (
                    <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm mt-2">No active alerts</p>
                  ) : (
                    alerts.map((alert) => (
                      <p key={alert.id} className="font-['Montserrat',Helvetica] text-black text-sm mt-2">
                        {alert.message} at {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    ))
                  )}
                </div>
                <div className="bg-white border border-gray-300 rounded-lg p-4 col-span-1 md:col-span-2 lg:col-span-1">
                  <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-green-500" /> Quick Stats
                  </h3>
                  {patients.length > 0 ? (
                    patients.map((patient) => (
                      <div key={patient.id} className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-gray-500" />
                          </div>
                          <p className="font-['Montserrat',Helvetica] text-black text-sm font-semibold">
                            {patient.name}
                          </p>
                        </div>
                        <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                          Mood: <span className={patient.mood === "Happy" ? "text-green-500" : "text-yellow-500"}>{patient.mood || "Unknown"}</span>
                        </p>
                        <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                          Cognitive Score: {patient.cognitive_score || "N/A"}
                        </p>
                        <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                          Last Activity: {patient.last_activity || "None"}
                        </p>
                        <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                          Conditions: {patient.known_conditions || "None"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm mt-2">No patient stats available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === "Patient List" && (
            <div>
              <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4">Patient List</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="bg-white border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSelectedPatient(patient.name);
                        setSelectedPatientId(patient.id);
                        setActiveSection("Overview");
                      }}
                    >
                      <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">{patient.name}</h3>
                      <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm mt-2">
                        Dementia Stage: {patient.dementiaStage}
                      </p>
                      <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                        DOB: {new Date(patient.dob).toLocaleDateString()}
                      </p>
                      <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                        Contact: {patient.contactInfo}
                      </p>
                      <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                        Emergency Contact: {patient.emergencyContact}
                      </p>
                      <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                        Interests: {patient.interests || "N/A"}
                      </p>
                      <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                        Past Occupation: {patient.past_occupation || "N/A"}
                      </p>
                      <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                        Living Situation: {patient.living_situation || "N/A"}
                      </p>
                      <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                        Mobility: {patient.mobility_level || "N/A"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">No patients found</p>
                )}
              </div>
            </div>
          )}

          {activeSection === "Medication Tracker" && (
            <div>
              <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
                <PillIcon className="w-6 h-6" /> Medication Tracker
              </h2>
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Select Patient</h3>
                <select
                  value={selectedPatient || ""}
                  onChange={(e) => {
                    const patient = patients.find((p) => p.name === e.target.value);
                    setSelectedPatient(e.target.value);
                    setSelectedPatientId(patient ? patient.id : null);
                  }}
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black mt-2"
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.name}>
                      {patient.name}
                    </option>
                  ))}
                </select>
                {selectedPatient && (
                  <>
                    <div className="mt-4">
                      <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Medication Adherence</h3>
                      <div className="w-full max-w-md">
                        <Bar data={adherenceChartData} options={adherenceChartOptions} />
                      </div>
                    </div>
                    <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mt-4">Medication Schedule</h3>
                    {medications.length === 0 ? (
                      <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm mt-2">No medication records found for {selectedPatient}</p>
                    ) : (
                      medications
                        .filter((med) => med.patient_name === selectedPatient)
                        .map((med) => (
                          <div key={med.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                            <div>
                              <p className="font-['Montserrat',Helvetica] text-black text-sm">
                                {med.dose} at {med.time}
                              </p>
                              <p className={`font-['Montserrat',Helvetica] text-sm ${
                                med.status === "Taken" ? "text-green-500" : 
                                med.status === "Missed" ? "text-red-500" : 
                                "text-yellow-500"
                              }`}>
                                {med.status}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleMarkTaken(med.id)}
                                className="bg-green-500 text-white hover:bg-green-600"
                              >
                                Mark Taken
                              </Button>
                              <Button
                                onClick={() => {
                                  const newTime = prompt("Enter new time (HH:MM):", med.time);
                                  if (newTime) handleReschedule(med.id, newTime);
                                }}
                                className="bg-yellow-500 text-white hover:bg-yellow-600"
                              >
                                Reschedule
                              </Button>
                              <Button
                                onClick={() => setEditMedication(med)}
                                className="bg-blue-500 text-white hover:bg-blue-600"
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        ))
                    )}
                    {editMedication && (
                      <div className="mt-4">
                        <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Edit Medication</h3>
                        <div className="flex flex-col gap-2 mt-2">
                          <Input
                            value={editMedication.dose}
                            onChange={(e) => setEditMedication({ ...editMedication, dose: e.target.value })}
                            placeholder="Dose"
                            className="h-[40px]"
                          />
                          <Input
                            type="time"
                            value={editMedication.time}
                            onChange={(e) => setEditMedication({ ...editMedication, time: e.target.value })}
                            className="h-[40px]"
                          />
                          <select
                            value={editMedication.status}
                            onChange={(e) => setEditMedication({ ...editMedication, status: e.target.value as "Taken" | "Missed" | "Pending" })}
                            className="h-[40px] bg-white rounded-lg border border-gray-300"
                          >
                            <option value="Taken">Taken</option>
                            <option value="Missed">Missed</option>
                            <option value="Pending">Pending</option>
                          </select>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleEditMedication}
                              className="bg-[#DBDBC8] text-black hover:bg-[#b1b199]"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditMedication(null)}
                              className="bg-gray-500 text-white hover:bg-gray-600"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeSection === "Emergency & Alerts" && (
            <div>
              <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
                <AlertCircleIcon className="w-6 h-6" /> Emergency & Alerts
              </h2>
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Select Patient</h3>
                <select
                  value={selectedPatient || ""}
                  onChange={(e) => {
                    const patient = patients.find((p) => p.name === e.target.value);
                    setSelectedPatient(e.target.value);
                    setSelectedPatientId(patient ? patient.id : null);
                  }}
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black mt-2"
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.name}>
                      {patient.name}
                    </option>
                  ))}
                </select>
                {selectedPatient && (
                  <>
                    <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mt-4">Emergency Contacts</h3>
                    {patients
                      .filter((patient) => patient.name === selectedPatient)
                      .map((patient) => (
                        <div key={patient.id}>
                          <p className="font-['Montserrat',Helvetica] text-black text-sm mt-2">
                            {patient.emergencyContact}
                          </p>
                          <p className="font-['Montserrat',Helvetica] text-black text-sm">
                            Michael (Son): +919876543210
                          </p>
                        </div>
                      ))}
                  </>
                )}
              </div>
            </div>
          )}

          {activeSection === "Chat Messages" && (
            <div>
              <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
                <MessageSquareIcon className="w-6 h-6" /> Chat Messages
              </h2>
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Select Patient</h3>
                <select
                  value={selectedPatient || ""}
                  onChange={(e) => {
                    const patient = patients.find((p) => p.name === e.target.value);
                    setSelectedPatient(e.target.value);
                    setSelectedPatientId(patient ? patient.id : null);
                  }}
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black mt-2"
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.name}>
                      {patient.name}
                    </option>
                  ))}
                </select>

                {selectedPatient && (
                  <>
                    <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mt-4">
                      Messages with {selectedPatient}
                    </h3>
                    <div className="h-[300px] overflow-y-auto border border-gray-200 rounded-lg p-2 mt-2">
                      {messages.filter((msg) => msg.patient_name === selectedPatient).length === 0 ? (
                        <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm text-center">
                          No messages available for {selectedPatient}.
                        </p>
                      ) : (
                        messages
                          .filter((msg) => msg.patient_name === selectedPatient)
                          .map((msg, index) => (
                            <div
                              key={index}
                              className={`flex items-start gap-2 mb-2 ${
                                msg.sender === "Caregiver" ? "justify-end" : "justify-start"
                              }`}
                            >
                              {msg.sender === "Patient" && (
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <UserIcon className="w-4 h-4 text-gray-500" />
                                </div>
                              )}
                              <div
                                className={`max-w-xs p-2 rounded-lg ${
                                  msg.sender === "Caregiver"
                                    ? "bg-[#DBDBC8] text-black"
                                    : "bg-gray-200 text-black"
                                }`}
                              >
                                <p className="font-['Montserrat',Helvetica] text-sm">{msg.sender}</p>
                                <p className="font-['Montserrat',Helvetica] text-sm">{msg.content}</p>
                                <p className="font-['Montserrat',Helvetica] text-xs text-gray-500 mt-1">
                                  {msg.timestamp}
                                </p>
                              </div>
                              {msg.sender === "Caregiver" && (
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <UserIcon className="w-4 h-4 text-gray-500" />
                                </div>
                              )}
                            </div>
                          ))
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 h-[40px]"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[40px] px-4"
                      >
                        <SendIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleClearMessages}
                        className="bg-red-500 text-white hover:bg-red-600 h-[40px] px-4"
                      >
                        Clear Messages
                      </Button>
                    </div>
                  </>
                )}

                <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mt-4">
                  Reminders Sent
                </h3>
                {reminders.length === 0 ? (
                  <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm mt-2">
                    No reminders sent
                  </p>
                ) : (
                  reminders.map((reminder) => (
                    <p key={reminder.id} className="font-['Montserrat',Helvetica] text-black text-sm mt-2">
                      {reminder.title} at {new Date(reminder.time).toLocaleString()}
                    </p>
                  ))
                )}
              </div>
            </div>
          )}

          {activeSection === "Documents & Reports" && (
            <div>
              <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
                <FileTextIcon className="w-6 h-6" /> Documents & Reports
              </h2>
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">
                  Medical History
                </h3>
                <select
                  value={selectedPatient || ""}
                  onChange={(e) => {
                    const patient = patients.find((p) => p.name === e.target.value);
                    setSelectedPatient(e.target.value);
                    setSelectedPatientId(patient ? patient.id : null);
                  }}
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black mt-2"
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.name}>
                      {patient.name}
                    </option>
                  ))}
                </select>
                {selectedPatient && (
                  <div className="mt-2">
                    {medicalHistory.length === 0 ? (
                      <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">No medical history available for {selectedPatient}</p>
                    ) : (
                      medicalHistory.map((history) => (
                        <p key={history.id} className="font-['Montserrat',Helvetica] text-black text-sm mt-1">
                          {history.history} - {new Date(history.recorded_at).toLocaleDateString()}
                        </p>
                      ))
                    )}
                  </div>
                )}
                <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mt-4">
                  Memory Book Entries
                </h3>
                {patients
                  .filter((patient) => patient.name === selectedPatient)
                  .map((patient) => (
                    <div key={patient.id} className="mt-2">
                      <p className="font-['Montserrat',Helvetica] text-black text-sm">
                        {patient.memory_book_entries || "No memory book entries available"}
                      </p>
                      <Input
                        placeholder="Update memory book entry"
                        value={newMemoryEntry}
                        onChange={(e) => setNewMemoryEntry(e.target.value)}
                        className="h-[40px] mt-2"
                      />
                      <Button
                        onClick={handleUpdateMemoryEntry}
                        className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] mt-2"
                      >
                        Update Entry
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeSection === "Mood Insights" && (
            <div>
              <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
                <BrainIcon className="w-6 h-6" /> Mood Insights
              </h2>
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Select Patient</h3>
                <select
                  value={selectedPatient || ""}
                  onChange={(e) => {
                    const patient = patients.find((p) => p.name === e.target.value);
                    setSelectedPatient(e.target.value);
                    setSelectedPatientId(patient ? patient.id : null);
                  }}
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black mt-2"
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.name}>
                      {patient.name}
                    </option>
                  ))}
                </select>
                {selectedPatient && (
                  <div className="mt-4">
                    {moodData.length === 0 ? (
                      <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">No mood data available for {selectedPatient}</p>
                    ) : (
                      <div className="w-full max-w-2xl">
                        <Line data={moodChartData} options={moodChartOptions} />
                        <div className="mt-4">
                          <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Mood Details</h3>
                          {moodData.map((entry) => (
                            <p key={`${entry.date}-${entry.time}`} className="font-['Montserrat',Helvetica] text-black text-sm mt-1">
                              {new Date(entry.date).toLocaleDateString()}: {entry.tags} (Score: {entry.score}) - {entry.notes}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "Schedules" && (
            <div>
              <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
                <ActivityIcon className="w-6 h-6" /> Schedules
              </h2>
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Select Patient</h3>
                <select
                  value={selectedPatient || ""}
                  onChange={(e) => {
                    const patient = patients.find((p) => p.name === e.target.value);
                    setSelectedPatient(e.target.value);
                    setSelectedPatientId(patient ? patient.id : null);
                  }}
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black mt-2"
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.name}>
                      {patient.name}
                    </option>
                  ))}
                </select>
                {selectedPatient && (
                  <>
                    <div className="mt-4">
                      <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Add New Schedule</h3>
                      <div className="flex flex-col gap-2 mt-2">
                        <Input
                          placeholder="Event"
                          value={newSchedule.event}
                          onChange={(e) => setNewSchedule({ ...newSchedule, event: e.target.value })}
                          className="h-[40px]"
                        />
                        <Input
                          type="datetime-local"
                          value={newSchedule.time}
                          onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                          className="h-[40px]"
                        />
                        <Input
                          placeholder="Task"
                          value={newSchedule.task}
                          onChange={(e) => setNewSchedule({ ...newSchedule, task: e.target.value })}
                          className="h-[40px]"
                        />
                        <Input
                          placeholder="Medication Note (optional)"
                          value={newSchedule.medication_note}
                          onChange={(e) => setNewSchedule({ ...newSchedule, medication_note: e.target.value })}
                          className="h-[40px]"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newSchedule.completed}
                            onChange={(e) => setNewSchedule({ ...newSchedule, completed: e.target.checked })}
                          />
                          <span className="font-['Montserrat',Helvetica] text-gray-600 text-sm">Completed</span>
                        </label>
                        <Button
                          onClick={handleAddSchedule}
                          className="bg-[#DBDBC8] text-black hover:bg-[#b1b199]"
                        >
                          Add Schedule
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Current Schedules</h3>
                      {schedules.length === 0 ? (
                        <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm mt-2">No schedules available for {selectedPatient}</p>
                      ) : (
                        schedules.map((schedule) => (
                          <p key={schedule.id} className="font-['Montserrat',Helvetica] text-black text-sm mt-1">
                            {schedule.time}: {schedule.task} {schedule.medication_note ? `(${schedule.medication_note})` : ""} - {schedule.completed ? "Completed" : "Pending"}
                          </p>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeSection === "Flashbacks" && (
            <div>
              <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="w-6 h-6" /> Flashbacks
              </h2>
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Select Patient</h3>
                <select
                  value={selectedPatient || ""}
                  onChange={(e) => {
                    const patient = patients.find((p) => p.name === e.target.value);
                    setSelectedPatient(e.target.value);
                    setSelectedPatientId(patient ? patient.id : null);
                  }}
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black mt-2"
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.name}>
                      {patient.name}
                    </option>
                  ))}
                </select>
                {selectedPatient && (
                  <div className="mt-2">
                    {flashbacks.length === 0 ? (
                      <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                        No flashbacks available for {selectedPatient}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        {flashbacks.map((flashback) => (
                          <div key={flashback.id} className="border border-gray-200 rounded-lg p-2">
                            <img
                              src={flashback.src}
                              alt={flashback.alt}
                              className="w-32 h-32 object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Image+Not+Found";
                              }}
                            />
                            <p className="font-['Montserrat',Helvetica] text-black text-sm mt-1">
                              {flashback.caption}
                            </p>
                            <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                              {flashback.details}
                            </p>
                            <Button
                              onClick={() => setEditFlashback(flashback)}
                              className="bg-blue-500 text-white hover:bg-blue-600 mt-2"
                            >
                              Edit
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    {editFlashback && (
                      <div className="mt-4">
                        <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Edit Flashback</h3>
                        <div className="flex flex-col gap-2 mt-2">
                          <Input
                            placeholder="Caption"
                            value={editFlashback.caption}
                            onChange={(e) => setEditFlashback({ ...editFlashback, caption: e.target.value })}
                            className="h-[40px]"
                          />
                          <Input
                            placeholder="Details"
                            value={editFlashback.details || ""}
                            onChange={(e) => setEditFlashback({ ...editFlashback, details: e.target.value })}
                            className="h-[40px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={handleEditFlashback}
                              className="bg-[#DBDBC8] text-black hover:bg-[#b1b199]"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditFlashback(null)}
                              className="bg-gray-500 text-white hover:bg-gray-600"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "Reminders" && (
            <div>
              <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
                <ClockIcon className="w-6 h-6" /> Reminders
              </h2>
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Select Patient</h3>
                <select
                  value={selectedPatient || ""}
                  onChange={(e) => {
                    const patient = patients.find((p) => p.name === e.target.value);
                    setSelectedPatient(e.target.value);
                    setSelectedPatientId(patient ? patient.id : null);
                  }}
                  className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black mt-2"
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.name}>
                      {patient.name}
                    </option>
                  ))}
                </select>
                {selectedPatient && (
                  <>
                    <div className="mt-4">
                      <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Add New Reminder</h3>
                      <div className="flex flex-col gap-2 mt-2">
                        <Input
                          placeholder="Reminder Title"
                          value={newReminder.title}
                          onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                          className="h-[40px]"
                        />
                        <Input
                          type="datetime-local"
                          value={newReminder.time}
                          onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                          className="h-[40px]"
                        />
                        <Button
                          onClick={handleAddReminder}
                          className="bg-[#DBDBC8] text-black hover:bg-[#b1b199]"
                        >
                          Add Reminder
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Upcoming Reminders</h3>
                      {reminders.length === 0 ? (
                        <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm mt-2">
                          No reminders available for {selectedPatient}
                        </p>
                      ) : (
                        reminders.map((reminder) => (
                          <div key={reminder.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                            <p className="font-['Montserrat',Helvetica] text-black text-sm">
                              {reminder.title} at {new Date(reminder.time).toLocaleString()}
                            </p>
                            <Button
                              onClick={() => setEditReminder(reminder)}
                              className="bg-blue-500 text-white hover:bg-blue-600"
                            >
                              Edit
                            </Button>
                          </div>
                        ))
                      )}
                      {editReminder && (
                        <div className="mt-4">
                          <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Edit Reminder</h3>
                          <div className="flex flex-col gap-2 mt-2">
                            <Input
                              placeholder="Reminder Title"
                              value={editReminder.title}
                              onChange={(e) => setEditReminder({ ...editReminder, title: e.target.value })}
                              className="h-[40px]"
                            />
                            <Input
                              type="datetime-local"
                              value={editReminder.time}
                              onChange={(e) => setEditReminder({ ...editReminder, time: e.target.value })}
                              className="h-[40px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={handleEditReminder}
                                className="bg-[#DBDBC8] text-black hover:bg-[#b1b199]"
                              >
                                Save
                              </Button>
                              <Button
                                onClick={() => setEditReminder(null)}
                                className="bg-gray-500 text-white hover:bg-gray-600"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeSection === "Settings" && (
            <div>
              <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
                <SettingsIcon className="w-6 h-6" /> Settings
              </h2>
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">Alert Preferences</h3>
                <div className="flex flex-col gap-2 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={alertPreferences.panicButton}
                      onChange={(e) =>
                        setAlertPreferences({ ...alertPreferences, panicButton: e.target.checked })
                      }
                    />
                    <span className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                      Panic Button Alerts
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={alertPreferences.geofence}
                      onChange={(e) =>
                        setAlertPreferences({ ...alertPreferences, geofence: e.target.checked })
                      }
                    />
                    <span className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                      Geofence Alerts
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={alertPreferences.healthAnomalies}
                      onChange={(e) =>
                        setAlertPreferences({ ...alertPreferences, healthAnomalies: e.target.checked })
                      }
                    />
                    <span className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                      Health Anomaly Alerts
                    </span>
                  </label>
                </div>

                <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mt-4">
                  Add New Patient
                </h3>
                <div className="flex flex-col gap-2 mt-2">
                  <Input
                    placeholder="Patient Name"
                    value={newPatient.name}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, name: e.target.value })
                    }
                    className="h-[40px]"
                  />
                  <div className="relative">
                    <Input
                      type="date"
                      value={newPatient.dob}
                      onChange={(e) =>
                        setNewPatient({ ...newPatient, dob: e.target.value })
                      }
                      className="h-[40px] mt-12"
                    />
                  </div>
                  <Input
                    placeholder="Contact Info"
                    value={newPatient.contactInfo}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, contactInfo: e.target.value })
                    }
                    className="h-[40px] mt-12"
                  />
                  <Input
                    placeholder="Medical History"
                    value={newPatient.medicalHistory}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, medicalHistory: e.target.value })
                    }
                    className="h-[40px]"
                  />
                  <Input
                    placeholder="Dementia Stage"
                    value={newPatient.dementiaStage}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, dementiaStage: e.target.value })
                    }
                    className="h-[40px]"
                  />
                  <Input
                    placeholder="Emergency Contact"
                    value={newPatient.emergencyContact}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, emergencyContact: e.target.value })
                    }
                    className="h-[40px]"
                  />
                  <Button
                    onClick={handleAddPatient}
                    className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] w-32"
                  >
                    Add Patient
                  </Button>
                </div>

                <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mt-4">
                  Update Patient Emergency Contact
                </h3>
                <div className="flex flex-col gap-2 mt-2">
                  <select
                    value={selectedPatient || ""}
                    onChange={(e) => {
                      const patient = patients.find((p) => p.name === e.target.value);
                      setSelectedPatient(e.target.value);
                      setSelectedPatientId(patient ? patient.id : null);
                    }}
                    className="w-full h-[40px] bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Select a patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.name}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="New Emergency Contact"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="h-[40px]"
                  />
                  <Button
                    onClick={handleUpdateEmergencyContact}
                    className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] w-48"
                  >
                    Update Contact
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};