import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  UserIcon,
  LogOutIcon,
  CalendarIcon,
  MusicIcon,
  MessageSquareIcon,
  MapPinIcon,
  BrainIcon,
  HeartIcon,
  SendIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  Volume2Icon,
} from "lucide-react";
import FaceMatchingGame from "../components/games/MatchingGame";

export const PatientDashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId: urlPatientId } = useParams<{ patientId: string }>();
  const storedPatientId = localStorage.getItem("userId");
  const storedName = localStorage.getItem("name");
  const storedRole = localStorage.getItem("role");
  const { patientId: statePatientId } = location.state || {};

  const effectivePatientId: string | null = urlPatientId || statePatientId || storedPatientId;
  const [name, setName] = useState(storedName || "User");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    { sender: string; content: string; type: "text"; timestamp: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // State for database data
  const [patientData, setPatientData] = useState<any>(null);
  const [schedule, setSchedule] = useState<{ time: string; task: string }[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<
    { id: number; name: string; phone: string }[]
  >([]);

  

  // State for mood tracking
  const [moodEntries, setMoodEntries] = useState<
    { date: string; time: string; score: number; tags: string[]; notes: string }[]
  >([]);
  const [currentMoodScore, setCurrentMoodScore] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [notes, setNotes] = useState("");
  const [averageMoodScore, setAverageMoodScore] = useState<number | null>(null);
  const [averageMood, setAverageMood] = useState<string>("Not calculated yet");
  const [lastActivity, setLastActivity] = useState<string>("Fetching...");

  // State for viewing past mood entries
  const [isMoodEntriesModalOpen, setIsMoodEntriesModalOpen] = useState(false);

  // Predefined tags for mood
  const predefinedTags = ["happy", "sad", "angry", "calm", "anxious", "excited", "tired"];

  // State to manage additional photos in Past Moments
  const [showMorePhotos, setShowMorePhotos] = useState(false);

  // State for image modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageSource, setImageSource] = useState<"pastMoments" | "flashback">("pastMoments");

  // State to manage visibility of flashback details
  const [showAutumnFestivalDetails, setShowAutumnFestivalDetails] = useState(false);
  const [showBeachTripDetails, setShowBeachTripDetails] = useState(false);

  // State for Botpress Webchat
  const [isWebchatOpen, setIsWebchatOpen] = useState(false);

  // State for real-time location tracking
  const [currentLocation, setCurrentLocation] = useState<string>("Fetching location...");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestPoliceStation, setNearestPoliceStation] = useState<{
    name: string;
    distance: string;
  }>({ name: "City Police Station", distance: "0.5 miles" });
  const [nearestHospital, setNearestHospital] = useState<{
    name: string;
    distance: string;
  }>({ name: "City Hospital", distance: "1.2 miles" });

  // State for home address and geofencing
  const [homeAddress, setHomeAddress] = useState<string>(
    localStorage.getItem("homeAddress") || "456 Home Rd, City"
  );
  const [homeCoordinates, setHomeCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // State for geofencing with path deviation
  const [startAddress, setStartAddress] = useState<string>(homeAddress);
  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [route, setRoute] = useState<any>(null);
  const [isTrackingRoute, setIsTrackingRoute] = useState(false);
  const [hasSentDeviationAlert, setHasSentDeviationAlert] = useState(false);

  const GEOFENCE_RADIUS_KM = 0.5; // 500 meters radius

  const defaultProfilePicture = "https://via.placeholder.com/150?text=Profile+Picture";

  // State for Music & Activities
  const playlists = [
    { name: "Relaxing Classics", url: "https://open.spotify.com/playlist/37i9dQZF1DWWEJlAGA9gs0" },
    { name: "Golden Oldies", url: "https://open.spotify.com/playlist/37i9dQZF1DX56bqlsMxJYR" },
    { name: "Nature Sounds", url: "https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8" },
  ];
  const [mathQuestion, setMathQuestion] = useState<{ a: number; b: number; answer: number } | null>(null);
  const [mathAnswer, setMathAnswer] = useState<string>("");
  const [mathFeedback, setMathFeedback] = useState<string>("");
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathingTimer, setBreathingTimer] = useState(4);

  // Array of all images for Past Moments (initial + additional)
  const allImages = [
    {
      src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      alt: "Family dinner in 2019",
      caption: "Family dinner in 2019",
    },
    {
      src: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW91bnRhaW4lMjBoaWtlfGVufDB8fDB8fHww",
      alt: "Mountain hike in 2020",
      caption: "Mountain hike in 2020",
    },
    {
      src: "https://images.unsplash.com/photo-1652184640956-d8a1b3241aa9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Birthday celebration in 2021",
      caption: "Birthday celebration in 2021",
    },
    {
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      alt: "Beach day in 2022",
      caption: "Beach day in 2022",
    },
    {
      src: "https://images.unsplash.com/photo-1652169882811-986ae8a462eb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Z2FyZGVuJTIwcGljbmljfGVufDB8fDB8fHww",
      alt: "Garden picnic in 2023",
      caption: "Garden picnic in 2023",
    },
    {
      src: "https://images.unsplash.com/photo-1513016805932-501981d32562?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8d2ludGVyJTIwbGlnaHRzfGVufDB8fDB8fHww",
      alt: "Winter lights in 2024",
      caption: "Winter lights in 2024",
    },
    {
      src: "https://plus.unsplash.com/premium_photo-1663099797245-57b20850d886?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTN8fGNocmlzdG1hcyUyMHBhcnR5fGVufDB8fDB8fHww",
      alt: "Christmas 2023",
      caption: "Christmas 2023",
    },
    {
      src: "https://images.unsplash.com/photo-1706820354853-c529a21b5cf7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fG5ldyUyMHllYXIlMjBmYW1pbHl8ZW58MHx8MHx8fDA%3D",
      alt: "New Year 2024",
      caption: "New Year 2024",
    },
    {
      src: "https://images.unsplash.com/photo-1621983209348-7b5a63f23866?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "New House 2024",
      caption: "New House 2024",
    },
  ];

  // Array of images for Flashback Mode
  const flashbackImages = [
    {
      src: "https://images.unsplash.com/photo-1611516818236-8faa056fb659?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Family visit",
      caption: "Last Week: Family visit",
    },
    {
      src: "https://images.unsplash.com/photo-1680432534527-16a94195daf8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fGF1dHVtbiUyMGZlc3RpdmFsfGVufDB8fDB8fHww",
      alt: "Autumn Festival",
      caption: "Last Month: Autumn Festival",
    },
    {
      src: "https://images.unsplash.com/photo-1567416421547-5d627e718089?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Beach Trip",
      caption: "Two Months Ago: Beach Trip",
    },
  ];

  // Filter images to display based on showMorePhotos state
  const displayedImages = showMorePhotos ? allImages : allImages.slice(0, 6);

  // Calculate average mood score for today
  useEffect(() => {
    if (moodEntries.length === 0) {
      setAverageMoodScore(null);
      setAverageMood("Not calculated yet");
      return;
    }

    const today = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const todayEntries = moodEntries.filter((entry) => entry.date === today);

    if (todayEntries.length === 0) {
      setAverageMoodScore(null);
      setAverageMood("No entries for today");
      return;
    }

    const totalScore = todayEntries.reduce((sum, entry) => sum + entry.score, 0);
    const avgScore = totalScore / todayEntries.length;
    setAverageMoodScore(Math.round(avgScore * 10) / 10);

    if (avgScore <= 2) {
      setAverageMood("Very Sad 😢");
    } else if (avgScore <= 4) {
      setAverageMood("Sad 😔");
    } else if (avgScore <= 5.5) {
      setAverageMood("Neutral 😐");
    } else if (avgScore <= 7) {
      setAverageMood("Happy 🙂");
    } else {
      setAverageMood("Very Happy 😊");
    }
  }, [moodEntries]);

  // Load Botpress scripts dynamically and initialize the chatbot
  useEffect(() => {
    // Load the Botpress inject script
    const injectScript = document.createElement("script");
    injectScript.src = "https://cdn.botpress.cloud/webchat/v2.4/inject.js";
    injectScript.async = true;
    document.body.appendChild(injectScript);

    // Load the Botpress configuration script
    const configScript = document.createElement("script");
    configScript.src = "https://files.bpcontent.cloud/2025/05/11/15/20250511154803-668EIQG6.js";
    configScript.async = true;
    document.body.appendChild(configScript);

    // Ensure the Botpress WebChat is initialized after scripts load
    const initializeBotpress = () => {
      if (window.botpressWebChat) {
        window.botpressWebChat.init({
          host: "https://cdn.botpress.cloud",
          botId: "your-bot-id", // Replace with your actual Botpress bot ID
          clientId: "your-client-id", // Replace with your actual Botpress client ID
        });
      } else {
        // Retry initialization if botpressWebChat is not yet available
        setTimeout(initializeBotpress, 500);
      }
    };

    injectScript.onload = () => {
      configScript.onload = initializeBotpress;
    };

    return () => {
      document.body.removeChild(injectScript);
      document.body.removeChild(configScript);
      // Clean up Botpress WebChat instance if it exists
      if (window.botpressWebChat) {
        window.botpressWebChat.sendEvent({ type: "hide" });
      }
    };
  }, []);

  // Validate required state
  useEffect(() => {
    if (!effectivePatientId || isNaN(Number(effectivePatientId)) || storedRole !== "patient") {
      console.log("Invalid patient ID or user is not logged in as a patient, redirecting to /signin");
      navigate("/signin", { state: { role: "patient" }, replace: true });
    }
  }, [effectivePatientId, storedRole, navigate]);

  // Fetch patient data, mood entries, and last activity
  useEffect(() => {
    if (!effectivePatientId) return;

    console.log("Fetching patient data for ID:", effectivePatientId);

    fetch(`http://localhost:3001/patients/${effectivePatientId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch patient data: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Patient data fetched:", data);
        setPatientData(data);
        if (data.name) {
          setName(data.name);
          localStorage.setItem("name", data.name);
        }
        if (data.profile_picture) {
          setProfilePicture(data.profile_picture);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch patient data:", err.message);
        setError(`Failed to fetch patient data: ${err.message}`);
      });

    fetch(`http://localhost:3001/schedule?patient_id=${effectivePatientId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch schedule: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Schedule fetched:", data);
        if (Array.isArray(data) && data.length > 0) {
          setSchedule(data);
        } else {
          setSchedule([
            { time: "08:00 AM", task: "Breakfast" },
            { time: "09:00 AM", task: "Morning walk with caregiver" },
            { time: "12:00 PM", task: "Lunch" },
            { time: "03:00 PM", task: "Play memory game" },
            { time: "06:00 PM", task: "Dinner" },
            { time: "08:00 PM", task: "Evening medication" },
          ]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch schedule:", err.message);
        setError(`Failed to fetch schedule: ${err.message}`);
      });

    const fetchMessages = () => {
      fetch(`http://localhost:3001/messages?patient_id=${effectivePatientId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch messages: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Messages fetched:", data);
          if (Array.isArray(data)) {
            const textMessages = data.filter((msg: any) => msg.type === "text");
            setMessages(
              textMessages.map((msg: any) => ({
                sender: msg.sender,
                content: msg.content,
                type: "text" as const,
                timestamp: new Date(msg.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              }))
            );
          } else {
            setMessages([]);
            setError("Invalid messages data received from server");
          }
        })
        .catch((err) => {
          console.error("Failed to fetch messages:", err.message);
          setError(`Failed to fetch messages: ${err.message}`);
        });
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);

    fetch(`http://localhost:3001/emergency-contacts?patient_id=${effectivePatientId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch emergency contacts: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Emergency contacts fetched:", data);
        if (Array.isArray(data)) {
          setEmergencyContacts(
            data.map((contact: any) => ({
              id: contact.id,
              name: contact.name,
              phone: contact.phone,
            }))
          );
        } else {
          setEmergencyContacts([]);
          setError("Invalid emergency contacts data received from server");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch emergency contacts:", err.message);
        setError(`Failed to fetch emergency contacts: ${err.message}`);
      });

    fetch(`http://localhost:3001/mood-entries?patient_id=${effectivePatientId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch mood entries: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Mood entries fetched:", data);
        if (Array.isArray(data)) {
          setMoodEntries(
            data.map((entry: any) => ({
              date: entry.date,
              time: entry.time,
              score: entry.score,
              tags: entry.tags ? entry.tags.split(",") : [],
              notes: entry.notes || "",
            }))
          );
        } else {
          setMoodEntries([]);
          setError("Invalid mood entries data received from server");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch mood entries:", err.message);
        setError(`Failed to fetch mood entries: ${err.message}`);
      });

    fetch(`http://localhost:3001/last-activity?patient_id=${effectivePatientId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch last activity: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Last activity fetched:", data);
        setLastActivity(data.last_activity || "No recent activity recorded");
      })
      .catch((err) => {
        console.error("Failed to fetch last activity:", err.message);
        setLastActivity("Error fetching activity");
        setError(`Failed to fetch last activity: ${err.message}`);
      });

    return () => clearInterval(interval);
  }, [effectivePatientId, navigate]);

  // Fetch home coordinates when homeAddress changes
  useEffect(() => {
    const fetchHomeCoordinates = async () => {
      if (!homeAddress) {
        setError("Home address is not set.");
        setHomeCoordinates(null);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3001/api/geocode-address?address=${encodeURIComponent(homeAddress)}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status} - ${response.statusText}`);
        }
        const geocodeData = await response.json();

        if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
          const { lat, lng } = geocodeData.results[0].geometry.location;
          setHomeCoordinates({ lat, lng });
          setError(null);
        } else {
          throw new Error("No geocoding results found for the home address.");
        }
      } catch (err: any) {
        console.error("Failed to geocode home address:", err.message);
        setError(`Failed to geocode home address: ${err.message}`);
        setHomeCoordinates(null);
      }
    };

    fetchHomeCoordinates();
  }, [homeAddress]);

  // Fetch route for route-based tracking
  const fetchRoute = async () => {
    if (!startAddress || !destinationAddress) {
      setError("Please set both start and destination addresses.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/directions?origin=${encodeURIComponent(startAddress)}&destination=${encodeURIComponent(destinationAddress)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} - ${response.statusText}`);
      }
      const routeData = await response.json();

      if (routeData.status === "OK" && routeData.routes.length > 0) {
        setRoute(routeData.routes[0]);
        setIsTrackingRoute(true);
        setHasSentDeviationAlert(false);
        setError(null);
      } else {
        throw new Error("No route found between the start and destination.");
      }
    } catch (err: any) {
      console.error("Failed to fetch route:", err.message);
      setError(`Failed to fetch route: ${err.message}`);
      setRoute(null);
      setIsTrackingRoute(false);
    }
  };

  // Decode polyline for route deviation detection
  const decodePolyline = (encoded: string): { lat: number; lng: number }[] => {
    let points: { lat: number; lng: number }[] = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return points;
  };

  // Fetch user's real-time location and monitor geofencing
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setCurrentLocation("Unable to fetch location.");
      return;
    }

    const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const handleSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setPosition({ lat: latitude, lng: longitude });

      try {
        const geocodeResponse = await fetch(
          `http://localhost:3001/api/geocode?lat=${latitude}&lng=${longitude}`
        );
        if (!geocodeResponse.ok) {
          throw new Error(`HTTP error: ${geocodeResponse.status} - ${geocodeResponse.statusText}`);
        }
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
          setCurrentLocation(geocodeData.results[0].formatted_address);
        } else {
          setCurrentLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
        }
      } catch (err: any) {
        console.error("Failed to reverse geocode:", err.message);
        setCurrentLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
      }

      try {
        const policeResponse = await fetch(
          `http://localhost:3001/api/nearby/police?lat=${latitude}&lng=${longitude}`
        );
        const placesData = await policeResponse.json();

        if (placesData.status === "OK" && placesData.results.length > 0) {
          const nearest = placesData.results[0];
          const name = nearest.name;
          const placeLat = nearest.geometry.location.lat;
          const placeLng = nearest.geometry.location.lng;
          const distanceKm = getDistanceFromLatLonInKm(latitude, longitude, placeLat, placeLng);
          const distanceMiles = (distanceKm * 0.621371).toFixed(1);
          setNearestPoliceStation({ name, distance: `${distanceMiles} miles` });
        } else {
          setNearestPoliceStation({ name: "Not found", distance: "N/A" });
        }
      } catch (err: any) {
        console.error("Failed to fetch nearest police station:", err.message);
        setNearestPoliceStation({ name: "Error", distance: "N/A" });
      }

      try {
        const hospitalResponse = await fetch(
          `http://localhost:3001/api/nearby/hospital?lat=${latitude}&lng=${longitude}`
        );
        const hospitalData = await hospitalResponse.json();

        if (hospitalData.status === "OK" && hospitalData.results.length > 0) {
          const nearest = hospitalData.results[0];
          const name = nearest.name;
          const placeLat = nearest.geometry.location.lat;
          const placeLng = nearest.geometry.location.lng;
          const distanceKm = getDistanceFromLatLonInKm(latitude, longitude, placeLat, placeLng);
          const distanceMiles = (distanceKm * 0.621371).toFixed(1);
          setNearestHospital({ name, distance: `${distanceMiles} miles` });
        } else {
          setNearestHospital({ name: "Not found", distance: "N/A" });
        }
      } catch (err: any) {
        console.error("Failed to fetch nearest hospital:", err.message);
        setNearestHospital({ name: "Error", distance: "N/A" });
      }

      // Route-based deviation detection with geofencing
      if (isTrackingRoute && route) {
        const path = decodePolyline(route.overview_polyline.points);
        let minDistanceKm = Infinity;

        for (const point of path) {
          const distanceKm = getDistanceFromLatLonInKm(latitude, longitude, point.lat, point.lng);
          if (distanceKm < minDistanceKm) {
            minDistanceKm = distanceKm;
          }
        }

        const minDistanceMiles = minDistanceKm * 0.621371;
        const deviationThresholdMiles = 0.3;

        if (minDistanceMiles > deviationThresholdMiles && !hasSentDeviationAlert) {
          const alertMessage = `Geofencing alert: Patient has deviated ${minDistanceMiles.toFixed(1)} miles from the expected route from ${startAddress} to ${destinationAddress}!`;
          handleSendSafetyAlert(alertMessage);
          setHasSentDeviationAlert(true);
          setError(alertMessage);
        } else if (minDistanceMiles <= deviationThresholdMiles && hasSentDeviationAlert) {
          setHasSentDeviationAlert(false);
          setError(null);
        }

        // Geofencing check for home location
        if (homeCoordinates) {
          const distanceFromHomeKm = getDistanceFromLatLonInKm(
            latitude,
            longitude,
            homeCoordinates.lat,
            homeCoordinates.lng
          );
          if (distanceFromHomeKm > GEOFENCE_RADIUS_KM && !hasSentDeviationAlert) {
            const alertMessage = `Geofencing alert: Patient is ${distanceFromHomeKm.toFixed(2)} km away from home (${homeAddress})!`;
            handleSendSafetyAlert(alertMessage);
            setHasSentDeviationAlert(true);
            setError(alertMessage);
          } else if (distanceFromHomeKm <= GEOFENCE_RADIUS_KM && hasSentDeviationAlert) {
            setHasSentDeviationAlert(false);
            setError(null);
          }
        }
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = "Unable to fetch location.";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied. Please enable location permissions.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage = "The request to get location timed out.";
          break;
        default:
          errorMessage = "An unknown error occurred while fetching location.";
          break;
      }
      setLocationError(errorMessage);
      setCurrentLocation("Unable to fetch location.");
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isTrackingRoute, route, hasSentDeviationAlert, homeCoordinates]);

  // Math game logic
  const generateMathQuestion = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setMathQuestion({ a, b, answer: a + b });
    setMathAnswer("");
    setMathFeedback("");
  };

  const handleMathSubmit = () => {
    if (!mathQuestion) return;
    const userAnswer = parseInt(mathAnswer);
    if (isNaN(userAnswer)) {
      setMathFeedback("Please enter a valid number.");
      return;
    }
    if (userAnswer === mathQuestion.answer) {
      setMathFeedback("Correct! Well done! 🎉");
      setTimeout(generateMathQuestion, 2000);
    } else {
      setMathFeedback("Nice try! Let's try again! 😊");
    }
  };

  useEffect(() => {
    generateMathQuestion();
  }, []);

  // Breathing exercise logic
  const startBreathingExercise = () => {
    setIsBreathing(true);
    setBreathingPhase("inhale");
    setBreathingTimer(4);
  };

  useEffect(() => {
    if (!isBreathing) return;

    const interval = setInterval(() => {
      setBreathingTimer((prev) => {
        if (prev <= 1) {
          if (breathingPhase === "inhale") {
            setBreathingPhase("hold");
            return 4;
          } else if (breathingPhase === "hold") {
            setBreathingPhase("exhale");
            return 4;
          } else {
            setBreathingPhase("inhale");
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathing, breathingPhase]);

  // Handle modal keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen && !isMoodEntriesModalOpen) return;
      if (e.key === "ArrowLeft" && isModalOpen) {
        handlePreviousImage();
      } else if (e.key === "ArrowRight" && isModalOpen) {
        handleNextImage();
      } else if (e.key === "Escape") {
        if (isModalOpen) closeModal();
        if (isMoodEntriesModalOpen) closeMoodEntriesModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, currentImageIndex, imageSource, isMoodEntriesModalOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const timestamp = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const message = { sender: "Patient", content: newMessage, type: "text" as const, timestamp };

      try {
        const response = await fetch("http://localhost:3001/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id: effectivePatientId,
            sender: "Patient",
            content: newMessage,
            type: "text",
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        setMessages([...messages, message]);
        setNewMessage("");
      } catch (err: any) {
        setError(`Failed to send message: ${err.message}`);
      }
    }
  };

  const handleSendSafetyAlert = async (customMessage?: string) => {
    const defaultMessage = "Geofencing alert: Patient has deviated from their expected route!";
    const message = customMessage || defaultMessage;

    try {
      const response = await fetch("http://localhost:3001/safety-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: effectivePatientId,
          message: message,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send safety alert");
      }

      const result = await response.json();
      setError(null);
      alert(result.message);
    } catch (err: any) {
      setError(`Failed to send safety alert: ${err.message}`);
      alert(`Failed to send safety alert: ${err.message}`);
    }
  };

  const handleAddEmergencyContact = async () => {
    const name = prompt("Enter contact name:");
    const phone = prompt("Enter contact phone number:");
    if (name && phone) {
      try {
        const response = await fetch("http://localhost:3001/emergency-contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id: effectivePatientId,
            name,
            phone,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add emergency contact");
        }

        const newContact = await response.json();
        setEmergencyContacts([...emergencyContacts, newContact]);
      } catch (err: any) {
        setError(`Failed to add emergency contact: ${err.message}`);
      }
    }
  };

  const handleEditEmergencyContact = async (id: number, currentName: string, currentPhone: string) => {
    const newName = prompt("Enter new contact name:", currentName);
    const newPhone = prompt("Enter new contact phone number:", currentPhone);
    if (newName && newPhone) {
      try {
        const response = await fetch(`http://localhost:3001/emergency-contacts/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName, phone: newPhone }),
        });

        if (!response.ok) {
          throw new Error("Failed to update emergency contact");
        }

        setEmergencyContacts(
          emergencyContacts.map((contact) =>
            contact.id === id ? { ...contact, name: newName, phone: newPhone } : contact
          )
        );
      } catch (err: any) {
        setError(`Failed to update emergency contact: ${err.message}`);
      }
    }
  };

  const handleDeleteEmergencyContact = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this emergency contact?")) {
      try {
        const response = await fetch(`http://localhost:3001/emergency-contacts/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to delete emergency contact");
        }

        setEmergencyContacts(emergencyContacts.filter((contact) => contact.id !== id));
      } catch (err: any) {
        setError(`Failed to delete emergency contact: ${err.message}`);
      }
    }
  };

  const handleMoodSubmit = async () => {
    if (currentMoodScore === null) {
      alert("Please select a mood score!");
      return;
    }

    const now = new Date();
    const date = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const newEntry = {
      date,
      time,
      score: currentMoodScore,
      tags: selectedTags,
      notes,
    };

    try {
      const response = await fetch("http://localhost:3001/mood-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: effectivePatientId,
          date,
          time,
          score: currentMoodScore,
          tags: selectedTags.join(","),
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save mood entry");
      }

      setMoodEntries([...moodEntries, newEntry]);
      setCurrentMoodScore(null);
      setSelectedTags([]);
      setCustomTag("");
      setNotes("");
    } catch (err: any) {
      setError(`Failed to save mood entry: ${err.message}`);
    }
  };

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag("");
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
    }, 5000);
  };

  const handleViewMorePictures = () => {
    setShowMorePhotos(true);
  };

  const openModal = (index: number, source: "pastMoments" | "flashback") => {
    setCurrentImageIndex(index);
    setImageSource(source);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setImageSource("pastMoments");
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) => {
      const images = imageSource === "pastMoments" ? allImages : flashbackImages;
      return prevIndex === 0 ? images.length - 1 : prevIndex - 1;
    });
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => {
      const images = imageSource === "pastMoments" ? allImages : flashbackImages;
      return prevIndex === images.length - 1 ? 0 : prevIndex + 1;
    });
  };

  const openMoodEntriesModal = () => {
    setIsMoodEntriesModalOpen(true);
  };

  const closeMoodEntriesModal = () => {
    setIsMoodEntriesModalOpen(false);
  };

  const handleViewAutumnFestivalDetails = () => {
    setShowAutumnFestivalDetails(!showAutumnFestivalDetails);
  };

  const handleViewBeachTripDetails = () => {
    setShowBeachTripDetails(!showBeachTripDetails);
  };

  const toggleWebchat = () => {
    if (window.botpressWebChat) {
      if (isWebchatOpen) {
        window.botpressWebChat.sendEvent({ type: "hide" });
      } else {
        window.botpressWebChat.sendEvent({ type: "show" });
      }
      setIsWebchatOpen((prevState) => !prevState);
    } else {
      console.error("Botpress Webchat is not loaded yet.");
      setError("Chatbot is not available. Please try again later.");
    }
  };

  const handleSetHomeAddress = () => {
    const newAddress = prompt("Enter your home address:", homeAddress);
    if (newAddress) {
      setHomeAddress(newAddress);
      localStorage.setItem("homeAddress", newAddress);
    }
  };

  const handleViewInMap = () => {
    if (homeCoordinates) {
      const url = `https://www.google.com/maps?q=${homeCoordinates.lat},${homeCoordinates.lng}&z=15`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      setError("Home coordinates are not available. Please set a valid home address.");
    }
  };

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.volume = 1;
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      setError("Text-to-Speech is not supported in your browser.");
    }
  };

  const caregiverAvatarUrl = "https://example.com/caregiver-avatar.png";
  const [avatarError, setAvatarError] = useState(false);


  return (
    <div className="bg-[#f5f5eb] min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-300 p-4 flex justify-between items-center relative">
        <div className="flex items-center gap-2">
          <span className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold">Volay</span>
        </div>
        <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <button className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <img
                src={profilePicture || defaultProfilePicture}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultProfilePicture;
                }}
              />
            </div>
            <span className="font-['Montserrat',Helvetica] text-black text-sm">{name} (Patient)</span>
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
  
      <main className="flex-1 p-6">
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}
  
        <section className="mb-6">
          <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4">
            Overview
          </h2>
          <div className="bg-white border border-gray-300 rounded-lg p-4 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-[60px] h-[60px] bg-[#DBDBC8] rounded-full flex items-center justify-center">
                <img
                  src={profilePicture || defaultProfilePicture}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultProfilePicture;
                  }}
                />
              </div>
            </div>
            <h1 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold">
              Hi {name}, I’m here with you today.
            </h1>
            <p className="font-['Montserrat',Helvetica] text-black text-[16px] mt-2">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              |{" "}
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <div className="mt-4">
              <p className="font-['Montserrat',Helvetica] text-black text-sm mt-2">
                <span className="font-semibold">Average Mood Score (Today):</span>{" "}
                {averageMoodScore !== null ? averageMoodScore : "No entries"}
              </p>
              <p className="font-['Montserrat',Helvetica] text-black text-sm">
                <span className="font-semibold">Average Mood (Today):</span> {averageMood}
              </p>
              <p className="font-['Montserrat',Helvetica] text-black text-sm mt-2">
                <span className="font-semibold">Last Activity:</span> {lastActivity}
              </p>
            </div>
          </div>
        </section>



        <section className="mb-6">
          <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" /> Daily Routine
          </h2>
          <div className="bg-white border border-gray-300 rounded-lg p-4">
            {schedule.length === 0 ? (
              <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                No schedule available
              </p>
            ) : (
              schedule.map((item, index) => (
                <div key={index} className="flex justify-between items-center mt-2">
                  <p className="font-['Montserrat',Helvetica] text-black text-sm">
                    {item.time} - {item.task}
                  </p>
                  <Button
                    onClick={() => speak(`${item.time} - ${item.task}`)}
                    className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[30px] w-[30px] flex items-center justify-center"
                    aria-label={`Speak ${item.time} - ${item.task}`}
                  >
                    <Volume2Icon className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
            <BrainIcon className="w-6 h-6" /> Memory Lane
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mb-2">
                Faces & Names
              </h3>
              <p className="font-['Montserrat',Helvetica] text-black text-sm mb-2">
                Match the names to the faces!
              </p>
              <FaceMatchingGame />
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mb-2">
                Past Moments
              </h3>
              <p className="font-['Montserrat',Helvetica] text-black text-sm mb-2">
                Relive your memories
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayedImages.map((image, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openModal(index, "pastMoments")}
                    />
                    <p className="font-['Montserrat',Helvetica] text-black text-sm">
                      {image.caption}
                    </p>
                  </div>
                ))}
              </div>
              {!showMorePhotos && (
                <Button
                  onClick={handleViewMorePictures}
                  className="mt-4 bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[30px] w-full"
                >
                  View More Pictures
                </Button>
              )}
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mb-2">
                Flashback Mode
              </h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="font-['Montserrat',Helvetica] text-black text-sm">
                    Yesterday: Played a memory game
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-['Montserrat',Helvetica] text-black text-sm">
                    Last Week: Family visit
                  </p>
                  <img
                    src={flashbackImages[0].src}
                    alt={flashbackImages[0].alt}
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openModal(0, "flashback")}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-['Montserrat',Helvetica] text-black text-sm">
                    Last Month: Autumn Festival
                  </p>
                  <img
                    src={flashbackImages[1].src}
                    alt={flashbackImages[1].alt}
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openModal(1, "flashback")}
                  />
                  {showAutumnFestivalDetails && (
                    <p className="font-['Montserrat',Helvetica] text-black text-sm ml-4">
                      You attended the Autumn Festival last month! It was a lovely day with pumpkin carving, hayrides, and warm apple cider with your family.
                    </p>
                  )}
                  <Button
                    onClick={handleViewAutumnFestivalDetails}
                    className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[30px] w-full"
                  >
                    {showAutumnFestivalDetails ? "Hide Details" : "View Details"}
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-['Montserrat',Helvetica] text-black text-sm">
                    Two Months Ago: Beach Trip
                  </p>
                  <img
                    src={flashbackImages[2].src}
                    alt={flashbackImages[2].alt}
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openModal(2, "flashback")}
                  />
                  {showBeachTripDetails && (
                    <p className="font-['Montserrat',Helvetica] text-black text-sm ml-4">
                      You enjoyed a relaxing beach trip two months ago with friends, building sandcastles and swimming in the ocean.
                    </p>
                  )}
                  <Button
                    onClick={handleViewBeachTripDetails}
                    className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[30px] w-full"
                  >
                    {showBeachTripDetails ? "Hide Details" : "View Details"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {isModalOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              role="dialog"
              aria-labelledby="modal-title"
              aria-modal="true"
            >
              <div className="bg-white rounded-lg p-6 max-w-3xl w-full relative">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-black hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <XIcon className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center">
                  <h3
                    id="modal-title"
                    className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mb-4"
                  >
                    {(imageSource === "pastMoments"
                      ? allImages[currentImageIndex]
                      : flashbackImages[currentImageIndex]
                    ).caption}
                  </h3>
                  <img
                    src={
                      (imageSource === "pastMoments"
                        ? allImages[currentImageIndex]
                        : flashbackImages[currentImageIndex]
                      ).src
                    }
                    alt={
                      (imageSource === "pastMoments"
                        ? allImages[currentImageIndex]
                        : flashbackImages[currentImageIndex]
                      ).alt
                    }
                    className="w-full h-96 object-contain rounded-lg"
                  />
                  <div className="flex gap-4 mt-4">
                    <Button
                      onClick={handlePreviousImage}
                      className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[40px]"
                      aria-label="Previous image"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={handleNextImage}
                      className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[40px]"
                      aria-label="Next image"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="mb-6">
          <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
            <HeartIcon className="w-6 h-6 text-pink-500" /> Track Mood
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mb-2">
                How Are You Feeling Today?
              </h3>
              <div className="flex flex-col gap-6">
                <div>
                  <p className="font-['Montserrat',Helvetica] text-black text-sm mb-2">
                    Rate your mood (1 = Saddest, 10 = Happiest)
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {[...Array(10)].map((_, index) => {
                      const score = index + 1;
                      let bgColor = "";
                      if (score <= 2) {
                        bgColor = "bg-gradient-to-r from-red-400 to-red-600";
                      } else if (score <= 4) {
                        bgColor = "bg-gradient-to-r from-orange-400 to-orange-600";
                      } else if (score <= 6) {
                        bgColor = "bg-gradient-to-r from-yellow-400 to-yellow-600";
                      } else if (score <= 8) {
                        bgColor = "bg-gradient-to-r from-lime-400 to-lime-600";
                      } else {
                        bgColor = "bg-gradient-to-r from-green-400 to-green-600";
                      }

                      return (
                        <button
                          key={score}
                          onClick={() => setCurrentMoodScore(score)}
                          className={`w-12 h-12 rounded-full ${bgColor} text-white font-semibold flex items-center justify-center transition-transform duration-200 hover:scale-110 focus:outline-none ${
                            currentMoodScore === score ? "scale-125 animate-pulse shadow-md" : ""
                          }`}
                        >
                          {score}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="font-['Montserrat',Helvetica] text-black text-sm mb-2">
                    Add Tags (How do you feel?)
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {predefinedTags.map((tag) => (
                      <Button
                        key={tag}
                        onClick={() => handleTagSelect(tag)}
                        className={`h-[30px] ${
                          selectedTags.includes(tag)
                            ? "bg-[#b1b199] text-black hover:bg-[#DBDBC8]"
                            : "bg-[#DBDBC8] text-black hover:bg-[#b1b199]"
                        }`}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Input
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="Add a custom tag..."
                      className="h-[40px] border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition-all duration-200"
                    />
                    <Button
                      onClick={handleAddCustomTag}
                      className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[40px] rounded-lg"
                    >
                      Add Tag
                    </Button>
                  </div>
                  {selectedTags.length > 0 && (
                    <p className="font-['Montserrat',Helvetica] text-black text-sm mt-2">
                      <span className="font-semibold">Selected Tags:</span>{" "}
                      {selectedTags.join(", ")}
                    </p>
                  )}
                </div>

                <div>
                  <p className="font-['Montserrat',Helvetica] text-black text-sm mb-2">
                    Additional Notes
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Share any additional thoughts..."
                    className="w-full h-24 p-3 border border-gray-300 rounded-lg font-['Montserrat',Helvetica] text-gray-700 text-sm shadow-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition-all duration-200 placeholder-gray-400"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleMoodSubmit}
                    className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[45px] w-full rounded-lg"
                  >
                    Submit Mood
                  </Button>
                  <Button
                    onClick={openMoodEntriesModal}
                    className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[45px] w-full rounded-lg"
                  >
                    View Past Entries
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {isMoodEntriesModalOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              role="dialog"
              aria-labelledby="mood-entries-modal-title"
              aria-modal="true"
            >
              <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto relative">
                <button
                  onClick={closeMoodEntriesModal}
                  className="absolute top-4 right-4 text-black hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <XIcon className="w-6 h-6" />
                </button>
                <h3
                  id="mood-entries-modal-title"
                  className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mb-4"
                >
                  Past Mood Entries
                </h3>
                {moodEntries.length === 0 ? (
                  <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                    No mood entries available.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {moodEntries.map((entry, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4">
                        <p className="font-['Montserrat',Helvetica] text-black text-sm">
                          <span className="font-semibold">Date:</span> {entry.date}
                        </p>
                        <p className="font-['Montserrat',Helvetica] text-black text-sm">
                          <span className="font-semibold">Time:</span> {entry.time}
                        </p>
                        <p className="font-['Montserrat',Helvetica] text-black text-sm">
                          <span className="font-semibold">Mood Score:</span> {entry.score}
                        </p>
                        <p className="font-['Montserrat',Helvetica] text-black text-sm">
                          <span className="font-semibold">Tags:</span>{" "}
                          {entry.tags.length > 0 ? entry.tags.join(", ") : "None"}
                        </p>
                        <p className="font-['Montserrat',Helvetica] text-black text-sm">
                          <span className="font-semibold">Notes:</span>{" "}
                          {entry.notes || "No notes"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="mb-6">
          <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
            <MusicIcon className="w-6 h-6" /> Music & Activities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mb-2">
                Playlists
              </h3>
              {playlists.map((playlist, index) => (
                <div key={index} className="flex justify-between items-center mt-2">
                  <p className="font-['Montserrat',Helvetica] text-black text-sm">
                    {playlist.name}
                  </p>
                  <Button
                    onClick={() => window.open(playlist.url, "_blank", "noopener,noreferrer")}
                    className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[30px] px-4"
                  >
                    Play
                  </Button>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mb-2">
                Math Challenge
              </h3>
              {mathQuestion && (
                <div>
                  <p className="font-['Montserrat',Helvetica] text-black text-sm mb-2">
                    What is {mathQuestion.a} + {mathQuestion.b}?
                  </p>
                  <Input
                    type="number"
                    value={mathAnswer}
                    onChange={(e) => setMathAnswer(e.target.value)}
                    placeholder="Enter your answer"
                    className="h-[40px] border-gray-300 rounded-lg mb-2"
                  />
                  <Button
                    onClick={handleMathSubmit}
                    className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[40px] w-full"
                  >
                    Submit Answer
                  </Button>
                  {mathFeedback && (
                    <p className="font-['Montserrat',Helvetica] text-black text-sm mt-2">
                      {mathFeedback}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mb-2">
                Breathing Exercise
              </h3>
              {!isBreathing ? (
                <Button
                  onClick={startBreathingExercise}
                  className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[40px] w-full"
                >
                  Start Breathing Exercise
                </Button>
              ) : (
                <div className="text-center">
                  <p className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mb-2">
                    {breathingPhase.charAt(0).toUpperCase() + breathingPhase.slice(1)}: {breathingTimer}s
                  </p>
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-300 to-blue-500 flex items-center justify-center animate-pulse">
                    <p className="font-['Montserrat',Helvetica] text-white text-lg font-semibold">
                      {breathingPhase === "inhale" ? "Breathe In" : breathingPhase === "hold" ? "Hold" : "Breathe Out"}
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsBreathing(false)}
                    className="mt-4 bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[40px] w-full"
                  >
                    Stop Exercise
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
          <MapPinIcon className="w-6 h-6" /> Location & Safety
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mb-2">
                Current Location
              </h3>
              {locationError ? (
                <p className="font-['Montserrat',Helvetica] text-red-600 text-sm">
                  {locationError}
                </p>
              ) : (
                <>
                  <div className="border border-gray-300 rounded-lg p-2 mb-2">
                    <p className="font-['Montserrat',Helvetica] text-black text-sm">
                      13, Sector 8A, Airoli, Navi Mumbai, Maharashtra 400708, India
                    </p>
                  </div>
                  <p className="font-['Montserrat',Helvetica] text-black text-sm font-semibold mb-1">
                    Nearest Police Station:
                  </p>
                  <div className="border border-gray-300 rounded-lg p-2 mb-2">
                    <p className="font-['Montserrat',Helvetica] text-black text-sm">
                      {nearestPoliceStation.name} ({nearestPoliceStation.distance})
                    </p>
                  </div>
                  <p className="font-['Montserrat',Helvetica] text-black text-sm font-semibold mb-1">
                    Nearest Hospital:
                  </p>
                  <div className="border border-gray-300 rounded-lg p-2 mb-2">
                    <p className="font-['Montserrat',Helvetica] text-black text-sm">
                      {nearestHospital.name} ({nearestHospital.distance})
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      if (position) {
                        const url = `https://www.google.com/maps?q=${position.lat},${position.lng}&z=15`;
                        window.open(url, "_blank", "noopener,noreferrer");
                      } else {
                        setError("Location not available to display on map.");
                      }
                    }}
                    className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[40px] w-full mt-2"
                  >
                    View on Map
                  </Button>
                </>
              )}
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold mb-2">
                Geofencing
              </h3>
              <p className="font-['Montserrat',Helvetica] text-black text-sm mb-2">
                <span className="font-semibold">Home Address:</span> {homeAddress}
              </p>
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={handleSetHomeAddress}
                  className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[40px] w-full"
                >
                  Set Home Address
                </Button>
                <Button
                  onClick={handleViewInMap}
                  className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[40px] w-full"
                >
                  View Home on Map
                </Button>
              </div>
              <h4 className="font-['Montserrat',Helvetica] text-black text-md font-semibold mb-2">
                Route Tracking with Geofencing
              </h4>
              <div className="flex flex-col gap-3">
                <Input
                  value={startAddress}
                  onChange={(e) => setStartAddress(e.target.value)}
                  placeholder="Start Address"
                  className="h-[40px] border-gray-300 rounded-lg"
                />
                <Input
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  placeholder="Destination Address"
                  className="h-[40px] border-gray-300 rounded-lg"
                />
                <Button
                  onClick={fetchRoute}
                  className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[40px] w-full"
                >
                  Start Route Tracking
                </Button>
                {isTrackingRoute && (
                  <>
                    <div className="w-full h-64 border border-gray-300 rounded-lg">
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps/embed/v1/directions?key=AIzaSyDGTonf5f2SzQnuBhbTKrcNvW0EI0papqE&origin=${encodeURIComponent(startAddress)}&destination=${encodeURIComponent(destinationAddress)}&mode=walking`}
                        allowFullScreen
                        title="Route Map"
                      ></iframe>
                    </div>
                    <Button
                      onClick={() => {
                        setIsTrackingRoute(false);
                        setRoute(null);
                        setHasSentDeviationAlert(false);
                      }}
                      className="bg-red-500 text-white hover:bg-red-600 h-[40px] w-full"
                    >
                      Stop Route Tracking
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
            <MessageSquareIcon className="w-6 h-6" /> Chat with Caregiver
          </h2>
          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                {avatarError ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-gray-600" />
                  </div>
                ) : (
                  <img
                    src={caregiverAvatarUrl}
                    alt="Caregiver Avatar"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                )}
              </div>
              <div>
                <h3 className="font-['Montserrat',Helvetica] text-black text-lg font-semibold">
                  Chat with Your Caregiver
                </h3>
                <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                  Send a message
                </p>
              </div>
            </div>
            <div className="h-64 overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4">
              {messages.length === 0 ? (
                <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                  No messages yet
                </p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 mb-2 ${
                      message.sender === "Patient" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.sender === "Caregiver" && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {avatarError ? (
                          <UserIcon className="w-4 h-4 text-gray-500" />
                        ) : (
                          <img
                            src={caregiverAvatarUrl}
                            alt="Caregiver"
                            className="w-full h-full rounded-full object-cover"
                            onError={() => setAvatarError(true)}
                          />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-xs p-2 rounded-lg ${
                        message.sender === "Patient"
                          ? "bg-[#DBDBC8] text-black"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      <p className="font-['Montserrat',Helvetica] text-sm">{message.sender}</p>
                      <p className="font-['Montserrat',Helvetica] text-sm">{message.content}</p>
                      <p className="font-['Montserrat',Helvetica] text-xs text-gray-500 mt-1">
                        {message.timestamp}
                      </p>
                    </div>
                    {message.sender === "Patient" && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <img
                          src={profilePicture || defaultProfilePicture}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = defaultProfilePicture;
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="h-[40px] border-gray-300 rounded-lg flex-1"
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
              <Button
                onClick={handleSendMessage}
                className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[40px] px-4"
              >
                <SendIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
          <section className="mb-6">
            <h2 className="font-['Montserrat',Helvetica] text-black text-[24px] font-bold mb-4 flex items-center gap-2">
              <PhoneIcon className="w-6 h-6" /> Emergency Contacts
            </h2>
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <Button
                onClick={handleAddEmergencyContact}
                className="mb-4 bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[40px] w-full"
              >
                Add Emergency Contact
              </Button>
              {emergencyContacts.length === 0 ? (
                <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                  No emergency contacts available
                </p>
              ) : (
                emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex justify-between items-center mt-2 border-b border-gray-200 pb-2"
                  >
                    <div>
                      <p className="font-['Montserrat',Helvetica] text-black text-sm">
                        {contact.name || "Name not available"}
                      </p>
                      <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
                        {contact.phone || "Phone not available"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleEditEmergencyContact(contact.id, contact.name, contact.phone)
                        }
                        className="bg-[#DBDBC8] text-black hover:bg-[#b1b199] h-[30px] w-[30px] flex items-center justify-center"
                        aria-label={`Edit contact ${contact.name || "unknown"}`}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteEmergencyContact(contact.id)}
                        className="bg-red-500 text-white hover:bg-red-600 h-[30px] w-[30px] flex items-center justify-center"
                        aria-label={`Delete contact ${contact.name || "unknown"}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
              <Button
                onClick={() => alert("Emergency call initiated! Contacting emergency contacts...")}
                className="mt-4 bg-red-500 text-white hover:bg-red-600 h-[40px] w-full"
              >
                Emergency
              </Button>
            </div>
          </section>

          {/* Floating Chat Button */}
  <button
    onClick={toggleWebchat}
    className="fixed bottom-6 right-6 bg-[#DBDBC8] text-black hover:bg-[#b1b199] rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
    aria-label="Toggle Chatbot"
  >
    <MessageSquareIcon className="w-6 h-6" />
  </button>
        </main>

        <footer className="bg-white border-t border-gray-300 p-4 text-center">
          <p className="font-['Montserrat',Helvetica] text-gray-600 text-sm">
            © 2025 Volay. All rights reserved.
          </p>
        </footer>
      </div>
    );
  };