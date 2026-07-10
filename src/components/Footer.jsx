import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";

export default function Footer({ isAdmin }) {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState({
    site_name: "Habtamu Simeneh",
    social_github: "https://github.com/habtamu",
    social_linkedin: "https://linkedin.com/in/habtamu",
    social_twitter: "https://twitter.com/habtamu",
    contact_email: "habtesimeneh30@gmail.com",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Error fetching footer settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const nameParts = (settings.site_name || "Habtamu Simeneh").split(" ");
  const firstName = nameParts[0] || "Habtamu";

  return (
    <footer className="relative bg-[#030303] border-t border-gold-500/10 py-12 overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-gold-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {/* Branding */}
        <div className="flex flex-col gap-4">
          <span className="font-serif text-xl font-bold tracking-wider text-white">
            {firstName.toUpperCase()}<span className="text-gold-500">.</span>
          </span>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            Enterprise-level full-stack portfolios and secure relational databases. Built for scalability and design excellence.
          </p>
        </div>

        {/* Navigation Quicklinks */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-mono tracking-widest text-gold-500 uppercase font-bold">
            Explore Portfolio
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
            <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-gold-400 transition-colors">About</Link>
            <Link to="/skills" className="hover:text-gold-400 transition-colors">Skills</Link>
            <Link to="/projects" className="hover:text-gold-400 transition-colors">Projects</Link>
            <Link to="/services" className="hover:text-gold-400 transition-colors">Services</Link>
            <Link to="/blog" className="hover:text-gold-400 transition-colors">Blog</Link>
          </div>
        </div>

        {/* Connect & Portal */}
        <div className="flex flex-col gap-5">
          <h4 className="text-sm font-mono tracking-widest text-gold-500 uppercase font-bold">
            Connect
          </h4>
          <div className="flex gap-4">
            {settings.social_github && (
              <a
                href={settings.social_github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-gold-500 hover:border-gold-500 hover:bg-gold-500/5 transition-all duration-300"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {settings.social_linkedin && (
              <a
                href={settings.social_linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-gold-500 hover:border-gold-500 hover:bg-gold-500/5 transition-all duration-300"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {settings.social_twitter && (
              <a
                href={settings.social_twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-gold-500 hover:border-gold-500 hover:bg-gold-500/5 transition-all duration-300"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {settings.contact_email && (
              <a
                href={`mailto:${settings.contact_email}`}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-gold-500 hover:border-gold-500 hover:bg-gold-500/5 transition-all duration-300"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Legal & copyright */}
      <div className="max-w-7xl mx-auto px-6 border-t border-white/5 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
        <p>© {currentYear} {settings.site_name}. All rights reserved.</p>
        <div className="flex items-center gap-1.5 font-mono">
          <span>Made with excellence • Information Systems Specialist</span>
        </div>
      </div>
    </footer>
  );
}
