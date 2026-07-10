import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, Loader2, Check, Copy } from "lucide-react";
import { toast } from "../components/Toast.jsx";

export default function Contact() {
  const [formData, setFormData] = useState({
    sender_name: "",
    sender_email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText("habtesimeneh30@gmail.com");
    setCopied(true);
    toast("Email copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sender_name || !formData.sender_email || !formData.message) {
      toast("Please fill in all required fields", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast("Message sent successfully!", "success");
        setSubmitted(true);
        setFormData({
          sender_name: "",
          sender_email: "",
          subject: "",
          message: "",
        });
      } else {
        const err = await res.json();
        toast(err.error || "Failed to submit message", "error");
      }
    } catch (error) {
      toast("Network error. Please try again later.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email Communication",
      value: "habtesimeneh30@gmail.com",
      link: "https://mail.google.com/mail/?view=cm&fs=1&to=habtesimeneh30@gmail.com",
    },
    {
      icon: Phone,
      label: "Primary Phone Line",
      value: "+251 928 832 150",
      link: "tel:+251928832150",
    },
    {
      icon: Phone,
      label: "Secondary Phone Line",
      value: "+251 950 085 655",
      link: "tel:+251950085655",
    },
    {
      icon: MapPin,
      label: "Base Office",
      value: "Gojjam, Injibara, Amhara, Ethiopia",
      link: "https://maps.google.com/?q=Injibara,Ethiopia",
    },
  ];

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white pt-28 pb-16 overflow-hidden transition-colors duration-300">
      
      {/* Background ambient pulse lights */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[120px] bg-pulse-glow" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col gap-12">
        
        {/* Page Title */}
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs uppercase font-mono tracking-widest text-gold-600 dark:text-gold-500 font-semibold block mb-2">Get In Touch</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-wide text-gray-900 dark:text-white">
            Secure <span className="text-gold-500">Handshake</span>
          </h2>
          <div className="w-16 h-1 bg-gold-500 mx-auto mt-4 rounded" />
        </div>

        {/* Form and info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto w-full pt-4">
          
          {/* Left Column: Info cards */}
          <div className="lg:col-span-5 flex flex-col gap-4 text-left">
            <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Let's craft the next digital standard.
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Have an international career opening, academic research collaboration, or custom full-stack software requirements? Submit your message below to synchronize live with my relational database.
            </p>

            <div className="flex flex-col gap-4">
              {contactInfo.map((info, idx) => {
                const Icon = info.icon;
                const isEmail = info.label === "Email Communication";
                return (
                  <motion.a
                    key={idx}
                    href={info.link}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -4, 
                      boxShadow: "0 12px 24px -10px rgba(212,163,89,0.25), 0 4px 12px -5px rgba(212,163,89,0.2)" 
                    }}
                    whileTap={{ 
                      scale: 0.98,
                      y: 0,
                      boxShadow: "0 4px 6px -2px rgba(212,163,89,0.1)"
                    }}
                    className="p-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-between hover-gold-glow group shadow-sm dark:shadow-none transition-all duration-300 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gold-500/10 text-gold-500 rounded-lg group-hover:bg-gold-500 group-hover:text-black transition-colors shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-400">
                          {info.label}
                        </span>
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white mt-0.5 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                          {info.value}
                        </span>
                      </div>
                    </div>

                    {isEmail && (
                      <motion.button
                        type="button"
                        onClick={handleCopyEmail}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2.5 rounded-lg bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gold-500 dark:hover:text-gold-400 hover:bg-gold-500/10 dark:hover:bg-gold-500/10 hover:border-gold-500/30 dark:hover:border-gold-500/30 transition-all duration-200 shrink-0 relative z-20"
                        title="Copy Email Address"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-500 animate-pulse" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </motion.button>
                    )}
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Right Column: Form Panel */}
          <div className="lg:col-span-7 w-full">
            <div className="bg-gray-50 dark:bg-[#0c0c0c] rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 text-left shadow-sm dark:shadow-none">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-12 gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500">
                    <Check className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl font-bold text-gray-900 dark:text-white">Database Synchronized!</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-sm">
                      Your message was logged directly to my SQL table. I'll reach back via email within 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10 text-xs font-mono tracking-widest uppercase transition text-gray-700 dark:text-white"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.sender_name}
                        onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                        className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-700"
                        placeholder="Dawit Abebe"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.sender_email}
                        onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                        className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-700"
                        placeholder="client@company.com"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">Subject of Interest</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-700"
                      placeholder="e.g. Software Engineering Opening"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">Your Message *</label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-700 leading-relaxed"
                      placeholder="Describe your requirements or opportunities here..."
                    />
                  </div>

                  {/* Submission triggers */}
                  <div className="pt-2">
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(212,163,89,0.3)" }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-3.5 bg-gold-gradient text-black font-semibold text-xs rounded-lg uppercase tracking-wider font-mono flex items-center justify-center gap-2 hover-gold-glow disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Pushing to MySQL Engine...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Your Message</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
