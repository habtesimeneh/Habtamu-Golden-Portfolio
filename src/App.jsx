import { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { ToastContainer, toast } from "./components/Toast.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { apiGet } from "./lib/api.js";
import { getToken, setToken as storeToken, clearToken } from "./lib/auth.js";

// Sub-views
import Home from "./views/Home.jsx";
import About from "./views/About.jsx";
import Skills from "./views/Skills.jsx";
import Projects from "./views/Projects.jsx";
import Services from "./views/Services.jsx";
import BlogView from "./views/Blog.jsx";
import Contact from "./views/Contact.jsx";
import Login from "./views/Login.jsx";
import AdminPanel from "./components/AdminPanel.jsx";

// Scroll To Top on Route Change Helper
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      validateSession();
    }
  }, [token]);

  const validateSession = async () => {
    try {
      const { ok, data } = await apiGet("/api/auth/me", token);
      if (ok) {
        setUser(data);
      } else {
        // Token is invalid/expired
        handleLogout();
      }
    } catch (err) {
      console.error("Session verification failed:", err);
    }
  };

  const handleLogin = (newToken, userData) => {
    storeToken(newToken);
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    clearToken();
    setToken("");
    setUser(null);
    toast("Signed out securely.", "info");
  };

  const isAdmin = token !== "" && user !== null;

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-transparent text-gray-900 dark:text-white transition-colors duration-300">
          
          {/* Navigation Header */}
          <Navbar isAdmin={isAdmin} onLogout={handleLogout} />

          {/* Global Slide-In Notifications container */}
          <ToastContainer />

          {/* Dynamic Main Body Content */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/services" element={<Services />} />
              <Route path="/blog" element={<BlogView />} />
              <Route path="/contact" element={<Contact />} />

              {/* Admin Portal login */}
              <Route
                path="/admin/login"
                element={
                  isAdmin ? <Navigate to="/admin" replace /> : <Login onLogin={handleLogin} />
                }
              />

              {/* Protected Admin Console Panel */}
              <Route
                path="/admin"
                element={
                  isAdmin ? (
                    <AdminPanel token={token} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/admin/login" replace />
                  )
                }
              />

              {/* Catch All / Fallback to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer isAdmin={isAdmin} />
        </div>
      </Router>
    </ThemeProvider>
  );
}
