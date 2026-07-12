import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Search, Github, ExternalLink, X, Folder, LayoutGrid, Database, Terminal, Cpu, ChevronDown, Image as ImageIcon } from "lucide-react";

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [galleryItems, setGalleryItems] = useState([]);
    const [galleryLoading, setGalleryLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeSubCategory, setActiveSubCategory] = useState("All");
    const [isWebDropdownOpen, setIsWebDropdownOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
    const [activeTab, setActiveTab] = useState("projects");
    const [activeGalleryCategory, setActiveGalleryCategory] = useState("All");
    const location = useLocation();

    const galleryCategories = ["All", "General", "Certificates", "Profile", "Projects", "Designs"];

    useEffect(() => {
        fetchProjects();
        fetchGallery();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get("tab");
        if (tabParam === "gallery" || location.state?.activeTab === "gallery") {
            setActiveTab("gallery");
        } else {
            setActiveTab("projects");
        }
    }, [location]);

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects");
            if (res.ok) {
                setProjects(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGallery = async () => {
        try {
            const res = await fetch("/api/gallery");
            if (res.ok) {
                setGalleryItems(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setGalleryLoading(false);
        }
    };

    const categories = ["All", "Web", "Mobile", "Design"];

    const getDevWorkType = (proj) => {
        const cat = proj.category.toLowerCase();

        if (
            cat === "full-stack" ||
            cat === "full stack" ||
            cat === "front-end" ||
            cat === "frontend" ||
            cat === "back-end" ||
            cat === "backend" ||
            cat === "web"
        ) {
            return "Web";
        }
        if (cat === "mobile") {
            return "Mobile";
        }
        if (cat === "design") {
            return "Design";
        }

        const title = proj.title.toLowerCase();
        const desc = proj.description.toLowerCase();

        if (
            title.includes("mobile") ||
            title.includes("app") ||
            title.includes("iot") ||
            title.includes("smart") ||
            desc.includes("mobile") ||
            desc.includes("sensor")
        ) {
            return "Mobile";
        }
        if (
            title.includes("registry") ||
            title.includes("design") ||
            title.includes("dashboard") ||
            desc.includes("ui") ||
            desc.includes("ux") ||
            cat.includes("database") ||
            cat.includes("design")
        ) {
            return "Design";
        }
        return "Web";
    };

    const matchesSubCategory = (proj) => {
        if (activeCategory !== "Web") return true;
        if (activeSubCategory === "All") return true;

        const cat = proj.category.toLowerCase();
        if (activeSubCategory === "Full-stack") {
            return cat.includes("full") || cat === "web";
        }
        if (activeSubCategory === "Front-end") {
            return cat.includes("front") || cat === "web";
        }
        if (activeSubCategory === "Back-end") {
            return cat.includes("back") || cat === "web";
        }
        return true;
    };

    const filteredProjects = projects.filter((proj) => {
        const matchesSearch =
            proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proj.description.toLowerCase().includes(searchQuery.toLowerCase());

        const projectDevType = getDevWorkType(proj);
        const matchesCategory =
            activeCategory === "All" || projectDevType.toLowerCase() === activeCategory.toLowerCase();

        return matchesSearch && matchesCategory && matchesSubCategory(proj);
    });

    const filteredGallery = galleryItems.filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
            activeGalleryCategory === "All" || item.category.toLowerCase() === activeGalleryCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    const getCategoryIcon = (cat) => {
        switch (cat.toLowerCase()) {
            case "design":
                return LayoutGrid;
            case "mobile":
                return Cpu;
            case "database":
                return Database;
            case "web":
            case "full-stack":
            case "full stack":
            case "front-end":
            case "frontend":
            case "back-end":
            case "backend":
                return Terminal;
            default:
                return Folder;
        }
    };

    return (
        <div className="relative min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white pt-36 pb-16 overflow-hidden transition-colors duration-300">

            {/* Background glow elements */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[120px] bg-pulse-glow" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col gap-8">

                {/* Page Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-xl mx-auto"
                >
                    <span className="text-xs uppercase font-mono tracking-widest text-gold-600 dark:text-gold-500 font-semibold block mb-2">Relational Portfolio Showcase</span>
                    <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-wide text-gray-900 dark:text-white">
                        Projects <span className="text-gold-500">Database</span>
                    </h2>
                    <div className="w-16 h-1 bg-gold-500 mx-auto mt-4 rounded" />
                </motion.div>

                {/* Tab Switcher */}
                <div className="flex justify-center gap-6 border-b border-gray-100 dark:border-white/5 pb-2 max-w-md mx-auto w-full mb-4">
                    <button
                        onClick={() => {
                            setActiveTab("projects");
                            setSearchQuery("");
                        }}
                        className={`pb-2 px-4 text-xs font-mono tracking-widest uppercase font-semibold transition-all duration-300 relative border-b-2 cursor-pointer ${
                            activeTab === "projects"
                                ? "border-gold-500 text-gold-500 font-bold"
                                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        Projects Showcase ({projects.length})
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("gallery");
                            setSearchQuery("");
                        }}
                        className={`pb-2 px-4 text-xs font-mono tracking-widest uppercase font-semibold transition-all duration-300 relative border-b-2 cursor-pointer ${
                            activeTab === "gallery"
                                ? "border-gold-500 text-gold-500 font-bold"
                                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        Media Gallery ({galleryItems.length})
                    </button>
                </div>

                {activeTab === "projects" ? (
                    <>
                        {/* Filter & Search Bar Row */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4 max-w-5xl mx-auto w-full"
                        >
                            {/* Categories */}
                            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start items-center">
                                {categories.map((cat) => {
                                    if (cat === "Web") {
                                        return (
                                            <div key={cat} className="relative inline-block">
                                                <button
                                                    onClick={() => {
                                                        setActiveCategory("Web");
                                                        setIsWebDropdownOpen(!isWebDropdownOpen);
                                                    }}
                                                    className={`px-4 py-2 rounded-full text-[11px] font-mono tracking-wider uppercase transition-all duration-300 border flex items-center gap-1.5 select-none cursor-pointer ${
                                                        activeCategory === "Web"
                                                            ? "bg-gold-500 text-black border-gold-500 font-bold shadow-sm"
                                                            : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-gold-500/40 hover:bg-gold-500/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                    }`}
                                                >
                                                    <span>{activeSubCategory === "All" ? "Web" : `Web: ${activeSubCategory}`}</span>
                                                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isWebDropdownOpen ? "rotate-180" : "rotate-0"}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {isWebDropdownOpen && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-30"
                                                                onClick={() => setIsWebDropdownOpen(false)}
                                                            />
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                transition={{ duration: 0.15 }}
                                                                className="absolute left-0 mt-2 w-44 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c0c0c] shadow-xl z-40 py-1.5 overflow-hidden text-left"
                                                            >
                                                                {[
                                                                    { label: "All Web", value: "All" },
                                                                    { label: "Full-stack", value: "Full-stack" },
                                                                    { label: "Front-end", value: "Front-end" },
                                                                    { label: "Back-end", value: "Back-end" }
                                                                ].map((sub) => (
                                                                    <button
                                                                        key={sub.value}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setActiveSubCategory(sub.value);
                                                                            setIsWebDropdownOpen(false);
                                                                        }}
                                                                        className={`w-full text-left px-4 py-2 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                                                                            activeSubCategory === sub.value
                                                                                ? "bg-gold-500/15 text-gold-600 dark:text-gold-400 font-bold"
                                                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                                                                        }`}
                                                                    >
                                                                        {sub.label}
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    }
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                setActiveCategory(cat);
                                                setActiveSubCategory("All");
                                                setIsWebDropdownOpen(false);
                                            }}
                                            className={`px-4 py-2 rounded-full text-[11px] font-mono tracking-wider uppercase transition-all duration-300 border cursor-pointer ${
                                                activeCategory === cat
                                                    ? "bg-gold-500 text-black border-gold-500 font-bold shadow-sm"
                                                    : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-gold-500/40 hover:bg-gold-500/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search Input */}
                            <div className="relative w-full md:w-80">
                                <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search projects by name..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full focus:outline-none focus:border-gold-500/60 text-xs font-sans text-gray-900 dark:text-white placeholder-gray-500 shadow-sm dark:shadow-none"
                                />
                            </div>
                        </motion.div>

                        {/* Projects Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full pt-4">
                                {[1, 2, 3].map((idx) => (
                                    <div key={idx} className="aspect-video rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 font-mono">
                                No projects matched your criteria.
                            </div>
                        ) : (
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.08,
                                        }
                                    }
                                }}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full pt-4"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredProjects.map((proj) => {
                                        const devType = getDevWorkType(proj);
                                        const Icon = getCategoryIcon(devType);
                                        return (
                                            <motion.div
                                                key={proj.id}
                                                layout
                                                variants={{
                                                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                                                    show: {
                                                        opacity: 1,
                                                        y: 0,
                                                        scale: 1,
                                                        transition: {
                                                            type: "spring",
                                                            stiffness: 100,
                                                            damping: 15
                                                        }
                                                    },
                                                    exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } }
                                                }}
                                                onClick={() => setSelectedProject(proj)}
                                                className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 overflow-hidden group cursor-pointer hover-gold-glow relative flex flex-col h-full shadow-sm dark:shadow-none"
                                            >
                                                {/* Category overlay label */}
                                                <span className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-gold-500/20 text-[9px] font-mono uppercase tracking-widest text-gold-500">
                                                    {proj.category}
                                                </span>

                                                {/* Project Image Panel */}
                                                <div className="aspect-video w-full overflow-hidden border-b border-gray-200 dark:border-white/10 relative">
                                                    <img
                                                        src={proj.image_url || "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800"}
                                                        alt={proj.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-95"
                                                    />
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="px-4 py-2 rounded-full bg-gold-500 text-black text-xs font-mono tracking-widest uppercase font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                            View Spec Sheets
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Details Panel */}
                                                <div className="p-5 text-left flex flex-col gap-2 flex-1">
                                                    <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors flex items-center gap-2">
                                                        <Icon className="w-4 h-4 text-gold-500 shrink-0" />
                                                        <span>{proj.title}</span>
                                                    </h4>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                                                        {proj.description}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Media Gallery Filters & Search Bar Row */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4 max-w-5xl mx-auto w-full"
                        >
                            {/* Gallery Categories */}
                            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start items-center">
                                {galleryCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveGalleryCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-[11px] font-mono tracking-wider uppercase transition-all duration-300 border cursor-pointer ${
                                            activeGalleryCategory === cat
                                                ? "bg-gold-500 text-black border-gold-500 font-bold shadow-sm"
                                                : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-gold-500/40 hover:bg-gold-500/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Gallery Search Input */}
                            <div className="relative w-full md:w-80">
                                <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search media assets..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full focus:outline-none focus:border-gold-500/60 text-xs font-sans text-gray-900 dark:text-white placeholder-gray-500 shadow-sm dark:shadow-none"
                                />
                            </div>
                        </motion.div>

                        {/* Media Gallery Grid */}
                        {galleryLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full pt-4">
                                {[1, 2, 3].map((idx) => (
                                    <div key={idx} className="aspect-video rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 animate-pulse" />
                                ))}
                            </div>
                        ) : filteredGallery.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 font-mono">
                                No media assets matched your criteria.
                            </div>
                        ) : (
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.08,
                                        }
                                    }
                                }}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full pt-4"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredGallery.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            variants={{
                                                hidden: { opacity: 0, y: 30, scale: 0.95 },
                                                show: {
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1,
                                                    transition: {
                                                        type: "spring",
                                                        stiffness: 100,
                                                        damping: 15
                                                    }
                                                },
                                                exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } }
                                            }}
                                            onClick={() => setSelectedGalleryItem(item)}
                                            className="group relative h-72 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900/40 shadow-sm hover:shadow-lg dark:hover:shadow-gold-500/5 transition-all duration-500 flex flex-col justify-end cursor-pointer"
                                        >
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="absolute inset-0 w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 group-active:grayscale-0 group-active:scale-105 active:grayscale-0 active:scale-105 transition-all duration-700 pointer-events-none"
                                                referrerPolicy="no-referrer"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                                            <div className="relative p-6 z-10 flex flex-col gap-1 text-left">
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
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </>
                )}

                {/* ============================================================ */}
                {/* PROJECT SPECIFICATION SHEETS – MODAL (triggered by card click) */}
                {/* ============================================================ */}
                <AnimatePresence>
                    {selectedProject && (
                        <div className="fixed inset-0  top-2 z-9999 flex items-center justify-center p-6 bg-black/60 dark:bg-black/90 backdrop-blur-md">
                            {/* Overlay background trigger close */}
                            <div className="absolute inset-0" onClick={() => setSelectedProject(null)} />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                className="max-w-3xl w-full bg-white dark:bg-[#0c0c0c] rounded-2xl border border-gray-200 dark:border-gold-500/20 overflow-hidden relative z-10 max-h-[90vh] overflow-y-auto shadow-2xl"
                            >
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-black/85 border border-white/10 hover:border-gold-500 transition-colors text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {/* Banner image */}
                                <div className="aspect-video sm:aspect-[2/1] w-full relative">
                                    <img
                                        src={selectedProject.image_url || "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800"}
                                        alt={selectedProject.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0c0c0c] via-transparent to-transparent" />

                                    {/* Category */}
                                    <span className="absolute bottom-6 left-6 px-3 py-1.5 rounded bg-gold-500 text-black text-[10px] font-mono uppercase tracking-widest font-extrabold">
                                        {selectedProject.category}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-6 sm:p-8 text-left flex flex-col gap-6">
                                    <div>
                                        <h3 className="font-serif text-2xl sm:text-3.5xl font-bold text-gray-900 dark:text-white mb-2">
                                            {selectedProject.title}
                                        </h3>
                                        <p className="text-xs font-mono text-gray-500">
                                            Sync Status: Database-driven live record
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <h5 className="text-xs uppercase font-mono tracking-widest text-gold-600 dark:text-gold-500 font-bold border-b border-gray-200 dark:border-gold-500/10 pb-1.5">
                                            Technical Overview
                                        </h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                            {selectedProject.description}
                                        </p>
                                    </div>

                                    {/* Actions Links */}
                                    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-white/5 mt-2">
                                        {selectedProject.github_link && (
                                            <a
                                                href={selectedProject.github_link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-5 py-3 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-300 dark:border-white/15 text-gray-800 dark:text-white font-medium text-xs font-mono tracking-wider uppercase flex items-center gap-2 transition duration-300 shadow-sm"
                                            >
                                                <Github className="w-4 h-4" />
                                                <span>Source Repository</span>
                                            </a>
                                        )}
                                        {selectedProject.live_link && (
                                            <a
                                                href={selectedProject.live_link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-5 py-3 rounded-full bg-gold-gradient text-black font-semibold text-xs font-mono tracking-wider uppercase flex items-center gap-2 hover-gold-glow transition shadow-md"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                <span>Live Handshake Link</span>
                                            </a>
                                        )}
                                    </div>
                                </div>

                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ============================================================ */}
                {/* GALLERY IMAGE LIGHTBOX MODAL (triggered by gallery item click) */}
                {/* ============================================================ */}
                <AnimatePresence>
                    {selectedGalleryItem && (
                        <div className="fixed inset-0 z-9999 flex items-center justify-center p-6 bg-black/80 dark:bg-black/95 backdrop-blur-md">
                            <div className="absolute inset-0" onClick={() => setSelectedGalleryItem(null)} />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                className="max-w-4xl w-full bg-white dark:bg-[#0c0c0c] rounded-2xl border border-gray-200 dark:border-gold-500/20 overflow-hidden relative z-10 max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
                            >
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedGalleryItem(null)}
                                    className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-black/80 border border-white/10 hover:border-gold-500 transition-colors text-gray-400 hover:text-white cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {/* Lightbox Image Container */}
                                <div className="w-full h-auto max-h-[70vh] overflow-hidden bg-black flex items-center justify-center relative">
                                    <img
                                        src={selectedGalleryItem.image_url}
                                        alt={selectedGalleryItem.title}
                                        className="max-w-full max-h-[70vh] object-contain"
                                        referrerPolicy="no-referrer"
                                    />
                                    <span className="absolute bottom-4 left-4 px-3 py-1.5 rounded bg-gold-500 text-black text-[10px] font-mono uppercase tracking-widest font-extrabold z-10">
                                        {selectedGalleryItem.category || "General"}
                                    </span>
                                </div>

                                {/* Details Panel */}
                                <div className="p-6 text-left bg-white dark:bg-[#0c0c0c]">
                                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedGalleryItem.title}
                                    </h3>
                                    <p className="text-xs font-mono text-gray-500 mt-2">
                                        Media asset loaded from secure database.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}