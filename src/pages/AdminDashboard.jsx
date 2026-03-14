import React, { useState, useEffect } from "react";
import axios from "axios";
import { Shield, Trash2, LogOut, Users, Briefcase, FileText, MessageSquare, LayoutDashboard, TrendingUp, ChevronRight, CheckCircle, XCircle, Clock, Phone, MapPin, Star, BookOpen, Award, Eye, X, ChevronDown, ChevronUp, Mail, User, Layers } from "lucide-react";

const AdminDashboard = ({ onLogout }) => {
  const [adminView, setAdminView] = useState("overview");

  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const [jobForm, setJobForm] = useState({
    title: "", company: "", location: "", jobType: "", category: "", salary: "",
    contactEmail: "", description: "", applyLink: "", workExperience: "",
  });

  const token = localStorage.getItem("admintoken");

  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState({});
  const toggleExpand = (id) => setExpandedUsers(prev => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    await Promise.all([fetchJobs(), fetchUsers(), fetchApplications(), fetchFeedbacks()]);
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:9000/jobs/all");
      if (res.data?.success) setJobs(res.data.data || []);
    } catch (err) { console.error("Jobs Fetch Error:", err.response?.data || err.message); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:9000/admin/users/getUser", { headers: { "auth-token": token } });
      if (res.data?.success) setUsers(res.data.data || []);
    } catch (err) { console.error("Users Fetch Error:", err.response?.data || err.message); }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get("http://localhost:9000/api/applications/all", { headers: { "auth-token": token } });
      if (res.data?.success) setApplications(res.data.data || []);
    } catch (err) { console.error("Applications Fetch Error:", err.response?.data || err.message); }
  };

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get("http://localhost:9000/feedback/all", { headers: { "auth-token": token } });
      if (res.data?.success) setFeedbacks(res.data.data || []);
    } catch (err) { console.error("Feedback Fetch Error:", err.response?.data || err.message); }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company) { alert("Title and Company are required"); return; }
    try {
      const res = await axios.post("http://localhost:9000/jobs/create", jobForm, { headers: { "auth-token": token } });
      if (res.data?.success) {
        alert("Job posted successfully");
        setJobForm({ title: "", company: "", location: "", jobType: "", category: "", salary: "", contactEmail: "", description: "", applyLink: "", workExperience: "" });
        fetchJobs();
      }
    } catch (err) { console.error("Add Job Error:", err.response?.data || err.message); alert("Failed to add job"); }
  };

  const handleDeleteJob = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:9000/jobs/delete/${id}`, { headers: { "auth-token": token } });
      if (res.data?.success) { alert("Job deleted"); fetchJobs(); }
    } catch (err) { console.error("Delete Job Error:", err.response?.data || err.message); alert("Failed to delete job"); }
  };

  const handleBlockUser = async (id) => {
    try {
      const res = await axios.put(`http://localhost:9000/admin/users/block/${id}`, {}, { headers: { "auth-token": token } });
      if (res.data?.success) fetchUsers();
    } catch (err) { console.error("Block User Error:", err.response?.data || err.message); alert("Failed to update user"); }
  };

  const openResume = (resume) => {
    if (!resume) { alert("No resume uploaded."); return; }
    if (typeof resume === "string") { window.open(resume, "_blank", "noopener,noreferrer"); return; }
    if (resume?.data) {
      try {
        const base64 = resume.data;
        const isPdf = resume.type === "application/pdf" || resume.name?.endsWith(".pdf");
        const isDocx = resume.name?.endsWith(".docx") || resume.name?.endsWith(".doc");
        if (isPdf) {
          const byteString = atob(base64.split(",")[1]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
          const blob = new Blob([ab], { type: "application/pdf" });
          window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer");
        } else if (isDocx) {
          const link = document.createElement("a");
          link.href = base64; link.target = "_blank"; link.download = resume.name || "resume.docx"; link.click();
        } else { window.open(base64, "_blank", "noopener,noreferrer"); }
      } catch (err) { alert("Could not open resume. The file data may be corrupted."); }
      return;
    }
    alert("Resume not available or invalid format.");
  };

  const getResumeFilename = (resume) => {
    if (!resume) return "No resume";
    if (typeof resume === "string") return resume.split("/").pop();
    return resume?.name || "resume file";
  };

  const getResumeHint = (resume) => {
    if (!resume) return "";
    const name = typeof resume === "string" ? resume : resume?.name || "";
    if (/\.pdf$/i.test(name)) return "Opens in browser PDF viewer";
    if (/\.(doc|docx)$/i.test(name)) return "Downloads file";
    return "Opens in new tab";
  };

  const totalUsers = users.length;
  const blockedUsers = users.filter((u) => u.blocked).length;
  const totalApplications = applications.length;

  const navItems = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "users", label: "Users", icon: Users },
    { key: "jobs", label: "Jobs", icon: Briefcase },
    { key: "applications", label: "Applications", icon: FileText },
    { key: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  const statCards = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "#3b82f6", bg: "#eff6ff", trend: "Active accounts" },
    { label: "Blocked Users", value: blockedUsers, icon: Shield, color: "#ef4444", bg: "#fef2f2", trend: "Restricted access" },
    { label: "Job Listings", value: jobs.length, icon: Briefcase, color: "#10b981", bg: "#f0fdf4", trend: "Open positions" },
    { label: "Applications", value: totalApplications, icon: FileText, color: "#8b5cf6", bg: "#faf5ff", trend: "Total submitted" },
  ];

  const inputClass = "w-full border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200";

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#f1f5f9", minHeight: "100vh" }}>

      {/* Sidebar */}
      <div style={{ position: "fixed", top: 0, left: 0, height: "100vh", width: "240px", background: "#0f172a", display: "flex", flexDirection: "column", zIndex: 50, boxShadow: "4px 0 24px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={18} color="white" />
            </div>
            <div>
              <p style={{ color: "white", fontWeight: 700, fontSize: "15px", margin: 0, lineHeight: 1 }}>AdminPanel</p>
              <p style={{ color: "#64748b", fontSize: "11px", margin: "3px 0 0", letterSpacing: "0.05em" }}>CONTROL CENTER</p>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          <p style={{ color: "#475569", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", padding: "0 12px", marginBottom: "8px" }}>NAVIGATION</p>
          {navItems.map(({ key, label, icon: Icon }) => {
            const active = adminView === key;
            return (
              <button key={key} onClick={() => setAdminView(key)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "10px", border: "none", cursor: "pointer", marginBottom: "4px", transition: "all 0.15s ease", textAlign: "left", background: active ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "transparent", color: active ? "white" : "#94a3b8" }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "white"; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; } }}>
                <Icon size={17} />
                <span style={{ fontSize: "14px", fontWeight: active ? 600 : 400 }}>{label}</span>
                {active && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "10px", border: "none", cursor: "pointer", background: "rgba(239,68,68,0.1)", color: "#f87171", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}>
            <LogOut size={17} />
            <span style={{ fontSize: "14px", fontWeight: 500 }}>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: "240px", padding: "32px", minHeight: "100vh" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1 }}>
            {navItems.find(n => n.key === adminView)?.label}
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "6px" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* OVERVIEW */}
        {adminView === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "28px" }}>
              {statCards.map(({ label, value, icon: Icon, color, bg, trend }) => (
                <div key={label} style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={20} color={color} />
                    </div>
                    <TrendingUp size={14} color="#10b981" />
                  </div>
                  <p style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px", lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#334155", margin: "0 0 2px" }}>{label}</p>
                  <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>{trend}</p>
                </div>
              ))}
            </div>
            <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>Platform Summary</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {[
                  { label: "Active Users", value: totalUsers - blockedUsers, color: "#10b981" },
                  { label: "Blocked Accounts", value: blockedUsers, color: "#ef4444" },
                  { label: "Total Jobs Posted", value: jobs.length, color: "#3b82f6" },
                  { label: "Total Applications", value: totalApplications, color: "#8b5cf6" },
                  { label: "Feedback Received", value: feedbacks.length, color: "#f59e0b" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#f8fafc", borderRadius: "10px" }}>
                    <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: "20px", fontWeight: 800, color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESUME MODAL */}
        {selectedUser && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", backdropFilter: "blur(4px)" }} onClick={() => setSelectedUser(null)}>
            <div style={{ background: "white", borderRadius: "20px", width: "100%", maxWidth: "680px", maxHeight: "88vh", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
              <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "14px", flexShrink: 0, background: "linear-gradient(135deg, #60a5fa, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "20px" }}>
                    {(selectedUser.profile?.name || selectedUser.name || selectedUser.email || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ color: "white", fontWeight: 700, fontSize: "18px", margin: 0 }}>{selectedUser.profile?.name || selectedUser.name || "Unknown User"}</h2>
                    <p style={{ color: "#94a3b8", fontSize: "13px", margin: "3px 0 0" }}>{selectedUser.email}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {selectedUser.profile?.resume && (
                    <button onClick={() => openResume(selectedUser.profile.resume)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "rgba(59,130,246,0.2)", color: "#60a5fa", borderRadius: "8px", border: "1px solid rgba(59,130,246,0.3)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                      <Eye size={14} /> Open Resume
                    </button>
                  )}
                  <button onClick={() => setSelectedUser(null)} style={{ width: 36, height: 36, borderRadius: "8px", border: "none", cursor: "pointer", background: "rgba(255,255,255,0.1)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={18} /></button>
                </div>
              </div>
              <div style={{ overflowY: "auto", padding: "28px", flex: 1 }}>
                <div style={{ marginBottom: "24px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", margin: "0 0 12px" }}>CONTACT INFORMATION</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      { icon: Mail, label: "Email", value: selectedUser.email },
                      { icon: Phone, label: "Phone", value: selectedUser.phone || selectedUser.profile?.phone || "—" },
                      { icon: MapPin, label: "Location", value: selectedUser.profile?.location || "—" },
                      { icon: User, label: "Gender", value: selectedUser.profile?.gender || "—" },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px", background: "#f8fafc", borderRadius: "10px" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "8px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={14} color="#3b82f6" />
                        </div>
                        <div>
                          <p style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600, margin: 0, letterSpacing: "0.05em" }}>{label.toUpperCase()}</p>
                          <p style={{ fontSize: "13px", color: "#334155", fontWeight: 500, margin: "2px 0 0", wordBreak: "break-word" }}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ height: 1, background: "#f1f5f9", margin: "0 0 24px" }} />
                <div style={{ marginBottom: "24px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", margin: "0 0 12px" }}>PROFESSIONAL DETAILS</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      { icon: Award, label: "Experience", value: selectedUser.profile?.experience || "—" },
                      { icon: Layers, label: "Category", value: selectedUser.profile?.category || selectedUser.profile?.jobCategory || "—" },
                      { icon: BookOpen, label: "Education", value: selectedUser.profile?.education || "—" },
                      { icon: Star, label: "Expected Salary", value: selectedUser.profile?.expectedSalary || selectedUser.profile?.salary || "—" },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px", background: "#f8fafc", borderRadius: "10px" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "8px", background: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={14} color="#8b5cf6" />
                        </div>
                        <div>
                          <p style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600, margin: 0, letterSpacing: "0.05em" }}>{label.toUpperCase()}</p>
                          <p style={{ fontSize: "13px", color: "#334155", fontWeight: 500, margin: "2px 0 0" }}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedUser.profile?.skills && (
                  <>
                    <div style={{ height: 1, background: "#f1f5f9", margin: "0 0 24px" }} />
                    <div style={{ marginBottom: "24px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", margin: "0 0 12px" }}>SKILLS</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {String(selectedUser.profile.skills).split(/[,،|\/]/).map(s => s.trim()).filter(Boolean).map((skill, i) => (
                          <span key={i} style={{ padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: ["#eff6ff", "#faf5ff", "#f0fdf4", "#fffbeb", "#fef2f2"][i % 5], color: ["#3b82f6", "#8b5cf6", "#16a34a", "#d97706", "#ef4444"][i % 5] }}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {(selectedUser.profile?.bio || selectedUser.profile?.about || selectedUser.profile?.summary) && (
                  <>
                    <div style={{ height: 1, background: "#f1f5f9", margin: "0 0 24px" }} />
                    <div style={{ marginBottom: "24px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", margin: "0 0 12px" }}>ABOUT</p>
                      <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.7, margin: 0, background: "#f8fafc", padding: "16px", borderRadius: "10px", borderLeft: "3px solid #3b82f6" }}>
                        {selectedUser.profile?.bio || selectedUser.profile?.about || selectedUser.profile?.summary}
                      </p>
                    </div>
                  </>
                )}
                {selectedUser.profile?.resume && (
                  <>
                    <div style={{ height: 1, background: "#f1f5f9", margin: "0 0 24px" }} />
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", margin: "0 0 12px" }}>RESUME</p>
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <button onClick={() => openResume(selectedUser.profile.resume)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 22px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700, background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white", boxShadow: "0 4px 14px rgba(59,130,246,0.35)" }}>
                          <Eye size={18} />
                          <div style={{ textAlign: "left" }}>
                            <div>Open Resume</div>
                            <div style={{ fontSize: "11px", fontWeight: 400, opacity: 0.8 }}>{getResumeHint(selectedUser.profile.resume)}</div>
                          </div>
                        </button>
                      </div>
                      <p style={{ fontSize: "11px", color: "#94a3b8", margin: "10px 0 0", fontFamily: "monospace" }}>📎 {getResumeFilename(selectedUser.profile.resume)}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {adminView === "users" && (
          <div>
            <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Registered Users</h3>
                <span style={{ background: "#eff6ff", color: "#3b82f6", fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px" }}>{totalUsers} total</span>
              </div>
              <div style={{ padding: "16px 24px" }}>
                {users.map((user) => {
                  const isExpanded = expandedUsers[user._id];
                  const name = user.profile?.name || user.name || "Unknown";
                  return (
                    <div key={user._id} style={{ border: `1px solid ${user.blocked ? "#fecaca" : "#f1f5f9"}`, borderRadius: "14px", marginBottom: "14px", overflow: "hidden", background: user.blocked ? "#fff8f8" : "white", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ width: 48, height: 48, borderRadius: "14px", flexShrink: 0, background: user.blocked ? "linear-gradient(135deg, #fca5a5,#ef4444)" : "linear-gradient(135deg, #93c5fd,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "18px" }}>
                          {name[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>{name}</h4>
                          </div>
                          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}><Mail size={11} />{user.email}</span>
                            {(user.phone || user.profile?.phone) && (<span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}><Phone size={11} />{user.phone || user.profile?.phone}</span>)}
                            {user.profile?.location && (<span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={11} />{user.profile.location}</span>)}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                          <button onClick={() => setSelectedUser(user)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, background: "#eff6ff", color: "#3b82f6" }}>
                            <Eye size={13} /> View Profile
                          </button>
                          <button onClick={() => handleBlockUser(user._id)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, background: user.blocked ? "#dcfce7" : "#fee2e2", color: user.blocked ? "#16a34a" : "#dc2626" }}>
                            <Shield size={13} />{user.blocked ? "Unblock" : "Block"}
                          </button>
                          <button onClick={() => toggleExpand(user._id)} style={{ width: 32, height: 32, borderRadius: "8px", border: "none", cursor: "pointer", background: "#f8fafc", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div style={{ borderTop: "1px solid #f1f5f9", padding: "20px", background: "#fafbfc" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
                            {[
                              { label: "Experience", value: user.profile?.experience, icon: Award, color: "#8b5cf6", bg: "#faf5ff" },
                              { label: "Education", value: user.profile?.education, icon: BookOpen, color: "#3b82f6", bg: "#eff6ff" },
                              { label: "Expected Salary", value: user.profile?.expectedSalary || user.profile?.salary, icon: Star, color: "#f59e0b", bg: "#fffbeb" },
                              { label: "Job Category", value: user.profile?.category || user.profile?.jobCategory, icon: Layers, color: "#10b981", bg: "#f0fdf4" },
                              { label: "Gender", value: user.profile?.gender, icon: User, color: "#6366f1", bg: "#eef2ff" },
                              { label: "Account Status", value: user.blocked ? "Blocked" : "Active", icon: Shield, color: user.blocked ? "#ef4444" : "#16a34a", bg: user.blocked ? "#fef2f2" : "#f0fdf4" },
                            ].map(({ label, value, icon: Icon, color, bg }) => (
                              <div key={label} style={{ background: "white", borderRadius: "10px", padding: "12px 14px", border: "1px solid #f1f5f9", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                <div style={{ width: 30, height: 30, borderRadius: "8px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <Icon size={13} color={color} />
                                </div>
                                <div>
                                  <p style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600, margin: 0, letterSpacing: "0.05em" }}>{label.toUpperCase()}</p>
                                  <p style={{ fontSize: "13px", color: "#334155", fontWeight: 600, margin: "2px 0 0" }}>{value || "—"}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {user.profile?.skills && (
                            <div style={{ marginBottom: "14px" }}>
                              <p style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700, letterSpacing: "0.07em", margin: "0 0 8px" }}>SKILLS</p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {String(user.profile.skills).split(/[,،|\/]/).map(s => s.trim()).filter(Boolean).map((skill, i) => (
                                  <span key={i} style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: ["#eff6ff", "#faf5ff", "#f0fdf4", "#fffbeb", "#fef2f2"][i % 5], color: ["#3b82f6", "#8b5cf6", "#16a34a", "#d97706", "#ef4444"][i % 5] }}>{skill}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {(user.profile?.bio || user.profile?.about || user.profile?.summary) && (
                            <div style={{ marginBottom: "14px" }}>
                              <p style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700, letterSpacing: "0.07em", margin: "0 0 8px" }}>ABOUT</p>
                              <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0, padding: "12px 14px", background: "white", borderRadius: "10px", borderLeft: "3px solid #3b82f6", border: "1px solid #e0f2fe" }}>
                                {user.profile?.bio || user.profile?.about || user.profile?.summary}
                              </p>
                            </div>
                          )}
                          {user.profile?.resume ? (
                            <div style={{ display: "flex", gap: "10px" }}>
                              <button onClick={() => openResume(user.profile.resume)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white", boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}>
                                <Eye size={14} /> Open Resume
                              </button>
                            </div>
                          ) : (
                            <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, fontStyle: "italic" }}>No resume uploaded</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* JOBS */}
        {adminView === "jobs" && (
          <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: "24px", alignItems: "flex-start" }}>
            <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(135deg, #0f172a, #1e3a5f)" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "white", margin: 0 }}>Post New Job</h3>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0" }}>Fill in details to create a listing</p>
              </div>
              <form onSubmit={handleAddJob} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { placeholder: "Job Title", field: "title", type: "text" },
                  { placeholder: "Company Name", field: "company", type: "text" },
                  { placeholder: "Location", field: "location", type: "text" },
                  { placeholder: "Category", field: "category", type: "text" },
                  { placeholder: "Salary Range", field: "salary", type: "text" },
                  { placeholder: "Contact Email", field: "contactEmail", type: "email" },
                  { placeholder: "Apply Link (URL)", field: "applyLink", type: "text" },
                  { placeholder: "Work Experience (e.g. 2+ years)", field: "workExperience", type: "text" },
                ].map(({ placeholder, field, type }) => (
                  <div key={field}>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>{placeholder.toUpperCase()}</label>
                    <input required type={type} placeholder={placeholder} value={jobForm[field]}
                      onChange={(e) => setJobForm({ ...jobForm, [field]: e.target.value })}
                      style={{ width: "100%", border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#334155", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>JOB TYPE</label>
                  <select required value={jobForm.jobType} onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                    style={{ width: "100%", border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#334155", outline: "none" }}>
                    <option value="">Select Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>DESCRIPTION</label>
                  <textarea required placeholder="Job description..." value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} rows={4}
                    style={{ width: "100%", border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#334155", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                  />
                </div>
                <button type="submit" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer", background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white", fontSize: "14px", fontWeight: 700, letterSpacing: "0.02em", marginTop: "4px", boxShadow: "0 4px 14px rgba(59,130,246,0.4)" }}>
                  Post Job Listing
                </button>
              </form>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Active Listings</h3>
                <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px" }}>{jobs.length} jobs</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {jobs.map((job) => (
                  <div key={job._id} style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>{job.title}</h4>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 10px", borderRadius: "20px", background: "#eff6ff", color: "#3b82f6" }}>{job.jobType}</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 10px", fontWeight: 500 }}>{job.company}</p>
                      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                        {[["📍", job.location], ["💼", job.category], ["💰", job.salary], ["📧", job.contactEmail]].map(([icon, val]) => val ? (
                          <span key={icon} style={{ fontSize: "12px", color: "#94a3b8" }}>{icon} {val}</span>
                        ) : null)}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteJob(job._id)} style={{ width: 36, height: 36, borderRadius: "8px", border: "none", cursor: "pointer", background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "16px" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fecaca"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fee2e2"}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* APPLICATIONS */}
        {adminView === "applications" && (
          <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>User Applications</h3>
              <span style={{ background: "#faf5ff", color: "#8b5cf6", fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px" }}>{totalApplications} total</span>
            </div>
            <div style={{ padding: "16px 24px" }}>
              {/* Table Header */}
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1.5fr 1.5fr 1fr", padding: "10px 16px", background: "#f8fafc", borderRadius: "8px", marginBottom: "8px" }}>
                {["Applicant", "Email", "Job Title", "Company", "Resume"].map(h => (
                  <span key={h} style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em" }}>{h.toUpperCase()}</span>
                ))}
              </div>
              {applications.map((app) => (
                <div key={app._id} style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1.5fr 1.5fr 1fr", padding: "14px 16px", borderBottom: "1px solid #f8fafc", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{app.user?.profile?.name || "—"}</span>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>{app.user?.email}</span>
                  <span style={{ fontSize: "13px", color: "#334155" }}>{app.job?.title}</span>
                  <span style={{ fontSize: "13px", color: "#334155" }}>{app.job?.company}</span>
                  <span>
                    {app.user?.profile?.resume ? (
                      <button
                        onClick={() => openResume(app.user.profile.resume)}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "white", boxShadow: "0 2px 6px rgba(59,130,246,0.3)" }}
                      >
                        <Eye size={13} /> Resume
                      </button>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>No resume</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEEDBACK */}
        {adminView === "feedback" && (
          <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>User Feedback</h3>
              <span style={{ background: "#fffbeb", color: "#d97706", fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px" }}>{feedbacks.length} responses</span>
            </div>
            <div style={{ padding: "16px 24px" }}>
              {feedbacks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <MessageSquare size={40} color="#e2e8f0" style={{ margin: "0 auto 12px" }} />
                  <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>No feedback submitted yet</p>
                </div>
              ) : (
                feedbacks.map((fb, i) => (
                  <div key={fb._id} style={{ border: "1px solid #f1f5f9", borderRadius: "12px", padding: "18px 20px", marginBottom: "12px", background: "#fafafa", borderLeft: "3px solid #f59e0b" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #fcd34d, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px", fontWeight: 700 }}>
                        {(fb.email || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "#334155", margin: 0 }}>{fb.email}</p>
                        <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>Feedback #{i + 1}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: "14px", color: "#475569", margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>"{fb.message}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;