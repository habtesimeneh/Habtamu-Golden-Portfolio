import { useState, useEffect } from "react";
import { motion } from "motion/react";
import * as Icons from "lucide-react";

export default function Services() {
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, testimonialsRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/testimonials"),
        ]);
        if (servicesRes.ok) setServices(await servicesRes.json());
        if (testimonialsRes.ok) setTestimonials(await testimonialsRes.json());
      } catch (err) {
        console.error("Error loading services page metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    if (IconComponent) {
      return <IconComponent className="w-6 h-6 text-gold-500 group-hover:text-black transition-colors" />;
    }
    return <Icons.Cpu className="w-6 h-6 text-gold-500 group-hover:text-black transition-colors" />;
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white pt-28 pb-16 overflow-hidden transition-colors duration-300">
      
      {/* Background glow overlay */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[110px] bg-pulse-glow" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col gap-12">
        
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl mx-auto"
        >
          <span className="text-xs uppercase font-mono tracking-widest text-gold-600 dark:text-gold-500 font-semibold block mb-2">Professional Offerings</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-wide text-gray-900 dark:text-white">
            Services & <span className="text-gold-500">Reviews</span>
          </h2>
          <div className="w-16 h-1 bg-gold-500 mx-auto mt-4 rounded" />
        </motion.div>

        {/* Services Bento Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full pt-4">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="h-48 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full pt-4">
            {services.map((srv, idx) => (
              <motion.div
                key={srv.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="p-6 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-left hover-gold-glow relative flex flex-col gap-4 group shadow-sm dark:shadow-none"
              >
                {/* Icon wrapper */}
                <div className="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0 group-hover:bg-gold-500 transition-colors">
                  {getIcon(srv.icon)}
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                  <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-white group-hover:text-gold-500 transition-colors">
                    {srv.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {srv.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Testimonials Review Slider / Section */}
        <div className="pt-12 border-t border-gray-200 dark:border-white/5 mt-6 flex flex-col gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-xl mx-auto"
          >
            <span className="text-xs uppercase font-mono tracking-widest text-gold-600 dark:text-gold-500 font-semibold block mb-2">Recommendations</span>
            <h3 className="font-serif text-2xl sm:text-3.5xl font-bold tracking-wide text-gray-900 dark:text-white">
              Client <span className="text-gold-500">Endorsements</span>
            </h3>
          </motion.div>

          {loading ? (
            <div className="max-w-4xl mx-auto w-full h-32 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl animate-pulse" />
          ) : testimonials.length === 0 ? (
            <p className="text-sm text-gray-500 font-mono">No feedback recorded in database.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full">
              {testimonials.map((t, idx) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-gray-50 dark:bg-[#090909] border border-gray-200 dark:border-white/5 text-left flex flex-col gap-4 justify-between shadow-sm dark:shadow-none"
                >
                  <p className="text-gray-700 dark:text-gray-300 text-sm italic leading-relaxed">
                    "{t.feedback}"
                  </p>
                  <div className="flex items-center gap-3.5 border-t border-gray-200 dark:border-white/5 pt-4">
                    {t.avatar_url && (
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 dark:border-white/15 shrink-0">
                        <img src={t.avatar_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h5 className="font-sans font-bold text-sm text-gray-900 dark:text-white">{t.client_name}</h5>
                      <span className="text-[11px] font-mono text-gold-600 dark:text-gold-500">
                        {t.client_role} {t.client_company ? `at ${t.client_company}` : ""}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
