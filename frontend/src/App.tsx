import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Role } from "./screens/Role";
import { SignUp } from "./screens/SignUp";
import { SignIn } from "./screens/SignIn"; // Updated import path
import { CaregiverBasicInformation } from "./screens/CaregiverBasicInformation";
import { PatientBasicInformation } from "./screens/PatientBasicInformation";
import { CaregiverProfileCreation } from "./screens/CaregiverProfileCreation";
import { PatientProfileCreation } from "./screens/PatientProfileCreation";
import { CaregiverDashboard } from "./screens/CaregiverDashboard";
import { PatientDashboard } from "./screens/PatientDashboard";
import { Welcome } from "./screens/Welcome";
import { ForgotPassword } from "./screens/ForgotPassword";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = !!localStorage.getItem("userId");
  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/signin" replace />;
};

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/role" element={<Role />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/caregiver-basic-information" element={<ProtectedRoute><CaregiverBasicInformation /></ProtectedRoute>} />
        <Route path="/patient-basic-information" element={<ProtectedRoute><PatientBasicInformation /></ProtectedRoute>} />
        <Route path="/caregiver-profile" element={<ProtectedRoute><CaregiverProfileCreation /></ProtectedRoute>} />
        <Route path="/patient-profile" element={<ProtectedRoute><PatientProfileCreation /></ProtectedRoute>} />
        <Route path="/caregiver-dashboard" element={<ProtectedRoute><CaregiverDashboard /></ProtectedRoute>} />
        <Route path="/patient-dashboard/:patientId" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
        <Route path="/caregiver/patient-signup/:caregiverId" element={<SignUp />} />
      </Routes>
    </Router>
  );
};