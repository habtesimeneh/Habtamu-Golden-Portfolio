import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  ArrowRight,
  Award,
  Database
} from "lucide-react";

export default function Home() {
  const [typedText, setTypedText] = useState("");
  const titles = [
    "Full-Stack Software Engineer",
    "Database System Architect",
    "Information Systems Specialist",
    "Academic Research Writer",
  ];
  const [titleIndex, setTitleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Settings state with static defaults
  const [settings, setSettings] = useState({
    site_name: "Habtamu Simeneh",
    site_title: "Full Stack Engineer & System Architect",
    site_subtitle: "Specializing in high-performance web engineering, complex relational structures, and advanced algorithm logic. University student of Information Systems at Injibara University, Gojjam, Amhara, Ethiopia. Dedicated to deploying elegant, secure full-stack software.",
    contact_email: "habtesimeneh30@gmail.com",
    social_github: "https://github.com/habtamu",
    social_linkedin: "https://linkedin.com/in/habtamu",
    social_twitter: "https://twitter.com/habtamu",
    profile_image: "",
  });

  const [loading, setLoading] = useState(true);
  const [orbitPhrases, setOrbitPhrases] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [testIndex, setTestIndex] = useState(0);

  // Fetch Homepage data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Error fetching homepage settings:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchOrbitTexts = async () => {
      try {
        const res = await fetch("/api/orbit-texts");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setOrbitPhrases(data.map((item) => item.text));
          }
        }
      } catch (err) {
        console.error("Error fetching orbit texts:", err);
      }
    };

    const fetchGallery = async () => {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data = await res.json();
          setGalleryItems(data);
        }
      } catch (err) {
        console.error("Error fetching gallery:", err);
      } finally {
        setGalleryLoading(false);
      }
    };

    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials");
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data);
        }
      } catch (err) {
        console.error("Error fetching testimonials:", err);
      }
    };

    fetchSettings();
    fetchOrbitTexts();
    fetchGallery();
    fetchTestimonials();
  }, []);

  // Typing effect loop
  useEffect(() => {
    const activeTitle = titles[titleIndex];
    let typingSpeed = isDeleting ? 30 : 80;

    if (!isDeleting && charIndex === activeTitle.length) {
      typingSpeed = 1500;
      setIsDeleting(true);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setTitleIndex((prev) => (prev + 1) % titles.length);
      typingSpeed = 500;
    }

    const timer = setTimeout(() => {
      setTypedText(
        isDeleting
          ? activeTitle.substring(0, charIndex - 1)
          : activeTitle.substring(0, charIndex + 1)
      );
      setCharIndex((prev) => (isDeleting ? prev - 1 : prev + 1));
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, titleIndex]);

  // Testimonials Auto-slide timer
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setTestIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials]);

  // Parsing first name and last name for styling
  const nameParts = (settings.site_name || "Habtamu Simeneh").split(" ");
  const firstName = nameParts[0] || "Habtamu";
  const lastName = nameParts.slice(1).join(" ") || "Simeneh";

  // Safeguard we always have exactly 4 rotating texts for optimal layout around portrait
  const activePhrases = orbitPhrases.length >= 4
    ? orbitPhrases.slice(0, 4)
    : [
        orbitPhrases[0] || "Full-Stack Software Engineer",
        orbitPhrases[1] || "Database System Architect",
        orbitPhrases[2] || "Information Systems Specialist",
        orbitPhrases[3] || "Academic Research Writer"
      ];

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
      
      {/* SECTION 1: HERO VIEW */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        
        {/* Dynamic Background Glow Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[120px] bg-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-500/5 rounded-full blur-[120px] bg-pulse-glow" style={{ animationDelay: "4s" }} />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
          
          {/* Intro Text Column */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2"
            >
              <span className="w-8 h-[1px] bg-gold-500" />
              <span className="text-xs uppercase font-mono tracking-widest text-gold-600 dark:text-gold-500 font-semibold">
                Available for International Roles
              </span>
            </motion.div>

            <div className="flex flex-col gap-2">
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-sm font-mono tracking-widest text-gray-500 dark:text-gray-400 uppercase font-bold"
              >
                Greeting, I am
              </motion.h2>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight"
              >
                {firstName} <span className="text-gold-500">{lastName}</span>
              </motion.h1>
            </div>

            {/* Dynamic Typing Title */}
            <div className="h-8 flex items-center">
              <p className="text-lg sm:text-xl font-mono text-gold-600 dark:text-gold-400/90 font-medium">
                {typedText}
                <span className="animate-pulse text-gold-500">|</span>
              </p>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl"
            >
              {settings.site_subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <Link
                to="/projects"
                className="px-6 py-3 rounded-full bg-gold-gradient text-black font-semibold text-sm font-sans tracking-wide hover-gold-glow flex items-center gap-2 group transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <span>Explore Projects</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/contact"
                className="px-6 py-3 rounded-full bg-transparent text-gray-800 dark:text-white font-medium text-sm font-sans tracking-wide border border-gray-300 dark:border-gold-500/30 hover:border-gold-500/80 hover:bg-gold-500/5 transition-all duration-300"
              >
                Get In Touch
              </Link>
            </motion.div>
          </div>

          {/* Profile Image & Orbiting Phrases Column */}
          <div className="lg:col-span-5 flex justify-center order-1 lg:order-2 mt-8 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[360px] lg:h-[360px] group flex items-center justify-center"
            >
              {/* Outer decorative gold rotating frame */}
              <div className="absolute inset-0 rounded-full border border-dashed border-gold-500/20 animate-[spin_40s_linear_infinite] pointer-events-none" />

              {/* Orbiting Phrases Ring (Pure High-Performance CSS Rotation) */}
              <div className="absolute inset-[-40px] sm:inset-[-60px] lg:inset-[-70px] rounded-full animate-[spin_45s_linear_infinite] pointer-events-none z-20">
                {/* 1. Top text */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="animate-[spin_45s_linear_infinite_reverse] px-2.5 py-1.5 bg-black/90 dark:bg-zinc-900/95 border border-gold-500/40 rounded-full text-[9px] sm:text-xs font-mono font-bold tracking-wider text-gold-500 shadow-xl pointer-events-auto whitespace-nowrap">
                    {activePhrases[0]}
                  </div>
                </div>

                {/* 2. Right text */}
                <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
                  <div className="animate-[spin_45s_linear_infinite_reverse] px-2.5 py-1.5 bg-black/90 dark:bg-zinc-900/95 border border-gold-500/40 rounded-full text-[9px] sm:text-xs font-mono font-bold tracking-wider text-gold-500 shadow-xl pointer-events-auto whitespace-nowrap">
                    {activePhrases[1]}
                  </div>
                </div>

                {/* 3. Bottom text */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                  <div className="animate-[spin_45s_linear_infinite_reverse] px-2.5 py-1.5 bg-black/90 dark:bg-zinc-900/95 border border-gold-500/40 rounded-full text-[9px] sm:text-xs font-mono font-bold tracking-wider text-gold-500 shadow-xl pointer-events-auto whitespace-nowrap">
                    {activePhrases[2]}
                  </div>
                </div>

                {/* 4. Left text */}
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="animate-[spin_45s_linear_infinite_reverse] px-2.5 py-1.5 bg-black/90 dark:bg-zinc-900/95 border border-gold-500/40 rounded-full text-[9px] sm:text-xs font-mono font-bold tracking-wider text-gold-500 shadow-xl pointer-events-auto whitespace-nowrap">
                    {activePhrases[3]}
                  </div>
                </div>
              </div>

              {/* Inner background blob gradient */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-gold-500/10 via-white dark:via-black to-gold-500/5 border border-gold-500/10 p-2 overflow-hidden shadow-2xl flex items-center justify-center">
                {loading ? (
                  <div className="w-full h-full rounded-full bg-gray-200 dark:bg-zinc-800 animate-pulse" />
                ) : settings.profile_image ? (
                  <img
                    src={settings.profile_image}
                    alt={settings.site_name}
                    className="w-full h-full object-cover rounded-full filter grayscale hover:grayscale-0 group-hover:grayscale-0 active:grayscale-0 group-active:grayscale-0 transition-all duration-700 relative z-10 hover:scale-105 group-hover:scale-105 active:scale-105 group-active:scale-105"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-gold-500/20 to-gold-500/40 flex items-center justify-center text-white font-serif text-4xl relative z-10">
                    {firstName.charAt(0)}{lastName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Dynamic visual indicator widgets surrounding portrait */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-2 -left-2 bg-white/95 dark:bg-black/90 border border-gray-200 dark:border-gold-500/30 rounded-lg p-3 flex items-center gap-2.5 shadow-lg backdrop-blur-md z-30"
              >
                <div className="p-1.5 rounded-md bg-gold-500/10 text-gold-500 shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-500">Database Schema</span>
                  <span className="block text-xs font-bold text-gray-900 dark:text-white leading-none">Relational Master</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="absolute -top-2 -right-2 bg-white/95 dark:bg-black/90 border border-gray-200 dark:border-gold-500/30 rounded-lg p-3 flex items-center gap-2.5 shadow-lg backdrop-blur-md z-30"
              >
                <div className="p-1.5 rounded-md bg-gold-500/10 text-gold-500 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-500">ALX Software</span>
                  <span className="block text-xs font-bold text-gray-900 dark:text-white leading-none">Certified Engineer</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* SECTION 2: MEDIA GALLERY */}
      <section className="py-24 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-semibold block mb-2">
              Visual Showcase
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Media Gallery
            </h2>
            <div className="w-12 h-1 bg-gold-500 mx-auto mt-4" />
          </div>

          {galleryLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 rounded-xl bg-gray-200 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-16 text-gray-500 font-mono border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
              No media gallery items uploaded. Please visit Admin Panel to populate the media gallery.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.slice(0, 3).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative h-72 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900/40 shadow-sm hover:shadow-lg dark:hover:shadow-gold-500/5 transition-all duration-500 flex flex-col justify-end"
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 group-active:grayscale-0 group-active:scale-105 active:grayscale-0 active:scale-105 transition-all duration-700 pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                  {/* Visual Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                  
                  <div className="relative p-6 z-10 flex flex-col gap-1">
                    {item.category && (
                      <span className="text-[9px] font-mono uppercase tracking-widest text-gold-400 font-semibold">
                        {item.category}
                      </span>
                    )}
                    <h3 className="font-serif text-lg font-bold text-white tracking-wide group-hover:text-gold-400 transition-colors duration-300">
                      {item.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/projects?tab=gallery"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-transparent border border-gray-300 dark:border-gold-500/30 text-gray-800 dark:text-white font-medium text-sm hover:border-gold-500 hover:bg-gold-500/5 transition-all duration-300"
            >
              <span>View Portfolio & Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* SECTION 3: TESTIMONIALS AUTO-SLIDING CAROUSEL */}
      <section className="py-24 border-t border-gray-100 dark:border-white/5 bg-transparent relative z-10 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-semibold block mb-2">
              Recommendations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Client Testimonials
            </h2>
            <div className="w-12 h-1 bg-gold-500 mx-auto mt-4" />
          </div>

          {testimonials.length === 0 ? (
            <div className="text-center py-16 text-gray-500 font-mono border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
              No recommendations listed yet.
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              
              {/* Slides wrapper with Framer-motion */}
              <AnimatePresence mode="wait">
                {testimonials.map((t, idx) => {
                  if (idx !== testIndex) return null;
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="w-full bg-gray-50 dark:bg-zinc-950/40 border border-gray-100 dark:border-white/5 rounded-2xl p-8 sm:p-12 shadow-xl dark:shadow-none flex flex-col items-center text-center relative"
                    >
                      {/* Decorative quotes */}
                      <span className="absolute top-4 left-6 text-gold-500/15 font-serif text-8xl pointer-events-none">“</span>
                      
                      <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed italic mb-8 relative z-10">
                        {t.feedback}
                      </p>

                      <div className="flex flex-col items-center gap-3">
                        {t.avatar_url ? (
                           <img
                             src={t.avatar_url}
                             alt={t.client_name}
                             className="w-14 h-14 rounded-full object-cover border-2 border-gold-500/40 shadow-md"
                             referrerPolicy="no-referrer"
                           />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-gold-500/20 to-gold-500/40 flex items-center justify-center text-white text-lg font-bold border-2 border-gold-500/40">
                            {t.client_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-serif font-bold text-gray-900 dark:text-white text-base">
                            {t.client_name}
                          </h4>
                          <p className="text-xs font-mono text-gold-600 dark:text-gold-500 mt-0.5">
                            {t.client_role} {t.client_company ? `at ${t.client_company}` : ""}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Slider Controls */}
              {testimonials.length > 1 && (
                <div className="flex items-center gap-4 mt-8">
                  <button
                    onClick={() => setTestIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                    className="p-2 rounded-full border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gold-500 hover:border-gold-500 transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                  
                  {/* Indicators */}
                  <div className="flex gap-2">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setTestIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === testIndex ? "bg-gold-500 w-6" : "bg-gray-300 dark:bg-white/20"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setTestIndex((prev) => (prev + 1) % testimonials.length)}
                    className="p-2 rounded-full border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gold-500 hover:border-gold-500 transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      </section>

    </div>
  );
}
