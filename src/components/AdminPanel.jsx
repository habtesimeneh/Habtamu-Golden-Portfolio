import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderCode,
  Sliders,
  Settings as SettingsIcon,
  BookOpen,
  Mail,
  MessageSquare,
  Image as ImageIcon,
  User as UserIcon,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Check,
  Upload,
  ExternalLink,
  Loader2,
  Lock,
  ArrowLeft,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "./Toast";

export default function AdminPanel({ token, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);

  // States for DB fetched data
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    blogs: 0,
    messages: 0,
    unreadMessages: 0,
    testimonials: 0,
    blogViews: 0,
  });
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [orbitTexts, setOrbitTexts] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [cmsSettings, setCmsSettings] = useState({
    site_name: "",
    site_title: "",
    site_subtitle: "",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    social_github: "",
    social_linkedin: "",
    social_twitter: "",
    profile_image: "",
    resume_url: "",
  });

  // Sub-states for CRUD Modals / Forms
  const [projectForm, setProjectForm] = useState({
    id: null,
    title: "",
    description: "",
    category: "Full-stack",
    image_url: "",
    github_link: "",
    live_link: "",
    featured: false,
  });
  const [skillForm, setSkillForm] = useState({
    id: null,
    name: "",
    category: "Frontend",
    percentage: 85,
  });
  const [certificateForm, setCertificateForm] = useState({
    id: null,
    title: "",
    issuer: "",
    issue_date: "",
    credential_url: "",
    image_url: "",
  });
  const [blogForm, setBlogForm] = useState({
    id: null,
    title: "",
    category: "Development",
    image_url: "",
    content: "",
  });
  const [testimonialForm, setTestimonialForm] = useState({
    id: null,
    client_name: "",
    client_role: "",
    client_company: "",
    feedback: "",
    avatar_url: "",
  });
  const [galleryForm, setGalleryForm] = useState({
    id: null,
    title: "",
    image_url: "",
    category: "General",
  });
  const [orbitTextForm, setOrbitTextForm] = useState({
    id: null,
    text: "",
  });
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    bio: "",
    avatar_url: "",
    about_image: "",
    password: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Load Admin Profile and initial values
  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchDataForTab(activeTab);
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user = await res.json();
        setAdminUser(user);
        setProfileForm({
          name: user.name || "",
          email: user.email || "",
          bio: user.bio || "",
          avatar_url: user.avatar_url || "",
          about_image: user.about_image || "",
          password: "",
        });
      } else {
        toast("Session expired. Please log in again.", "error");
        onLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDataForTab = async (tab) => {
    setLoading(true);
    try {
      if (tab === "projects") {
        const res = await fetch("/api/projects");
        if (res.ok) setProjects(await res.json());
      } else if (tab === "skills") {
        const res = await fetch("/api/skills");
        if (res.ok) setSkills(await res.json());
      } else if (tab === "blogs") {
        const res = await fetch("/api/blogs");
        if (res.ok) setBlogs(await res.json());
      } else if (tab === "messages") {
        const res = await fetch("/api/messages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setMessages(await res.json());
      } else if (tab === "testimonials") {
        const res = await fetch("/api/testimonials");
        if (res.ok) setTestimonials(await res.json());
      } else if (tab === "gallery") {
        const res = await fetch("/api/gallery");
        if (res.ok) setGallery(await res.json());
      } else if (tab === "certificates") {
        const res = await fetch("/api/certificates");
        if (res.ok) setCertificates(await res.json());
      } else if (tab === "orbit-texts") {
        const res = await fetch("/api/orbit-texts");
        if (res.ok) setOrbitTexts(await res.json());
      } else if (tab === "settings") {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setCmsSettings({
            site_name: data.site_name || "",
            site_title: data.site_title || "",
            site_subtitle: data.site_subtitle || "",
            contact_email: data.contact_email || "",
            contact_phone: data.contact_phone || "",
            contact_address: data.contact_address || "",
            social_github: data.social_github || "",
            social_linkedin: data.social_linkedin || "",
            social_twitter: data.social_twitter || "",
            profile_image: data.profile_image || "",
            resume_url: data.resume_url || "",
          });
        }
      }
    } catch (err) {
      toast("Error loading data from SQL Server", "error");
    } finally {
      setLoading(false);
    }
  };

  // Generic File Upload Handler
  const handleFileUpload = async (e, onComplete) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onComplete(data.fileUrl);
        toast("File uploaded securely to MySQL file store", "success");
      } else {
        const err = await res.json();
        toast(err.error || "Upload failed", "error");
      }
    } catch (error) {
      toast("Network error during file upload", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // --- CRUD ACTIONS ---

  // 1. PROJECTS CRUD
  const saveProject = async (e) => {
    e.preventDefault();
    const isEdit = projectForm.id !== null;
    const url = isEdit ? `/api/projects/${projectForm.id}` : "/api/projects";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectForm),
      });

      if (res.ok) {
        toast(isEdit ? "Project updated in database!" : "Project created in database!", "success");
        setProjectForm({
          id: null,
          title: "",
          description: "",
          category: "Full-stack",
          image_url: "",
          github_link: "",
          live_link: "",
          featured: false,
        });
        setEditingId(null);
        fetchDataForTab("projects");
        fetchStats();
      } else {
        toast("Error saving project", "error");
      }
    } catch (err) {
      toast("Request failed", "error");
    }
  };

  const deleteProject = async (id) => {
    if (!confirm("Are you sure you want to delete this project from SQL database?")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast("Project deleted successfully", "success");
        fetchDataForTab("projects");
        fetchStats();
      }
    } catch (err) {
      toast("Deletion failed", "error");
    }
  };

  // 2. SKILLS CRUD
  const saveSkill = async (e) => {
    e.preventDefault();
    const isEdit = skillForm.id !== null;
    const url = isEdit ? `/api/skills/${skillForm.id}` : "/api/skills";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(skillForm),
      });

      if (res.ok) {
        toast(isEdit ? "Skill updated!" : "Skill created!", "success");
        setSkillForm({ id: null, name: "", category: "Frontend", percentage: 85 });
        setEditingId(null);
        fetchDataForTab("skills");
        fetchStats();
      }
    } catch (err) {
      toast("Request failed", "error");
    }
  };

  const deleteSkill = async (id) => {
    if (!confirm("Delete this skill from DB?")) return;
    try {
      const res = await fetch(`/api/skills/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast("Skill deleted", "success");
        fetchDataForTab("skills");
        fetchStats();
      }
    } catch (err) {
      toast("Deletion failed", "error");
    }
  };

  // 3. BLOGS CRUD
  const saveBlog = async (e) => {
    e.preventDefault();
    const isEdit = blogForm.id !== null;
    const url = isEdit ? `/api/blogs/${blogForm.id}` : "/api/blogs";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(blogForm),
      });

      if (res.ok) {
        toast(isEdit ? "Blog updated!" : "Blog published!", "success");
        setBlogForm({ id: null, title: "", category: "Development", image_url: "", content: "" });
        setEditingId(null);
        fetchDataForTab("blogs");
        fetchStats();
      }
    } catch (err) {
      toast("Request failed", "error");
    }
  };

  const deleteBlog = async (id) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast("Blog deleted", "success");
        fetchDataForTab("blogs");
        fetchStats();
      }
    } catch (err) {
      toast("Deletion failed", "error");
    }
  };

  // 4. TESTIMONIALS CRUD
  const saveTestimonial = async (e) => {
    e.preventDefault();
    const isEdit = testimonialForm.id !== null;
    const url = isEdit ? `/api/testimonials/${testimonialForm.id}` : "/api/testimonials";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(testimonialForm),
      });

      if (res.ok) {
        toast(isEdit ? "Testimonial updated!" : "Testimonial saved!", "success");
        setTestimonialForm({
          id: null,
          client_name: "",
          client_role: "",
          client_company: "",
          feedback: "",
          avatar_url: "",
        });
        setEditingId(null);
        fetchDataForTab("testimonials");
        fetchStats();
      }
    } catch (err) {
      toast("Request failed", "error");
    }
  };

  const deleteTestimonial = async (id) => {
    if (!confirm("Delete testimonial?")) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast("Testimonial deleted", "success");
        fetchDataForTab("testimonials");
        fetchStats();
      }
    } catch (err) {
      toast("Deletion failed", "error");
    }
  };

  // 5. GALLERY CRUD
  const saveGallery = async (e) => {
    e.preventDefault();
    const isEdit = galleryForm.id !== null;
    const url = isEdit ? `/api/gallery/${galleryForm.id}` : "/api/gallery";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(galleryForm),
      });

      if (res.ok) {
        toast(isEdit ? "Gallery item updated!" : "Gallery item uploaded to SQL Database!", "success");
        setGalleryForm({ id: null, title: "", image_url: "", category: "General" });
        setEditingId(null);
        fetchDataForTab("gallery");
      }
    } catch (err) {
      toast("Request failed", "error");
    }
  };

  const deleteGallery = async (id) => {
    if (!confirm("Delete this gallery item?")) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast("Gallery item deleted", "success");
        fetchDataForTab("gallery");
      }
    } catch (err) {
      toast("Deletion failed", "error");
    }
  };

  // 5b. CERTIFICATES CRUD
  const saveCertificate = async (e) => {
    e.preventDefault();
    const isEdit = certificateForm.id !== null;
    const url = isEdit ? `/api/certificates/${certificateForm.id}` : "/api/certificates";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(certificateForm),
      });

      if (res.ok) {
        toast(isEdit ? "Certificate updated!" : "Certificate added to database!", "success");
        setCertificateForm({ id: null, title: "", issuer: "", issue_date: "", credential_url: "", image_url: "" });
        setEditingId(null);
        fetchDataForTab("certificates");
        fetchStats();
      }
    } catch (err) {
      toast("Request failed", "error");
    }
  };

  const deleteCertificate = async (id) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    try {
      const res = await fetch(`/api/certificates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast("Certificate deleted successfully", "success");
        fetchDataForTab("certificates");
        fetchStats();
      }
    } catch (err) {
      toast("Deletion failed", "error");
    }
  };

  // 5c. ORBIT TEXTS CRUD
  const saveOrbitText = async (e) => {
    e.preventDefault();
    const isEdit = orbitTextForm.id !== null;
    const url = isEdit ? `/api/orbit-texts/${orbitTextForm.id}` : "/api/orbit-texts";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orbitTextForm),
      });

      if (res.ok) {
        toast(isEdit ? "Orbit text updated!" : "Orbit text added!", "success");
        setOrbitTextForm({ id: null, text: "" });
        setEditingId(null);
        fetchDataForTab("orbit-texts");
      } else {
        toast("Request failed", "error");
      }
    } catch (err) {
      toast("Request failed", "error");
    }
  };

  const deleteOrbitText = async (id) => {
    if (!confirm("Delete this rotating phrase?")) return;
    try {
      const res = await fetch(`/api/orbit-texts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast("Orbit text deleted", "success");
        fetchDataForTab("orbit-texts");
      }
    } catch (err) {
      toast("Deletion failed", "error");
    }
  };

  // 6. MESSAGES MANAGEMENT
  const readMessage = async (msg) => {
    setSelectedMessage(msg);
    if (msg.is_read === 0) {
      try {
        const res = await fetch(`/api/messages/${msg.id}/read`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          fetchDataForTab("messages");
          fetchStats();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm("Delete message from inbox?")) return;
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast("Message deleted from database", "success");
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        fetchDataForTab("messages");
        fetchStats();
      }
    } catch (err) {
      toast("Deletion failed", "error");
    }
  };

  // 7. PROFILE SETTINGS
  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });

      if (res.ok) {
        toast("Profile updated successfully on SQL Server!", "success");
        setProfileForm((prev) => ({ ...prev, password: "" }));
        fetchProfile();
      } else {
        toast("Error updating profile", "error");
      }
    } catch (err) {
      toast("Update failed", "error");
    }
  };

  // 7b. CMS SETTINGS
  const saveCmsSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cmsSettings),
      });

      if (res.ok) {
        toast("CMS Settings updated successfully in database!", "success");
        fetchDataForTab("settings");
      } else {
        toast("Error updating settings", "error");
      }
    } catch (err) {
      toast("Update failed", "error");
    }
  };

  const sidebarItems = [
    { id: "stats", label: "Overview", icon: LayoutDashboard },
    { id: "projects", label: "Projects CRUD", icon: FolderCode },
    { id: "skills", label: "Skills CRUD", icon: Sliders },
    { id: "blogs", label: "Blogs CRUD", icon: BookOpen },
    { id: "messages", label: "Messages Inbox", icon: Mail },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare },
    { id: "gallery", label: "Media Gallery", icon: ImageIcon },
    { id: "settings", label: "CMS Settings", icon: SettingsIcon },
    { id: "certificates", label: "Certificates CRUD", icon: Award },
    { id: "orbit-texts", label: "Orbit Texts CRUD", icon: Sliders },
    { id: "profile", label: "Admin Profile", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#070707] text-gray-900 dark:text-white pt-24 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-gold-500/10 rounded-xl p-5 sticky top-28 flex flex-col gap-6 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gold-500/10">
              <div className="w-10 h-10 rounded-full border border-gold-500/30 overflow-hidden shrink-0">
                <img
                  src={adminUser?.avatar_url || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold tracking-wide text-gray-900 dark:text-white">
                  {adminUser?.name || "Habtamu Simeneh"}
                </h4>
                <p className="text-xs font-mono text-gold-600 dark:text-gold-500/70">Administrator</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setEditingId(null);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 text-left ${
                      isActive
                        ? "bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-500 font-bold"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-gold-600 dark:text-gold-500" : "text-gray-400"}`} />
                    <span>{item.label}</span>
                    {item.id === "messages" && stats.unreadMessages > 0 && (
                      <span className="ml-auto bg-gold-500 text-black font-sans font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                        {stats.unreadMessages}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-gray-200 dark:border-gold-500/10 pt-4 flex flex-col gap-2">
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-mono tracking-wider uppercase border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                View Website
              </button>
              <button
                onClick={onLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-red-100 dark:bg-red-950/20 hover:bg-red-200 dark:hover:bg-red-950/35 text-xs font-mono tracking-wider uppercase border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 transition"
              >
                <Lock className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Dynamic Tab Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-gold-500/10 rounded-xl p-6 lg:p-8 min-h-[500px] shadow-sm dark:shadow-none">
            {loading && activeTab !== "stats" ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                <p className="text-sm font-mono text-gray-500 tracking-wider">Syncing with SQLite Relational Database...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  
                   {/* TAB 1: OVERVIEW STATS */}
                  {activeTab === "stats" && (
                    <div className="flex flex-col gap-8">
                      <div>
                        <h2 className="font-serif text-2xl lg:text-3xl font-bold tracking-wide text-gray-900 dark:text-white">
                          Control Center Overview
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
                          Relational SQLite Engine is live. Data synced securely.
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-1.5 relative overflow-hidden group hover:border-gold-500/30 shadow-sm dark:shadow-none transition-all duration-300">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Projects</span>
                          <span className="text-3xl font-serif font-bold text-gold-600 dark:text-gold-500">{stats.projects}</span>
                          <FolderCode className="w-12 h-12 text-gold-500/25 group-hover:text-gold-500/45 absolute bottom-2 right-2 group-hover:scale-110 transition-all duration-300" />
                        </div>
                        <div className="p-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-1.5 relative overflow-hidden group hover:border-gold-500/30 shadow-sm dark:shadow-none transition-all duration-300">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest">Mastered Skills</span>
                          <span className="text-3xl font-serif font-bold text-gold-600 dark:text-gold-500">{stats.skills}</span>
                          <Sliders className="w-12 h-12 text-gold-500/25 group-hover:text-gold-500/45 absolute bottom-2 right-2 group-hover:scale-110 transition-all duration-300" />
                        </div>
                        <div className="p-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-1.5 relative overflow-hidden group hover:border-gold-500/30 shadow-sm dark:shadow-none transition-all duration-300">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest">Blogs Published</span>
                          <span className="text-3xl font-serif font-bold text-gold-600 dark:text-gold-500">{stats.blogs}</span>
                          <BookOpen className="w-12 h-12 text-gold-500/25 group-hover:text-gold-500/45 absolute bottom-2 right-2 group-hover:scale-110 transition-all duration-300" />
                        </div>
                        <div className="p-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-1.5 relative overflow-hidden group hover:border-gold-500/30 shadow-sm dark:shadow-none transition-all duration-300">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Messages</span>
                          <span className="text-3xl font-serif font-bold text-gold-600 dark:text-gold-500">{stats.messages}</span>
                          {stats.unreadMessages > 0 && (
                            <span className="absolute top-4 right-4 bg-gold-500 text-black text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded uppercase">
                              {stats.unreadMessages} Unread
                            </span>
                          )}
                          <Mail className="w-12 h-12 text-gold-500/25 group-hover:text-gold-500/45 absolute bottom-2 right-2 group-hover:scale-110 transition-all duration-300" />
                        </div>
                        <div className="p-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-1.5 relative overflow-hidden group hover:border-gold-500/30 shadow-sm dark:shadow-none transition-all duration-300">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest">Blog views</span>
                          <span className="text-3xl font-serif font-bold text-gold-600 dark:text-gold-500">{stats.blogViews}</span>
                          <Eye className="w-12 h-12 text-gold-500/25 group-hover:text-gold-500/45 absolute bottom-2 right-2 group-hover:scale-110 transition-all duration-300" />
                        </div>
                        <div className="p-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-1.5 relative overflow-hidden group hover:border-gold-500/30 shadow-sm dark:shadow-none transition-all duration-300">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest">Testimonials</span>
                          <span className="text-3xl font-serif font-bold text-gold-600 dark:text-gold-500">{stats.testimonials}</span>
                          <MessageSquare className="w-12 h-12 text-gold-500/25 group-hover:text-gold-500/45 absolute bottom-2 right-2 group-hover:scale-110 transition-all duration-300" />
                        </div>
                      </div>

                      {/* Embedded Setup Details Block */}
                      <div className="p-6 rounded-xl bg-gold-500/5 border border-gold-500/10 flex flex-col gap-3">
                        <h4 className="text-sm font-mono tracking-wider uppercase text-gold-600 dark:text-gold-500 font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4" /> Relational SQL Engine Status
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          Your server-side database contains actual structured tables with complete primary key mappings and automated relational queries. All actions performed below write back to the file system instantly and persist across server reboots.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PROJECTS CRUD */}
                  {activeTab === "projects" && (
                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">Projects Database Management</h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">CREATE, READ, UPDATE & DELETE PROJECTS</p>
                        </div>
                        {editingId === null && (
                          <button
                            onClick={() => setEditingId(-1)}
                            className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold text-xs rounded uppercase font-mono tracking-wider flex items-center gap-1.5 transition"
                          >
                            <Plus className="w-4 h-4" /> Add New Project
                          </button>
                        )}
                      </div>

                      {/* FORM STATE */}
                      {editingId !== null && (
                        <form onSubmit={saveProject} className="p-6 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-4 shadow-sm dark:shadow-none">
                          <h3 className="font-serif text-lg font-semibold text-gold-600 dark:text-gold-400 border-b border-gray-200 dark:border-white/5 pb-2">
                            {projectForm.id ? "Edit Relational Project" : "Insert Relational Project"}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Project Title *</label>
                              <input
                                type="text"
                                required
                                value={projectForm.title}
                                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="e.g. Ethio-E-Commerce Hub"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Category *</label>
                              <select
                                value={projectForm.category}
                                onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              >
                                <option value="Full-stack">Full-stack (Web)</option>
                                <option value="Front-end">Front-end (Web)</option>
                                <option value="Back-end">Back-end (Web)</option>
                                <option value="Mobile">Mobile</option>
                                <option value="Design">Design</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Description *</label>
                            <textarea
                              rows={4}
                              required
                              value={projectForm.description}
                              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                              className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              placeholder="Describe project tech stack, schema details, or problems solved..."
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">GitHub Repository Link</label>
                              <input
                                type="url"
                                value={projectForm.github_link}
                                onChange={(e) => setProjectForm({ ...projectForm, github_link: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="https://github.com/..."
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Live Demo Link</label>
                              <input
                                type="url"
                                value={projectForm.live_link}
                                onChange={(e) => setProjectForm({ ...projectForm, live_link: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="https://..."
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Image URL / File Upload</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={projectForm.image_url}
                                  onChange={(e) => setProjectForm({ ...projectForm, image_url: e.target.value })}
                                  className="flex-1 px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                  placeholder="https://images.unsplash.com/..."
                                />
                                <label className="cursor-pointer px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded border border-gray-300 dark:border-white/10 flex items-center justify-center text-gold-600 dark:text-gold-500 transition shrink-0">
                                  {isUploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Upload className="w-4 h-4" />
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, (url) => setProjectForm({ ...projectForm, image_url: url }))}
                                  />
                                </label>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 pt-6 pl-2">
                              <input
                                type="checkbox"
                                id="featured"
                                checked={projectForm.featured}
                                onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                                className="w-4 h-4 rounded border-gray-300 dark:border-white/10 text-gold-600 dark:text-gold-500 bg-white dark:bg-black focus:ring-0 focus:ring-offset-0"
                              />
                              <label htmlFor="featured" className="text-sm font-medium tracking-wide text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                                Feature this project on Home page
                              </label>
                            </div>
                          </div>

                          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                  setProjectForm({
                                    id: null,
                                    title: "",
                                    description: "",
                                    category: "Full-stack",
                                    image_url: "",
                                    github_link: "",
                                    live_link: "",
                                    featured: false,
                                  });
                              }}
                              className="px-4 py-2 rounded border border-gray-300 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-mono tracking-wider uppercase"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded bg-gold-500 text-black hover:bg-gold-600 font-semibold text-xs font-mono tracking-wider uppercase"
                            >
                              Save to DB
                            </button>
                          </div>
                        </form>
                      )}

                      {/* PROJECTS LIST */}
                      <div className="flex flex-col gap-4">
                        {projects.length === 0 ? (
                          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 dark:border-white/10 rounded-xl font-mono">
                            No projects found in database.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {projects.map((proj) => (
                              <div
                                key={proj.id}
                                className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm dark:shadow-none"
                              >
                                <div className="flex items-center gap-4">
                                  {proj.image_url && (
                                    <div className="w-16 h-16 rounded overflow-hidden border border-gray-200 dark:border-white/10 shrink-0">
                                      <img src={proj.image_url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-serif font-bold text-gray-900 dark:text-white text-base">
                                      {proj.title}
                                      {proj.featured === 1 && (
                                        <span className="ml-2 px-1.5 py-0.5 rounded bg-gold-500/10 border border-gold-500/30 text-[9px] font-mono uppercase text-gold-600 dark:text-gold-500">
                                          Featured
                                        </span>
                                      )}
                                    </h4>
                                    <p className="text-xs text-gold-600 dark:text-gold-500/70 font-mono uppercase mt-0.5">{proj.category}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1 max-w-lg">{proj.description}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto justify-end">
                                  <button
                                    onClick={() => {
                                      setProjectForm({
                                        id: proj.id,
                                        title: proj.title,
                                        description: proj.description,
                                        category: proj.category,
                                        image_url: proj.image_url || "",
                                        github_link: proj.github_link || "",
                                        live_link: proj.live_link || "",
                                        featured: proj.featured === 1,
                                      });
                                      setEditingId(proj.id);
                                    }}
                                    className="p-2 rounded bg-gray-100 dark:bg-white/5 hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-500 border border-gray-200 dark:border-white/10 transition text-gray-500 dark:text-gray-400"
                                    title="Edit Project"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteProject(proj.id)}
                                    className="p-2 rounded bg-gray-100 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-gray-200 dark:border-white/10 transition text-gray-500 dark:text-gray-400"
                                    title="Delete Project"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SKILLS CRUD */}
                  {activeTab === "skills" && (
                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">Skills Matrix Management</h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">MANAGE SKILLS AND PROGRESS BAR METRICS</p>
                        </div>
                        {editingId === null && (
                          <button
                            onClick={() => setEditingId(-1)}
                            className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold text-xs rounded uppercase font-mono tracking-wider flex items-center gap-1.5 transition"
                          >
                            <Plus className="w-4 h-4" /> Add Skill
                          </button>
                        )}
                      </div>

                      {/* FORM STATE */}
                      {editingId !== null && (
                        <form onSubmit={saveSkill} className="p-6 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-4 shadow-sm dark:shadow-none">
                          <h3 className="font-serif text-lg font-semibold text-gold-600 dark:text-gold-400 border-b border-gray-200 dark:border-white/5 pb-2">
                            {skillForm.id ? "Edit Relational Skill" : "Insert Relational Skill"}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Skill Name *</label>
                              <input
                                type="text"
                                required
                                value={skillForm.name}
                                onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="e.g. Node.js"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Category *</label>
                              <select
                                value={skillForm.category}
                                onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              >
                                <option value="Frontend">Frontend</option>
                                <option value="Backend">Backend</option>
                                <option value="Database">Database</option>
                                <option value="Tools">Tools / DevOps</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Proficiency Percentage (0-100) *</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                required
                                value={skillForm.percentage}
                                onChange={(e) => setSkillForm({ ...skillForm, percentage: Number(e.target.value) })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setSkillForm({ id: null, name: "", category: "Frontend", percentage: 85 });
                              }}
                              className="px-4 py-2 rounded border border-gray-300 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-mono tracking-wider uppercase"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded bg-gold-500 text-black hover:bg-gold-600 font-semibold text-xs font-mono tracking-wider uppercase"
                            >
                              Save Skill
                            </button>
                          </div>
                        </form>
                      )}

                      {/* LIST SKILLS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {skills.map((sk) => (
                          <div
                            key={sk.id}
                            className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-between shadow-sm dark:shadow-none"
                          >
                            <div className="flex-1 mr-4">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-sans font-semibold text-sm text-gray-900 dark:text-white">{sk.name}</span>
                                <span className="text-xs text-gold-600 dark:text-gold-500 font-mono font-bold">{sk.percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-gold-500 h-full" style={{ width: `${sk.percentage}%` }} />
                              </div>
                              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 dark:text-gray-400 block mt-1.5">
                                {sk.category}
                              </span>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setSkillForm({
                                    id: sk.id,
                                    name: sk.name,
                                    category: sk.category,
                                    percentage: sk.percentage,
                                  });
                                  setEditingId(sk.id);
                                }}
                                className="p-1.5 rounded bg-gray-100 dark:bg-white/5 hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-500 border border-gray-200 dark:border-white/10 transition text-gray-500 dark:text-gray-400"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteSkill(sk.id)}
                                className="p-1.5 rounded bg-gray-100 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-gray-200 dark:border-white/10 transition text-gray-500 dark:text-gray-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: BLOGS CRUD */}
                  {activeTab === "blogs" && (
                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">Relational Blog Engine</h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">MANAGE RESEARCH PAPERS & ARTICLES</p>
                        </div>
                        {editingId === null && (
                          <button
                            onClick={() => setEditingId(-1)}
                            className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold text-xs rounded uppercase font-mono tracking-wider flex items-center gap-1.5 transition"
                          >
                            <Plus className="w-4 h-4" /> Add Blog Post
                          </button>
                        )}
                      </div>

                      {/* FORM STATE */}
                      {editingId !== null && (
                        <form onSubmit={saveBlog} className="p-6 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-4 shadow-sm dark:shadow-none">
                          <h3 className="font-serif text-lg font-semibold text-gold-600 dark:text-gold-400 border-b border-gray-200 dark:border-white/5 pb-2">
                            {blogForm.id ? "Edit Blog Post" : "Draft New Blog Post"}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Blog Title *</label>
                              <input
                                type="text"
                                required
                                value={blogForm.title}
                                onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="e.g. Secure Integrations in Node.js"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Category *</label>
                              <select
                                value={blogForm.category}
                                onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              >
                                <option value="Development">Development</option>
                                <option value="Databases">Databases</option>
                                <option value="IoT">Agri IoT & Electronics</option>
                                <option value="Systems">System Architecture</option>
                                <option value="General">Academic & Research</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Blog Banner Image URL</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={blogForm.image_url}
                                onChange={(e) => setBlogForm({ ...blogForm, image_url: e.target.value })}
                                className="flex-1 px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="https://images.unsplash.com/..."
                              />
                              <label className="cursor-pointer px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded border border-gray-300 dark:border-white/10 flex items-center justify-center text-gold-600 dark:text-gold-500 transition shrink-0">
                                {isUploading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Upload className="w-4 h-4" />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e, (url) => setBlogForm({ ...blogForm, image_url: url }))}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 dark:text-gray-400 font-mono flex justify-between">
                              <span>Post Content (Markdown supported) *</span>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">Headers, blockquotes, lists enabled</span>
                            </label>
                            <textarea
                              rows={10}
                              required
                              value={blogForm.content}
                              onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                              className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white font-mono leading-relaxed"
                              placeholder="Type in markdown format..."
                            />
                          </div>

                          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setBlogForm({ id: null, title: "", category: "Development", image_url: "", content: "" });
                              }}
                              className="px-4 py-2 rounded border border-gray-300 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-mono tracking-wider uppercase"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded bg-gold-500 text-black hover:bg-gold-600 font-semibold text-xs font-mono tracking-wider uppercase"
                            >
                              Publish
                            </button>
                          </div>
                        </form>
                      )}

                      {/* BLOGS LIST */}
                      <div className="flex flex-col gap-4">
                        {blogs.length === 0 ? (
                          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 dark:border-white/10 rounded-xl font-mono">
                            No blog posts drafted in database.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {blogs.map((b) => (
                              <div
                                key={b.id}
                                className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm dark:shadow-none"
                              >
                                <div className="flex items-center gap-4">
                                  {b.image_url && (
                                    <div className="w-16 h-12 rounded overflow-hidden border border-gray-200 dark:border-white/10 shrink-0">
                                      <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-serif font-bold text-gray-900 dark:text-white text-base leading-tight">
                                      {b.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                                      <span className="text-gold-600 dark:text-gold-500">{b.category}</span>
                                      <span>•</span>
                                      <span>{b.views} views</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto justify-end">
                                  <button
                                    onClick={() => {
                                      setBlogForm({
                                        id: b.id,
                                        title: b.title,
                                        category: b.category,
                                        image_url: b.image_url || "",
                                        content: b.content,
                                      });
                                      setEditingId(b.id);
                                    }}
                                    className="p-2 rounded bg-gray-100 dark:bg-white/5 hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-500 border border-gray-200 dark:border-white/10 transition text-gray-500 dark:text-gray-400"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteBlog(b.id)}
                                    className="p-2 rounded bg-gray-100 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-gray-200 dark:border-white/10 transition text-gray-500 dark:text-gray-400"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: MESSAGES INBOX */}
                  {activeTab === "messages" && (
                    <div className="flex flex-col gap-6">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">Contact Messages Inbox</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">READ AND ARCHIVE RECRUITER SUBMISSIONS</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* Inbox List */}
                        <div className="md:col-span-5 flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                          {messages.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 dark:border-white/10 rounded-xl font-mono">
                              Inbox is empty.
                            </div>
                          ) : (
                            messages.map((m) => (
                              <button
                                key={m.id}
                                onClick={() => readMessage(m)}
                                className={`p-4 rounded-xl text-left border transition-all flex flex-col gap-1 relative w-full ${
                                  selectedMessage?.id === m.id
                                    ? "bg-gold-500/10 border-gold-500/40 text-gray-900 dark:text-white"
                                    : m.is_read === 0
                                    ? "bg-gold-500/5 dark:bg-white/10 border-gold-500/20 hover:bg-gold-500/10 dark:hover:bg-white/15 text-gray-900 dark:text-white"
                                    : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {m.is_read === 0 && (
                                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gold-500" />
                                )}
                                <div className="flex items-center justify-between pr-4">
                                  <span className="font-semibold text-sm truncate max-w-[120px]">
                                    {m.sender_name}
                                  </span>
                                  <span className="text-[10px] font-mono text-gray-500">
                                    {m.created_at ? new Date(m.created_at).toLocaleDateString() : ""}
                                  </span>
                                </div>
                                <span className="text-xs font-mono font-medium truncate text-gold-600 dark:text-gold-500/80">
                                  {m.subject || "No Subject"}
                                </span>
                                <p className="text-xs line-clamp-1 text-gray-500 dark:text-gray-400">{m.message}</p>
                              </button>
                            ))
                          )}
                        </div>

                        {/* Message Reader Details */}
                        <div className="md:col-span-7">
                          {selectedMessage ? (
                            <div className="p-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-4 relative shadow-sm dark:shadow-none">
                              <button
                                onClick={() => deleteMessage(selectedMessage.id)}
                                className="absolute top-4 right-4 p-2 rounded bg-gray-100 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 transition"
                                title="Delete Message"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              
                              <div>
                                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white mb-1">
                                  {selectedMessage.subject || "No Subject"}
                                </h3>
                                <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400 gap-1 font-mono">
                                  <span>From: <strong className="text-gray-900 dark:text-white">{selectedMessage.sender_name}</strong> ({selectedMessage.sender_email})</span>
                                  <span>Sent: {selectedMessage.created_at ? new Date(selectedMessage.created_at).toLocaleString() : ""}</span>
                                </div>
                              </div>

                              <div className="border-t border-gray-200 dark:border-white/5 pt-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                  {selectedMessage.message}
                                </p>
                              </div>

                              <div className="pt-4 border-t border-gray-200 dark:border-white/5 mt-4 flex justify-end">
                                <a
                                  href={`mailto:${selectedMessage.sender_email}?subject=RE: ${selectedMessage.subject || "Portfolio Contact"}`}
                                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold text-xs rounded uppercase font-mono tracking-wider transition"
                                >
                                  Reply via Email
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="h-[250px] flex items-center justify-center text-center text-gray-500 border border-dashed border-gray-200 dark:border-white/10 rounded-xl font-mono">
                              Select a message from the list to read details
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 6: TESTIMONIALS CRUD */}
                  {activeTab === "testimonials" && (
                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">Testimonials Management</h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">MANAGE CLIENT REVIEWS AND RECRUITER VERIFICATIONS</p>
                        </div>
                        {editingId === null && (
                          <button
                            onClick={() => setEditingId(-1)}
                            className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold text-xs rounded uppercase font-mono tracking-wider flex items-center gap-1.5 transition"
                          >
                            <Plus className="w-4 h-4" /> Add Testimonial
                          </button>
                        )}
                      </div>

                      {/* FORM STATE */}
                      {editingId !== null && (
                        <form onSubmit={saveTestimonial} className="p-6 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-4 shadow-sm dark:shadow-none">
                          <h3 className="font-serif text-lg font-semibold text-gold-600 dark:text-gold-400 border-b border-gray-200 dark:border-white/5 pb-2">
                            {testimonialForm.id ? "Edit Testimonial" : "Insert Testimonial"}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Client Name *</label>
                              <input
                                type="text"
                                required
                                value={testimonialForm.client_name}
                                onChange={(e) => setTestimonialForm({ ...testimonialForm, client_name: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="Dawit Abebe"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Client Role *</label>
                              <input
                                type="text"
                                required
                                value={testimonialForm.client_role}
                                onChange={(e) => setTestimonialForm({ ...testimonialForm, client_role: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="Engineering Lead"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Company Name</label>
                              <input
                                type="text"
                                value={testimonialForm.client_company}
                                onChange={(e) => setTestimonialForm({ ...testimonialForm, client_company: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="AgriTech Solutions"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Client Avatar URL</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={testimonialForm.avatar_url}
                                onChange={(e) => setTestimonialForm({ ...testimonialForm, avatar_url: e.target.value })}
                                className="flex-1 px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="https://images.unsplash.com/..."
                              />
                              <label className="cursor-pointer px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded border border-gray-300 dark:border-white/10 flex items-center justify-center text-gold-600 dark:text-gold-500 transition shrink-0">
                                {isUploading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Upload className="w-4 h-4" />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e, (url) => setTestimonialForm({ ...testimonialForm, avatar_url: url }))}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Client Feedback *</label>
                            <textarea
                              rows={3}
                              required
                              value={testimonialForm.feedback}
                              onChange={(e) => setTestimonialForm({ ...testimonialForm, feedback: e.target.value })}
                              className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              placeholder="Review text..."
                            />
                          </div>

                          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setTestimonialForm({
                                  id: null,
                                  client_name: "",
                                  client_role: "",
                                  client_company: "",
                                  feedback: "",
                                  avatar_url: "",
                                });
                              }}
                              className="px-4 py-2 rounded border border-gray-300 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-mono tracking-wider uppercase"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded bg-gold-500 text-black hover:bg-gold-600 font-semibold text-xs font-mono tracking-wider uppercase"
                            >
                              Save Review
                            </button>
                          </div>
                        </form>
                      )}

                      {/* LISTINGS */}
                      <div className="grid grid-cols-1 gap-4">
                        {testimonials.length === 0 ? (
                          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 dark:border-white/10 rounded-xl font-mono">
                            No client testimonials found.
                          </div>
                        ) : (
                          testimonials.map((t) => (
                            <div
                              key={t.id}
                              className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-between gap-4 shadow-sm dark:shadow-none"
                            >
                              <div className="flex items-center gap-4">
                                {t.avatar_url && (
                                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 shrink-0">
                                    <img src={t.avatar_url} alt="" className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-sans font-semibold text-sm text-gray-900 dark:text-white">{t.client_name}</h4>
                                  <p className="text-xs text-gold-600 dark:text-gold-500 font-mono">
                                    {t.client_role} {t.client_company ? `at ${t.client_company}` : ""}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic line-clamp-1">"{t.feedback}"</p>
                                </div>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={() => {
                                    setTestimonialForm({
                                      id: t.id,
                                      client_name: t.client_name,
                                      client_role: t.client_role,
                                      client_company: t.client_company || "",
                                      feedback: t.feedback,
                                      avatar_url: t.avatar_url || "",
                                    });
                                    setEditingId(t.id);
                                  }}
                                  className="p-1.5 rounded bg-gray-100 dark:bg-white/5 hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-500 border border-gray-200 dark:border-white/10 transition text-gray-500 dark:text-gray-400"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteTestimonial(t.id)}
                                  className="p-1.5 rounded bg-gray-100 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-gray-200 dark:border-white/10 transition text-gray-500 dark:text-gray-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 7: GALLERY */}
                  {activeTab === "gallery" && (
                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">Media Assets Gallery</h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">MANAGE GLOBAL IMAGES AND UPLOADS</p>
                        </div>
                        {editingId === null && (
                          <button
                            onClick={() => setEditingId(-1)}
                            className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold text-xs rounded uppercase font-mono tracking-wider flex items-center gap-1.5 transition"
                          >
                            <Plus className="w-4 h-4" /> Upload Media
                          </button>
                        )}
                      </div>

                      {/* UPLOAD FORM */}
                      {editingId !== null && (
                        <form onSubmit={saveGallery} className="p-6 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-4 shadow-sm dark:shadow-none">
                          <h3 className="font-serif text-lg font-semibold text-gold-600 dark:text-gold-400 border-b border-gray-200 dark:border-white/5 pb-2">
                            Add Asset to Gallery
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Title *</label>
                              <input
                                type="text"
                                required
                                value={galleryForm.title}
                                onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="Asset description"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Category *</label>
                              <select
                                required
                                value={galleryForm.category}
                                onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              >
                                <option value="General">General</option>
                                <option value="Certificates">Certificates</option>
                                <option value="Profile">Profile</option>
                                <option value="Projects">Projects</option>
                                <option value="Designs">Designs</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Upload Image *</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                required
                                value={galleryForm.image_url}
                                onChange={(e) => setGalleryForm({ ...galleryForm, image_url: e.target.value })}
                                className="flex-1 px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="Image URL or choose file below"
                              />
                              <label className="cursor-pointer px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded border border-gray-300 dark:border-white/10 flex items-center justify-center text-gold-600 dark:text-gold-500 transition shrink-0">
                                {isUploading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Upload className="w-4 h-4" />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e, (url) => setGalleryForm({ ...galleryForm, image_url: url }))}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setGalleryForm({ id: null, title: "", image_url: "", category: "General" });
                              }}
                              className="px-4 py-2 rounded border border-gray-300 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-mono tracking-wider uppercase"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded bg-gold-500 text-black hover:bg-gold-600 font-semibold text-xs font-mono tracking-wider uppercase"
                            >
                              Add Asset
                            </button>
                          </div>
                        </form>
                      )}

                      {/* GRID GALLERY LIST */}
                      {gallery.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 dark:border-white/10 rounded-xl font-mono">
                          No images uploaded in your media library.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {gallery.map((g) => (
                            <div
                              key={g.id}
                              className="rounded-lg overflow-hidden bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 group relative aspect-video shadow-sm"
                            >
                              <img src={g.image_url} alt="" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="font-sans text-xs font-semibold text-white truncate">{g.title}</span>
                                <span className="text-[9px] font-mono text-gold-400 uppercase mt-0.5">{g.category}</span>
                                <div className="flex justify-between items-center mt-2 border-t border-white/10 pt-1.5">
                                  <a
                                    href={g.image_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-mono text-gray-400 hover:text-white flex items-center gap-0.5"
                                  >
                                    URL <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <button
                                    onClick={() => deleteGallery(g.id)}
                                    className="text-[10px] font-mono text-red-400 hover:text-red-300"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 8: PROFILE EDIT */}
                  {activeTab === "profile" && (
                    <div className="flex flex-col gap-6">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">Administrator Credentials & Profile</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">UPDATE PROFILE BIOGRAPHY AND SECURITY PASSWORDS</p>
                      </div>

                      <form onSubmit={saveProfile} className="flex flex-col gap-5 p-6 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Full Name</label>
                            <input
                              type="text"
                              required
                              value={profileForm.name}
                              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                              className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Contact Email</label>
                            <input
                              type="email"
                              required
                              value={profileForm.email}
                              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                              className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Short Biography</label>
                          <textarea
                            rows={3}
                            required
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                            className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Homepage Profile Image</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={profileForm.avatar_url}
                                onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                                className="flex-1 px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              />
                              <label className="cursor-pointer px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded border border-gray-300 dark:border-white/10 flex items-center justify-center text-gold-600 dark:text-gold-500 transition shrink-0">
                                {isUploading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Upload className="w-4 h-4" />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e, (url) => setProfileForm({ ...profileForm, avatar_url: url }))}
                                />
                              </label>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">About Page Image</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={profileForm.about_image}
                                onChange={(e) => setProfileForm({ ...profileForm, about_image: e.target.value })}
                                className="flex-1 px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              />
                              <label className="cursor-pointer px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded border border-gray-300 dark:border-white/10 flex items-center justify-center text-gold-600 dark:text-gold-500 transition shrink-0">
                                {isUploading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Upload className="w-4 h-4" />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e, (url) => setProfileForm({ ...profileForm, about_image: url }))}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                              Change Password (leave blank to keep current)
                            </label>
                            <input
                              type="password"
                              value={profileForm.password}
                              onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                              className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-gold-500/20 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600"
                              placeholder="••••••••••••"
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-white/5 flex justify-end">
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-gold-500 text-black font-semibold text-xs rounded uppercase font-mono tracking-wider hover:bg-gold-600 transition"
                          >
                            Update Profile settings
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* TAB 9: CERTIFICATES CRUD */}
                  {activeTab === "certificates" && (
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-center gap-4 flex-wrap">
                        <div>
                          <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">Academic & Professional Certificates</h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">MANAGE VERIFIED CREDENTIALS AND EXTERNAL VALIDATION LINKS</p>
                        </div>
                        {editingId === null && (
                          <button
                            onClick={() => {
                              setEditingId(-1);
                              setCertificateForm({
                                id: null,
                                title: "",
                                issuer: "",
                                issue_date: "",
                                credential_url: "",
                                image_url: "",
                              });
                            }}
                            className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold text-xs rounded uppercase font-mono tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" /> Add Certificate
                          </button>
                        )}
                      </div>

                      {editingId !== null && (
                        <form onSubmit={saveCertificate} className="p-6 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-4 shadow-sm dark:shadow-none">
                          <h3 className="font-serif text-lg font-semibold text-gold-600 dark:text-gold-400 border-b border-gray-200 dark:border-white/5 pb-2">
                            {certificateForm.id ? "Edit Certificate Entry" : "Register Certificate Entry"}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Certificate Title *</label>
                              <input
                                type="text"
                                required
                                value={certificateForm.title}
                                onChange={(e) => setCertificateForm({ ...certificateForm, title: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="Database Management Systems Certification"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Issuing Authority *</label>
                              <input
                                type="text"
                                required
                                value={certificateForm.issuer}
                                onChange={(e) => setCertificateForm({ ...certificateForm, issuer: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="Oracle Academy / Injibara University"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Date of Issue *</label>
                              <input
                                type="text"
                                required
                                value={certificateForm.issue_date}
                                onChange={(e) => setCertificateForm({ ...certificateForm, issue_date: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="2024"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">External verification Link (credential_url) *</label>
                              <input
                                type="url"
                                required
                                value={certificateForm.credential_url}
                                onChange={(e) => setCertificateForm({ ...certificateForm, credential_url: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="https://academy.oracle.com"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Certificate Image Preview URL</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={certificateForm.image_url}
                                onChange={(e) => setCertificateForm({ ...certificateForm, image_url: e.target.value })}
                                className="flex-1 px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                placeholder="https://images.unsplash.com/..."
                              />
                              <label className="cursor-pointer px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded border border-gray-300 dark:border-white/10 flex items-center justify-center text-gold-600 dark:text-gold-500 transition shrink-0">
                                {isUploading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Upload className="w-4 h-4" />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e, (url) => setCertificateForm({ ...certificateForm, image_url: url }))}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setCertificateForm({
                                  id: null,
                                  title: "",
                                  issuer: "",
                                  issue_date: "",
                                  credential_url: "",
                                  image_url: "",
                                });
                              }}
                              className="px-4 py-2 rounded border border-gray-300 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-mono tracking-wider uppercase cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 rounded bg-gold-500 hover:bg-gold-600 text-black font-semibold text-xs uppercase font-mono tracking-wider cursor-pointer"
                            >
                              {certificateForm.id ? "Update Entry" : "Save Entry"}
                            </button>
                          </div>
                        </form>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {certificates.map((cert) => (
                          <div key={cert.id} className="p-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-4 relative overflow-hidden group">
                            {cert.image_url && (
                              <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-white/5 bg-gray-200 dark:bg-white/5">
                                <img src={cert.image_url} alt={cert.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                              </div>
                            )}
                            <div>
                              <span className="text-[10px] font-mono tracking-widest uppercase text-gold-600 dark:text-gold-500 font-bold">
                                {cert.issuer} ({cert.issue_date})
                              </span>
                              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mt-1 leading-snug">
                                {cert.title}
                              </h3>
                              {cert.credential_url && (
                                <p className="text-xs text-gray-500 font-mono mt-1 break-all flex items-center gap-1">
                                  <span>Link:</span>
                                  <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:underline">
                                    {cert.credential_url}
                                  </a>
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 justify-end mt-auto pt-2 border-t border-gray-100 dark:border-white/5">
                              <button
                                onClick={() => {
                                  setCertificateForm({
                                    id: cert.id,
                                    title: cert.title,
                                    issuer: cert.issuer,
                                    issue_date: cert.issue_date,
                                    credential_url: cert.credential_url || "",
                                    image_url: cert.image_url || "",
                                  });
                                  setEditingId(cert.id);
                                }}
                                className="p-2 rounded bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
                                title="Edit Entry"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteCertificate(cert.id)}
                                className="p-2 rounded bg-red-100 dark:bg-red-950/20 hover:bg-red-200 dark:hover:bg-red-950/35 text-red-600 dark:text-red-400 transition cursor-pointer"
                                title="Delete Entry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {certificates.length === 0 && (
                        <div className="p-8 text-center rounded-xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10 text-gray-500">
                          No certificate records registered. Click the button above to add one.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 8: ORBIT TEXTS CRUD */}
                  {activeTab === "orbit-texts" && (
                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">Profile Rotating Phrases</h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">MANAGE THE 4 ROTATING TEXT PHRASES AROUND PORTRAIT</p>
                        </div>
                        {editingId === null && (
                          <button
                            onClick={() => {
                              setEditingId(-1);
                              setOrbitTextForm({ id: null, text: "" });
                            }}
                            className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold text-xs rounded uppercase font-mono tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" /> Add Rotating Phrase
                          </button>
                        )}
                      </div>

                      {/* FORM STATE */}
                      {editingId !== null && (
                        <form onSubmit={saveOrbitText} className="p-6 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col gap-4 shadow-sm dark:shadow-none">
                          <h3 className="font-serif text-lg font-semibold text-gold-600 dark:text-gold-400 border-b border-gray-200 dark:border-white/5 pb-2">
                            {orbitTextForm.id ? "Edit Phrase" : "Add New Rotating Phrase"}
                          </h3>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Rotating Phrase *</label>
                            <input
                              type="text"
                              required
                              value={orbitTextForm.text}
                              onChange={(e) => setOrbitTextForm({ ...orbitTextForm, text: e.target.value })}
                              className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              placeholder="e.g. Full-Stack Software Engineer"
                            />
                          </div>

                          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setOrbitTextForm({
                                  id: null,
                                  text: "",
                                });
                              }}
                              className="px-4 py-2 rounded border border-gray-300 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-mono tracking-wider uppercase cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded bg-gold-500 text-black hover:bg-gold-600 font-semibold text-xs font-mono tracking-wider uppercase cursor-pointer"
                            >
                              Save Phrase
                            </button>
                          </div>
                        </form>
                      )}

                      {/* LISTINGS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {orbitTexts.length === 0 ? (
                          <div className="col-span-full text-center py-12 text-gray-500 border border-dashed border-gray-200 dark:border-white/10 rounded-xl font-mono">
                            No rotating phrases found. Please add exactly 4 rotating phrases for optimal look.
                          </div>
                        ) : (
                          orbitTexts.map((item) => (
                            <div
                              key={item.id}
                              className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-between gap-4 shadow-sm dark:shadow-none"
                            >
                              <div>
                                <span className="text-[10px] text-gray-400 font-mono block">PHRASE ID: #{item.id}</span>
                                <span className="font-sans font-medium text-sm text-gray-900 dark:text-white block mt-1">{item.text}</span>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setOrbitTextForm({
                                      id: item.id,
                                      text: item.text,
                                    });
                                    setEditingId(item.id);
                                  }}
                                  className="p-1.5 rounded bg-gray-100 dark:bg-white/5 hover:bg-gold-500/10 hover:text-gold-600 dark:hover:text-gold-500 border border-gray-200 dark:border-white/10 transition text-gray-500 dark:text-gray-400 cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteOrbitText(item.id)}
                                  className="p-1.5 rounded bg-red-100 dark:bg-red-950/20 hover:bg-red-200 dark:hover:bg-red-950/35 text-red-600 dark:text-red-400 border border-transparent transition cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {orbitTexts.length > 0 && orbitTexts.length !== 4 && (
                        <p className="text-amber-500 text-xs font-mono">
                          ⚠️ For the homepage animation, exactly 4 active phrases are recommended for uniform layout surrounding the profile picture. Currently, you have {orbitTexts.length}.
                        </p>
                      )}
                    </div>
                  )}

                  {/* TAB: CMS SETTINGS */}
                  {activeTab === "settings" && (
                    <div className="flex flex-col gap-6">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">CMS Site Settings</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">MANAGE GLOBAL SITE STRINGS, CONTACT INFO, AND EXTERNAL PROFILE URLS</p>
                      </div>

                      <form onSubmit={saveCmsSettings} className="flex flex-col gap-6 p-6 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                        
                        {/* Section 1: Identity */}
                        <div className="border-b border-gray-200 dark:border-white/5 pb-4">
                          <h3 className="text-sm font-semibold uppercase text-gold-600 dark:text-gold-500 font-mono mb-4">1. Brand Identity</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Site/Owner Name</label>
                              <input
                                type="text"
                                required
                                value={cmsSettings.site_name}
                                onChange={(e) => setCmsSettings({ ...cmsSettings, site_name: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Site Profession/Title</label>
                              <input
                                type="text"
                                required
                                value={cmsSettings.site_title}
                                onChange={(e) => setCmsSettings({ ...cmsSettings, site_title: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 mt-4">
                            <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Site Subtitle / Bio Description</label>
                            <textarea
                              rows={3}
                              required
                              value={cmsSettings.site_subtitle}
                              onChange={(e) => setCmsSettings({ ...cmsSettings, site_subtitle: e.target.value })}
                              className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white leading-relaxed"
                            />
                          </div>
                        </div>

                        {/* Section 2: Contact Details */}
                        <div className="border-b border-gray-200 dark:border-white/5 pb-4">
                          <h3 className="text-sm font-semibold uppercase text-gold-600 dark:text-gold-500 font-mono mb-4">2. Contact Details</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Contact Email</label>
                              <input
                                type="email"
                                required
                                value={cmsSettings.contact_email}
                                onChange={(e) => setCmsSettings({ ...cmsSettings, contact_email: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Contact Phone</label>
                              <input
                                type="text"
                                value={cmsSettings.contact_phone}
                                onChange={(e) => setCmsSettings({ ...cmsSettings, contact_phone: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 mt-4">
                            <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Contact Address</label>
                            <input
                              type="text"
                              value={cmsSettings.contact_address}
                              onChange={(e) => setCmsSettings({ ...cmsSettings, contact_address: e.target.value })}
                              className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>

                        {/* Section 3: Social Links */}
                        <div className="border-b border-gray-200 dark:border-white/5 pb-4">
                          <h3 className="text-sm font-semibold uppercase text-gold-600 dark:text-gold-500 font-mono mb-4">3. Social Connections</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">GitHub Profile Link</label>
                              <input
                                type="url"
                                value={cmsSettings.social_github}
                                onChange={(e) => setCmsSettings({ ...cmsSettings, social_github: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">LinkedIn Profile Link</label>
                              <input
                                type="url"
                                value={cmsSettings.social_linkedin}
                                onChange={(e) => setCmsSettings({ ...cmsSettings, social_linkedin: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Twitter/X Profile Link</label>
                              <input
                                type="url"
                                value={cmsSettings.social_twitter}
                                onChange={(e) => setCmsSettings({ ...cmsSettings, social_twitter: e.target.value })}
                                className="px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section 4: Assets (Hero Portrait & CV) */}
                        <div>
                          <h3 className="text-sm font-semibold uppercase text-gold-600 dark:text-gold-500 font-mono mb-4">4. Media Assets</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Profile Image (Hero portrait) URL</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={cmsSettings.profile_image}
                                  onChange={(e) => setCmsSettings({ ...cmsSettings, profile_image: e.target.value })}
                                  className="flex-1 px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                />
                                <label className="cursor-pointer px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded border border-gray-300 dark:border-white/10 flex items-center justify-center text-gold-600 dark:text-gold-500 transition shrink-0">
                                  {isUploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Upload className="w-4 h-4" />
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, (url) => setCmsSettings({ ...cmsSettings, profile_image: url }))}
                                  />
                                </label>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-gray-600 dark:text-gray-400 font-mono">Resume / CV File URL</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={cmsSettings.resume_url}
                                  onChange={(e) => setCmsSettings({ ...cmsSettings, resume_url: e.target.value })}
                                  className="flex-1 px-4 py-2.5 rounded bg-white dark:bg-black border border-gray-300 dark:border-white/10 focus:border-gold-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                                />
                                <label className="cursor-pointer px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded border border-gray-300 dark:border-white/10 flex items-center justify-center text-gold-600 dark:text-gold-500 transition shrink-0">
                                  {isUploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Upload className="w-4 h-4" />
                                  )}
                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, (url) => setCmsSettings({ ...cmsSettings, resume_url: url }))}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-4 border-t border-gray-200 dark:border-white/5 flex justify-end">
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-gold-500 text-black font-semibold text-xs rounded uppercase font-mono tracking-wider hover:bg-gold-600 transition cursor-pointer"
                          >
                            Save CMS Settings
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
