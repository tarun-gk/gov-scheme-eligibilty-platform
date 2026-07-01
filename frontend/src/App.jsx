import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext.jsx";
import { I18nProvider } from "./contexts/I18nContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import EligibilityResults from "./pages/EligibilityResults.jsx";
import RecommendedSchemes from "./pages/RecommendedSchemes.jsx";
import Chatbot from "./pages/Chatbot.jsx";
import SchemeExplorer from "./pages/SchemeExplorer.jsx";
import AdminProfiles from "./pages/AdminProfiles.jsx";
import SchemeDetails from "./pages/SchemeDetails.jsx";
import ProfileManager from "./pages/ProfileManager.jsx";

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppLayout>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/explorer" element={<SchemeExplorer />} />
          <Route path="/schemes/:id" element={<SchemeDetails />} />

          {/* Protected routes — require login */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profiles"
            element={
              <ProtectedRoute>
                <ProfileManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eligibility-results"
            element={
              <ProtectedRoute>
                <EligibilityResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <RecommendedSchemes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chatbot />
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin/profiles"
            element={
              <ProtectedRoute adminOnly>
                <AdminProfiles />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </I18nProvider>
  );
}
