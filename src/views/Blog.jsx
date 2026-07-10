import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Calendar, Eye, ArrowLeft, BookOpen, X } from "lucide-react";

export default function BlogView() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlog, setSelectedBlog] = useState(null);

  // States for search and categories
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      if (res.ok) {
        setBlogs(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReadBlog = async (blogId) => {
    try {
      const res = await fetch(`/api/blogs/${blogId}`);
      if (res.ok) {
        const fullBlog = await res.json();
        setSelectedBlog(fullBlog);
        // Increment local view count for realism
        setBlogs((prev) =>
          prev.map((b) => (b.id === blogId ? { ...b, views: b.views + 1 } : b))
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ["All", "Development", "Databases", "IoT", "Systems"];

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || b.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white pt-28 pb-16 overflow-hidden transition-colors duration-300">
      
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[120px] bg-pulse-glow" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col gap-10">
        
        {/* If a Blog is selected, render Article Reading Mode */}
        {selectedBlog ? (
          <motion.article
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto w-full text-left flex flex-col gap-8"
          >
            {/* Back button */}
            <button
              onClick={() => setSelectedBlog(null)}
              className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-gold-600 dark:text-gold-500 hover:text-gold-700 dark:hover:text-gold-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Articles</span>
            </button>

            {/* Banner */}
            {selectedBlog.image_url && (
              <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl">
                <img src={selectedBlog.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-500 border-b border-gray-200 dark:border-white/5 pb-4">
              <span className="text-gold-600 dark:text-gold-500 uppercase font-bold">{selectedBlog.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {selectedBlog.created_at ? new Date(selectedBlog.created_at).toLocaleDateString() : "Today"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {selectedBlog.views} views
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              {selectedBlog.title}
            </h1>

            {/* Content Rendering block (simplistic parser or clean styles) */}
            <div className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed flex flex-col gap-6 font-sans">
              {selectedBlog.content.split("\n\n").map((para, i) => {
                // If header
                if (para.startsWith("###")) {
                  return (
                    <h3 key={i} className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-4 border-b border-gray-200 dark:border-white/5 pb-2">
                      {para.replace("###", "").trim()}
                    </h3>
                  );
                }
                if (para.startsWith("####")) {
                  return (
                    <h4 key={i} className="font-serif text-lg font-bold text-gold-600 dark:text-gold-400 mt-2">
                      {para.replace("####", "").trim()}
                    </h4>
                  );
                }
                // If code block
                if (para.startsWith("```")) {
                  const cleanedCode = para.replace(/```[a-z]*/, "").replace("```", "").trim();
                  return (
                    <pre key={i} className="p-4 rounded-xl bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 overflow-x-auto text-xs font-mono leading-relaxed text-gold-700 dark:text-gold-300">
                      <code>{cleanedCode}</code>
                    </pre>
                  );
                }
                // If bullet list
                if (para.startsWith("* ") || para.startsWith("1. ")) {
                  return (
                    <ul key={i} className="list-disc pl-5 flex flex-col gap-2 text-gray-700 dark:text-gray-300">
                      {para.split("\n").map((li, index) => (
                        <li key={index}>
                          {li.replace(/^\*\s*/, "").replace(/^\d+\.\s*/, "").trim()}
                        </li>
                      ))}
                    </ul>
                  );
                }
                return <p key={i}>{para}</p>;
              })}
            </div>

            <div className="border-t border-gray-200 dark:border-white/5 pt-6 mt-8 flex justify-between items-center text-xs text-gray-500 font-mono">
              <span>Author: Habtamu Simeneh</span>
              <button
                onClick={() => setSelectedBlog(null)}
                className="text-gold-600 dark:text-gold-500 hover:underline"
              >
                Back to all posts
              </button>
            </div>
          </motion.article>
        ) : (
          /* OTHERWISE RENDER BLOG ARCHIVE LIST */
          <div className="flex flex-col gap-8 w-full">
            
            {/* Header Text */}
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs uppercase font-mono tracking-widest text-gold-600 dark:text-gold-500 font-semibold block mb-2">Systems & Research Insights</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-wide text-gray-900 dark:text-white">
                Developer <span className="text-gold-500">Journal</span>
              </h2>
              <div className="w-16 h-1 bg-gold-500 mx-auto mt-4 rounded" />
            </div>

            {/* Category Filter + Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-4 max-w-4xl mx-auto w-full">
              <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-[10px] font-mono tracking-wider uppercase border transition duration-300 ${
                      activeCategory === cat
                        ? "bg-gold-500 text-black border-gold-500 font-bold shadow-sm"
                        : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-gold-500/40 hover:bg-gold-500/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles by title, category, keywords..."
                  className="w-full pl-11 pr-10 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full focus:outline-none focus:border-gold-500/60 text-xs font-sans text-gray-900 dark:text-white placeholder-gray-500 shadow-sm dark:shadow-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Status Feedback */}
            {(searchQuery || activeCategory !== "All") && (
              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-gold-500/5 border border-gold-500/10 max-w-4xl mx-auto w-full text-xs font-mono">
                <span className="text-gray-600 dark:text-gray-400">
                  Showing <span className="font-bold text-gray-900 dark:text-white">{filteredBlogs.length}</span> {filteredBlogs.length === 1 ? "article" : "articles"} 
                  {searchQuery && <> matching "<span className="font-bold text-gold-600 dark:text-gold-400">{searchQuery}</span>"</>}
                  {activeCategory !== "All" && <> in category "<span className="font-bold text-gold-600 dark:text-gold-400">{activeCategory}</span>"</>}
                </span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="text-gold-600 dark:text-gold-500 hover:underline hover:text-gold-700 dark:hover:text-gold-400 transition"
                >
                  Reset all filters
                </button>
              </div>
            )}

            {/* Blogs List Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full pt-4">
                {[1, 2].map((idx) => (
                  <div key={idx} className="h-64 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-20 text-gray-500 font-mono">
                No articles matches your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full pt-4">
                {filteredBlogs.map((b) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => handleReadBlog(b.id)}
                    className="p-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover-gold-glow cursor-pointer text-left flex flex-col gap-4 group h-full justify-between shadow-sm dark:shadow-none"
                  >
                    <div className="flex flex-col gap-3">
                      {b.image_url && (
                        <div className="aspect-[2/1] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 shrink-0">
                          <img src={b.image_url} alt="" className="w-full h-full object-cover transition duration-500 group-hover:scale-103" />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 uppercase">
                        <span className="text-gold-600 dark:text-gold-500 font-bold">{b.category}</span>
                        <span>•</span>
                        <span>{b.created_at ? new Date(b.created_at).toLocaleDateString() : "Today"}</span>
                      </div>

                      <h4 className="font-serif text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors line-clamp-2">
                        {b.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                        {b.content.replace(/[#*`]/g, "").substring(0, 150)}...
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/5 pt-4 mt-2 text-xs font-mono text-gray-500">
                      <span className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition">
                        Read Article <BookOpen className="w-3.5 h-3.5" />
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        {b.views} views
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
