import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sliders, Cpu, Database, Terminal, ShieldAlert, X, CheckCircle2, Info, Sparkles } from "lucide-react";

const SKILL_DETAILS_MAP = {
  react: {
    explanation: "React is a powerful component-based frontend library for building modern, interactive, and highly responsive user interfaces with a virtual DOM that optimizes UI re-renders.",
    advantages: [
      "Component-based architecture fosters clean, reusable codebases",
      "Virtual DOM ensures blazing-fast rendering speeds for complex state changes",
      "Unrivaled ecosystem with robust tools for routing, state management, and animations"
    ]
  },
  typescript: {
    explanation: "TypeScript is a strongly typed superset of JavaScript that adds structural static types to prevent bugs at compile-time and improve developer productivity.",
    advantages: [
      "Prevents up to 15% of common developer bugs during static analysis",
      "Provides rich auto-complete and IDE refactoring support for scalable development",
      "Compiles to clean, standard JavaScript compatible with any runtime or engine"
    ]
  },
  javascript: {
    explanation: "JavaScript is the high-level, dynamic, and multi-paradigm language of the web, driving interactivity on both the client-side and server-side.",
    advantages: [
      "Universally supported across all web browsers without plugins",
      "Asynchronous event loop model optimizes non-blocking I/O operations",
      "Extremely versatile language supporting object-oriented and functional patterns"
    ]
  },
  "tailwind css": {
    explanation: "Tailwind CSS is a utility-first CSS framework that allows developers to write CSS styling directly within HTML structures for rapid design implementation.",
    advantages: [
      "Enforces a consistent, constraint-based design system out of the box",
      "Significantly reduces stylesheet size through automated dead-code elimination (PurgeCSS)",
      "Eliminates the need to write custom CSS rules or invent class names"
    ]
  },
  css: {
    explanation: "Cascading Style Sheets (CSS) is the standard visual language used to style documents and web apps beautifully.",
    advantages: [
      "Separates structural HTML from visual styling and aesthetics",
      "Enables fluid and beautiful animations, layouts, and responsive queries",
      "Highly performant rendering executed natively by web browsers"
    ]
  },
  html: {
    explanation: "HyperText Markup Language (HTML) is the core standard markup language used to structure and present all documents and web apps on the internet.",
    advantages: [
      "Forms the foundation of web accessibility and semantic search engine indexing",
      "Extremely lightweight and loaded directly by web engines",
      "Declarative markup integrates easily with any programming library or tool"
    ]
  },
  "node.js": {
    explanation: "Node.js is a cross-platform, open-source JavaScript runtime environment built on Chrome's V8 engine that runs servers and backend scripts.",
    advantages: [
      "Single-threaded, non-blocking asynchronous event loop allows thousands of concurrent connections",
      "Fosters uniform frontend-backend code reuse by running JavaScript on the server",
      "Vast npm registry containing millions of reusable modules and packages"
    ]
  },
  express: {
    explanation: "Express is a minimal, flexible, and robust Node.js web application framework providing a lightweight set of features for building web and mobile APIs.",
    advantages: [
      "Superb speed and minimalist overhead for custom routing patterns",
      "Extremely robust middleware integration ecosystem",
      "Industry standard choice for constructing RESTful and GraphQL backend services"
    ]
  },
  oracle: {
    explanation: "Oracle Database is a multi-model database management system designed for enterprise-grade data management, online transaction processing (OLTP), and data warehousing.",
    advantages: [
      "Industry-leading security with advanced row-level access controls and data encryption",
      "Massive scalability capable of handling petabytes of mission-critical business transactions",
      "Advanced optimizer engines and analytical functions for complex queries"
    ]
  },
  sql: {
    explanation: "Structured Query Language (SQL) is the standardized programming language used to manage, query, and manipulate relational databases with pristine precision.",
    advantages: [
      "Enforces data integrity, foreign key relations, and consistency rules (ACID compliance)",
      "Declarative query engine allows developers to describe what data they need, not how to retrieve it",
      "Highly optimized for complex join operations and aggregate analytics"
    ]
  },
  postgresql: {
    explanation: "PostgreSQL is an advanced, enterprise-class, open-source object-relational database system emphasizing compliance, extensibility, and rich SQL queries.",
    advantages: [
      "Fully compliant with SQL standard specifications",
      "Supports advanced data types like JSONB, geographic points, and full-text search out of the box",
      "Extremely extensible through custom triggers, functions, and extensions"
    ]
  },
  mysql: {
    explanation: "MySQL is the world's most popular open-source relational database management system, renowned for its speed, reliability, and ease of use in web apps.",
    advantages: [
      "Exceptional transaction speed and read optimization for high-traffic websites",
      "Extensive global support and seamless integration with web hosting servers",
      "Strong data protection through automated clustering and replication strategies"
    ]
  },
  git: {
    explanation: "Git is a free and open-source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.",
    advantages: [
      "Distributed architecture allows developers to work and commit offline safely",
      "Lightweight branching model supports high-velocity parallel feature development",
      "Ensures cryptographic integrity of files through secure SHA hashing"
    ]
  },
  github: {
    explanation: "GitHub is a cloud-based hosting service for Git repositories, facilitating collaborative software development, issue tracking, and automated CI/CD workflows.",
    advantages: [
      "Centralizes code collaboration through robust pull requests and interactive code reviews",
      "Powerful integrated CI/CD automation through GitHub Actions pipelines",
      "Enhances security with automated vulnerability scanning and dependency alerts"
    ]
  }
};

const getSkillDetail = (name, category) => {
  const normalized = name.toLowerCase().replace(".js", "").trim();
  if (SKILL_DETAILS_MAP[normalized]) {
    return SKILL_DETAILS_MAP[normalized];
  }
  
  const altName = name.toLowerCase().trim();
  if (SKILL_DETAILS_MAP[altName]) {
    return SKILL_DETAILS_MAP[altName];
  }

  // Fallbacks
  const advantagesMap = {
    frontend: [
      "Enhances user experience with responsive rendering patterns.",
      "Implements modular, scalable client-side logic and components.",
      "Optimized for quick load times and browser compatibility."
    ],
    backend: [
      "Ensures secure, robust, and reliable API routing and logic.",
      "Optimizes background computations, database storage, and connections.",
      "Scalable structure suited for handling high concurrent load."
    ],
    database: [
      "Guarantees structured organization, indexing, and persistent storage.",
      "Optimizes lookup queries, relations, constraints, and data durability.",
      "Enforces strict data validation rules, security, and schema normalizations."
    ],
    tools: [
      "Improves software release velocity, versioning, and testing workflows.",
      "Fosters high-quality standards and seamless team collaboration.",
      "Automates repetitive manual procedures and optimizes deployment configurations."
    ]
  };

  const catLower = category.toLowerCase();
  const advantages = advantagesMap[catLower] || [
    "Accelerates project delivery and standardizes modular code.",
    "Ensures industry-compliant security and data structures.",
    "Optimizes runtime execution speeds and resource consumption."
  ];

  return {
    explanation: `${name} is a key technology in modern software architectures, specializing in creating robust solutions within ${category} workflows. It enables high-fidelity implementations while maintaining standard design and structural specifications.`,
    advantages
  };
};

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch("/api/skills");
      if (res.ok) {
        setSkills(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", "Frontend", "Backend", "Database", "Tools"];

  const filteredSkills =
    activeCategory === "All"
      ? skills
      : skills.filter((s) => s.category.toLowerCase() === activeCategory.toLowerCase());

  // Category Icon Resolver
  const getCategoryIcon = (cat) => {
    switch (cat.toLowerCase()) {
      case "frontend":
        return Cpu;
      case "backend":
        return Terminal;
      case "database":
        return Database;
      default:
        return Sliders;
    }
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white pt-28 pb-16 overflow-hidden transition-colors duration-300">
      
      {/* Background ambient light */}
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gold-500/5 rounded-full blur-[120px] bg-pulse-glow" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col gap-10">
        
        {/* Page Title */}
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs uppercase font-mono tracking-widest text-gold-600 dark:text-gold-500 font-semibold block mb-2">Technical Matrix</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-wide text-gray-900 dark:text-white">
            Skills & <span className="text-gold-500">Expertise</span>
          </h2>
          <div className="w-16 h-1 bg-gold-500 mx-auto mt-4 rounded" />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-mono tracking-widest uppercase transition-all duration-300 border ${
                activeCategory === cat
                  ? "bg-gold-500 text-black border-gold-500 font-bold shadow-md shadow-gold-500/10"
                  : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-gold-500/50 hover:bg-gold-500/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Bento/Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto w-full pt-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="p-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 animate-pulse flex flex-col gap-3">
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-white/10 rounded" />
                <div className="h-2 w-full bg-gray-300 dark:bg-white/15 rounded" />
              </div>
            ))}
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-mono">
            No skills found in database for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full pt-4">
            {filteredSkills.map((sk) => {
              const Icon = getCategoryIcon(sk.category);
              return (
                <motion.div
                  key={sk.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedSkill(sk)}
                  className="p-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-4 hover-gold-glow relative group overflow-hidden shadow-sm dark:shadow-none cursor-pointer hover:border-gold-500/30 transition-all duration-300"
                >
                  {/* Category Accent lines */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom" />

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-gold-500/10 text-gold-500 rounded-lg group-hover:bg-gold-500 group-hover:text-black transition-colors shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-sans font-bold text-base text-gray-900 dark:text-white">{sk.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-gold-600 dark:text-gold-500">{sk.percentage}%</span>
                  </div>

                  {/* Progress Line */}
                  <div className="flex flex-col gap-2">
                    <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${sk.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-gold-gradient h-full"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-gray-500 dark:text-gray-400 uppercase">
                      <span>{sk.category}</span>
                      <span className="text-gold-500/80 group-hover:text-gold-500 font-bold transition-colors">Click to view details</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Database Integrity Certification Badge */}
        <div className="max-w-3xl mx-auto w-full p-6 rounded-2xl bg-gold-500/5 border border-gold-500/10 flex items-start gap-4 mt-8 text-left relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-xl" />
          <ShieldAlert className="w-6 h-6 text-gold-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 relative z-10">
            <h4 className="text-sm font-mono uppercase tracking-wider text-gold-500 font-bold">
              Oracle SQL and DB Normalization Certified
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Certified in building optimized relational databases in MySQL and PostgreSQL. Expert in schema design up to 3NF, utilizing structured foreign constraints, transactional prepared queries, indices optimization, and protection against malicious inputs.
            </p>
          </div>
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedSkill && (() => {
            const detail = getSkillDetail(selectedSkill.name, selectedSkill.category);
            const Icon = getCategoryIcon(selectedSkill.category);
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setSelectedSkill(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, y: 20, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-gray-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-2xl flex flex-col gap-6 text-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Decorative background ambient light */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl" />

                  {/* Header */}
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gold-500/10 text-gold-500 rounded-xl">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono tracking-widest uppercase text-gold-600 dark:text-gold-500 font-bold block mb-0.5">
                          {selectedSkill.category} Skill
                        </span>
                        <h3 className="font-serif font-bold text-2xl text-gray-900 dark:text-white">
                          {selectedSkill.name}
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedSkill(null)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Progress block */}
                  <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 relative z-10">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-gray-500 dark:text-gray-400">Current Proficiency Level</span>
                      <span className="text-gold-600 dark:text-gold-500 font-bold">{selectedSkill.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gold-gradient h-full rounded-full"
                        style={{ width: `${selectedSkill.percentage}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400 text-right mt-1">
                      Status: {selectedSkill.percentage >= 90 ? "Expert System Level" : selectedSkill.percentage >= 75 ? "Advanced Application Level" : "Proficient Level"}
                    </div>
                  </div>

                  {/* Explanation Section */}
                  <div className="flex flex-col gap-2 relative z-10">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-bold flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      <span>Skill Explanation</span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                      {detail.explanation}
                    </p>
                  </div>

                  {/* Advantages Section */}
                  <div className="flex flex-col gap-3 relative z-10">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-gold-600 dark:text-gold-500 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Key Advantages & Strengths</span>
                    </h4>
                    <div className="flex flex-col gap-2.5">
                      {detail.advantages.map((adv, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start">
                          <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0 mt-0.5 animate-[pulse_2s_infinite]" />
                          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-normal">{adv}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex justify-end relative z-10">
                    <button
                      onClick={() => setSelectedSkill(null)}
                      className="px-5 py-2.5 rounded bg-gold-500 text-black font-mono text-xs uppercase tracking-wider font-bold hover:bg-gold-400 active:scale-95 transition-all"
                    >
                      Close Details
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

      </div>
    </div>
  );
}
