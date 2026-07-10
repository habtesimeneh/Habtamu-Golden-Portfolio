import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Shield, LogOut, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Navbar({ isAdmin, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Skills", path: "/skills" },
    { name: "Projects", path: "/projects" },
    { name: "Services", path: "/services" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ];

  const handleAdminClick = () => {
    navigate("/admin");
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "py-4 bg-white/95 dark:bg-[#050505]/95 border-b border-gray-200/80 dark:border-gold-500/10 backdrop-blur-md shadow-md dark:shadow-lg"
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-1 group">
          <Link to="/" className="font-serif text-2xl font-bold tracking-wider text-gray-900 dark:text-white">
            HABTAMU
          </Link>
          <span
            onDoubleClick={() => navigate("/admin/login")}
            className="text-black dark:text-zinc-950 font-sans text-2xl font-bold cursor-default select-none flex items-center justify-center align-middle px-1 -mx-0.5"
            title="Double-click to access secure admin login"
          >
            .
          </span>
          <span className="hidden sm:inline-block text-xs uppercase font-mono tracking-widest text-gold-500/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-2">
            Systems Engineer
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium tracking-wide uppercase transition-colors duration-300 ${
                  isActive
                    ? "text-gold-500 dark:text-gold-500 font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1.5 left-0 w-full h-[1.5px] bg-gold-500"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300 flex items-center justify-center text-gray-700 dark:text-gray-300 cursor-pointer"
            aria-label="Toggle Theme"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ y: -8, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 8, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.15 }}
              >
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-gold-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gold-600" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>

          {isAdmin && (
            <button
              onClick={handleAdminClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gold-500/10 border border-gold-500/30 text-gold-500 text-xs font-mono tracking-widest uppercase hover:bg-gold-500/20 transition-all duration-300"
            >
              <Shield className="w-3.5 h-3.5" />
              Dashboard
            </button>
          )}

          {isAdmin && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-sm font-medium ml-2 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Toggle & Toggle Menu */}
        <div className="md:hidden flex items-center gap-2">
          {/* Theme Toggle for Mobile */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300 flex items-center justify-center text-gray-700 dark:text-gray-300 mr-2 cursor-pointer"
            aria-label="Toggle Theme"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ y: -8, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 8, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.15 }}
              >
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-gold-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gold-600" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>

          {isAdmin && (
            <button
              onClick={handleAdminClick}
              className="p-1.5 rounded bg-gold-500/10 border border-gold-500/30 text-gold-500"
              title="Dashboard"
            >
              <Shield className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden w-full bg-white dark:bg-[#080808] border-b border-gray-200 dark:border-gold-500/10 backdrop-blur-lg overflow-hidden shadow-lg"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-base font-medium tracking-wide uppercase transition-colors duration-300 ${
                      isActive 
                        ? "text-gold-500 font-semibold" 
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {isAdmin && (
                <div className="border-t border-gray-200 dark:border-gold-500/10 pt-4 flex flex-col gap-4">
                  <button
                    onClick={handleAdminClick}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded bg-gold-500/10 border border-gold-500/30 text-gold-500 font-mono tracking-wider uppercase text-sm hover:bg-gold-500/20 transition-all duration-300"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Dashboard
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded bg-red-500/10 dark:bg-red-950/20 border border-red-500/20 text-red-600 dark:text-red-400 text-sm hover:bg-red-500/20 transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out Admin
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
