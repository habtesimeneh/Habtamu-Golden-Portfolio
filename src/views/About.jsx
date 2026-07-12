import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, GraduationCap, Briefcase, Award, Download, CheckCircle, ArrowRight, X, ShieldCheck, Check, Link2, Fingerprint, ExternalLink } from "lucide-react";
import { fetchJson } from "../lib/api.js";

export default function About() {
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [resumeUrl, setResumeUrl] = useState("/uploads/habtamu_resume.pdf");
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [edu, exp, certs, resumes, settings] = await Promise.all([
        fetchJson("/api/education", []),
        fetchJson("/api/experience", []),
        fetchJson("/api/certificates", []),
        fetchJson("/api/resume", []),
        fetchJson("/api/settings", {}),
      ]);
      setEducation(edu);
      setExperience(exp);
      setCertificates(certs);
      const activeResume = resumes.find((r) => r.active === 1);
      if (activeResume) {
        setResumeUrl(activeResume.file_url);
      }
      if (settings.about_image) {
        setProfileImage(settings.about_image);
      } else if (settings.profile_image) {
        setProfileImage(settings.profile_image);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = [
    { value: "4+", label: "Academic Years" },
    { value: "15+", label: "SQL Relational Tables Designed" },
    { value: "20+", label: "Software Systems Crafted" },
    { value: "100%", label: "Secure Handshakes Built" },
  ];

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white pt-28 pb-16 overflow-hidden transition-colors duration-300">
      
      {/* Background glow overlay */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[100px] bg-pulse-glow" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col gap-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl mx-auto"
        >
          <span className="text-xs uppercase font-mono tracking-widest text-gold-600 dark:text-gold-500 font-semibold block mb-2">Biography & Milestones</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-wide text-gray-900 dark:text-white">
            About <span className="text-gold-500">My Mission</span>
          </h2>
          <div className="w-16 h-1 bg-gold-500 mx-auto mt-4 rounded" />
        </motion.div>

        {/* Biography Column with image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 relative group"
          >
            <div className="absolute inset-0 bg-gold-500/10 rounded-2xl transform rotate-3 transition duration-500 group-hover:rotate-1" />
            <div className="relative rounded-2xl border border-gray-200 dark:border-gold-500/15 overflow-hidden aspect-square bg-gray-100 dark:bg-[#0b0b0b] flex items-center justify-center">
              {loading ? (
                <div className="w-full h-full bg-gray-200 dark:bg-zinc-800 animate-pulse" />
              ) : profileImage ? (
                <img
                  src={profileImage}
                  alt="Habtamu Biography Portrait"
                  className="w-full h-full object-cover filter grayscale hover:grayscale-0 group-hover:grayscale-0 active:grayscale-0 group-active:grayscale-0 transition duration-500 hover:scale-105 group-hover:scale-105 active:scale-105 group-active:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-gold-500/20 to-gold-500/40 flex items-center justify-center text-white font-serif text-6xl">
                  HS
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 flex flex-col gap-6 text-left"
          >
            <h3 className="font-serif text-2xl font-bold text-gold-600 dark:text-gold-400">
              Developing secure, enterprise architectures for local and global problems.
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              I am Habtamu Simeneh, an Information Systems student at Injibara University, Ethiopia. I live in Gojjam, Injibara, within the beautiful Amhara Region of Ethiopia. My passion lies at the intersection of full-stack engineering, secure database architecture, and complex backend algorithms. From designing custom payment gateways for Telebirr/Chapa integrations to setting up robust relational schemas, I prioritize code scalability and security.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              With a background shaped by certifications from Oracle Academy and ALX Africa Software Engineering, I combine theoretical university depth with real-world, enterprise-level programming standards.
            </p>

            {/* Achievements Summary Bullet points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-4 h-4 text-gold-500 shrink-0" />
                <span>Oracle SQL Database Mastery</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-4 h-4 text-gold-500 shrink-0" />
                <span>REST API Engineering Expert</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-4 h-4 text-gold-500 shrink-0" />
                <span>Academic & Technical Documentation</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-4 h-4 text-gold-500 shrink-0" />
                <span>Security Prepared Queries Handler</span>
              </div>
            </div>

            {/* Download CV Action */}
            <div className="pt-4">
              <a
                href={resumeUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gold-gradient text-black font-semibold text-sm rounded-full hover-gold-glow transition duration-300 uppercase tracking-wider font-mono shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download Curriculum Vitae</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Counter Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-8 border-y border-gray-200 dark:border-white/5 mt-6"
        >
          {stats.map((s, index) => (
            <div key={index} className="flex flex-col gap-1 items-center text-center">
              <span className="text-3xl sm:text-4xl font-serif font-extrabold text-gold-500">
                {s.value}
              </span>
              <span className="text-xs uppercase font-mono tracking-widest text-gray-500 dark:text-gray-400">
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Academic and Professional Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
          
          {/* Education Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-6 text-left"
          >
            <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-white/5 pb-3">
              <GraduationCap className="w-5 h-5 text-gold-500" />
              <span>Academic Background</span>
            </h3>

            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-gray-100 dark:bg-white/5 rounded-xl" />
              </div>
            ) : education.length === 0 ? (
              <p className="text-sm text-gray-500 font-mono">No education history recorded.</p>
            ) : (
              <div className="flex flex-col gap-6 relative border-l border-gold-500/20 pl-5 ml-2.5">
                {education.map((edu, idx) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="relative group"
                  >
                    {/* Node Dot */}
                    <div className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-gold-500/10 dark:bg-gold-500/20 border border-gold-500 group-hover:bg-gold-500 transition-colors" />
                    
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-gold-600 dark:text-gold-500 mb-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      {edu.start_date} — {edu.end_date}
                    </span>
                    <h4 className="font-serif font-bold text-lg text-gray-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                      {edu.degree} in {edu.field_of_study}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{edu.institution}</p>
                    {edu.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{edu.description}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Professional Experience Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-6 text-left"
          >
            <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-white/5 pb-3">
              <Briefcase className="w-5 h-5 text-gold-500" />
              <span>Engineering Experience</span>
            </h3>

            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-gray-100 dark:bg-white/5 rounded-xl" />
              </div>
            ) : experience.length === 0 ? (
              <p className="text-sm text-gray-500 font-mono">No experience history recorded.</p>
            ) : (
              <div className="flex flex-col gap-6 relative border-l border-gold-500/20 pl-5 ml-2.5">
                {experience.map((exp, idx) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="relative group"
                  >
                    {/* Node Dot */}
                    <div className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-gold-500/10 dark:bg-gold-500/20 border border-gold-500 group-hover:bg-gold-500 transition-colors" />
                    
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-gold-600 dark:text-gold-500 mb-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      {exp.start_date} — {exp.end_date}
                    </span>
                    <h4 className="font-serif font-bold text-lg text-gray-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                      {exp.role}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{exp.company}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{exp.description}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Professional Certifications Grid */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6 pt-12 border-t border-gray-200 dark:border-white/5"
        >
          <div className="text-left">
            <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-200 dark:border-white/5 pb-3">
              <Award className="w-5 h-5 text-gold-500" />
              <span>Certifications & Accreditations</span>
            </h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="animate-pulse h-28 bg-gray-100 dark:bg-white/5 rounded-xl" />
              <div className="animate-pulse h-28 bg-gray-100 dark:bg-white/5 rounded-xl" />
              <div className="animate-pulse h-28 bg-gray-100 dark:bg-white/5 rounded-xl" />
            </div>
          ) : certificates.length === 0 ? (
            <p className="text-sm text-gray-500 font-mono">No certifications recorded in database.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert, idx) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="p-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-gold-500/30 transition-all duration-300 flex flex-col justify-between gap-4 group shadow-sm dark:shadow-none"
                >
                  <div className="flex gap-4">
                    {cert.image_url && (
                      <div className="w-12 h-12 rounded bg-gray-100 dark:bg-[#111] overflow-hidden shrink-0 border border-gray-200 dark:border-white/10">
                        <img
                          src={cert.image_url}
                          alt=""
                          className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-active:grayscale-0 active:grayscale-0 transition duration-300"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-serif font-bold text-base text-gray-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors leading-tight">
                        {cert.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{cert.issuer}</p>
                      <span className="text-[10px] font-mono text-gold-600 dark:text-gold-500/80 mt-1 block">Issued in {cert.issue_date}</span>
                    </div>
                  </div>
                  {cert.credential_url && (
                    <div className="text-right">
                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="inline-flex items-center gap-1 text-xs font-mono text-gray-500 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-500 transition-colors cursor-pointer"
                      >
                        <span>Verify Credential</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Live Credential Verification Validator Modal */}
        <AnimatePresence>
          {selectedCert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
              onClick={() => setSelectedCert(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-gray-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-2xl flex flex-col gap-5 text-left"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

                {/* Header */}
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl animate-[pulse_2s_infinite] border border-emerald-500/20">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-600 dark:text-emerald-400 font-bold block mb-0.5">
                        SECURE LOGIC PORTAL
                      </span>
                      <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white leading-tight">
                        Credential Validation
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCert(null)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Validation Status Card */}
                <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 relative z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-[ping_1.5s_infinite] shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Status: Authenticated & Verified
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 dark:text-emerald-500/70 mt-0.5">
                      Verified via Injibara University SQL Relational Ledger • Secure handshake complete.
                    </div>
                  </div>
                </div>

                {/* Credentials Detailed Metadata Table */}
                <div className="flex flex-col gap-3.5 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200/50 dark:border-white/5 text-sm font-sans relative z-10">
                  
                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">Certification Title</span>
                    <span className="font-bold text-gray-900 dark:text-white text-right max-w-[240px] leading-snug">{selectedCert.title}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">Issuing Authority</span>
                    <span className="font-medium text-gray-800 dark:text-gray-300">{selectedCert.issuer}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">Authorized Recipient</span>
                    <span className="font-medium text-gray-800 dark:text-gray-300">Habtamu Simeneh</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">Date of Issue</span>
                    <span className="font-medium text-gray-800 dark:text-gray-300">{selectedCert.issue_date}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-white/5">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">Registry ID</span>
                    <span className="font-mono text-xs text-gold-600 dark:text-gold-500 font-bold">
                      HS-CERT-{selectedCert.id}-{selectedCert.issue_date}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono flex items-center gap-1">
                      <Fingerprint className="w-3.5 h-3.5 text-gold-500" />
                      <span>Cryptographic SHA-256 Signature</span>
                    </span>
                    <span className="font-mono text-[9px] text-gray-400 dark:text-zinc-500 break-all select-all leading-relaxed bg-white dark:bg-black/40 px-2 py-1.5 rounded border border-gray-200/50 dark:border-white/5">
                      9158cda850db9036a79158649336367f88496bc8e{selectedCert.id}e29158f7bc250ef7a8b
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2.5 justify-end pt-2 border-t border-gray-100 dark:border-white/5 relative z-10">
                  <button
                    onClick={() => {
                      setSelectedCert(null);
                      setCopied(false);
                    }}
                    className="px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded text-xs font-mono uppercase tracking-widest text-gray-700 dark:text-gray-300 font-bold transition cursor-pointer"
                  >
                    Close
                  </button>
                  {selectedCert.credential_url && (
                    <>
                      <button
                        onClick={() => handleCopyLink(selectedCert.credential_url)}
                        className={`px-4 py-2 rounded text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          copied
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 border border-transparent"
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Link2 className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                      <a
                        href={selectedCert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-black rounded text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <span>Open External Verification</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
