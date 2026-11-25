import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { CoursesPage } from "./pages/CoursesPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CourseDetailsPage } from "./pages/CourseDetailsPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ClassroomPage } from "./pages/ClassroomPage";
import { TeacherDashboardPage } from "./pages/TeacherDashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { useAuth } from "./features/auth/AuthProvider";
import type { UserRole } from "./lib/types";

function Protected({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container page-section"><div className="empty-state">Loading your account...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    const destination = user.role === "admin" ? "/admin" : user.role === "teacher" ? "/teacher" : "/dashboard";
    return <Navigate to={destination} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();
  const authPage = ["/login", "/register", "/verify-email", "/forgot-password", "/reset-password"].includes(location.pathname);

  return (
    <div className="app-shell">
      {!authPage && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.main key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailsPage />} />
            <Route path="/courses/:id/learn" element={<Protected roles={["student"]}><ClassroomPage /></Protected>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<Protected roles={["student"]}><DashboardPage /></Protected>} />
            <Route path="/teacher" element={<Protected roles={["teacher"]}><TeacherDashboardPage /></Protected>} />
            <Route path="/admin" element={<Protected roles={["admin"]}><AdminDashboardPage /></Protected>} />
            <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      {!authPage && <Footer />}
    </div>
  );
}
