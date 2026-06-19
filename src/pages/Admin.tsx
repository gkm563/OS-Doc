import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useContributions, useReviewers, useAchievements } from "../hooks/useData";
import { writeDataFile } from "../lib/cms";
import { StatusPill } from "../components/StatusPill";
import { PlatformBadge } from "../components/PlatformBadge";
import {
  Lock,
  LogOut,
  GitCommit,
  UserCheck,
  BookOpen,
  Trophy,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  FileCheck,
} from "lucide-react";

export const Admin: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: contributions = [] } = useContributions();
  const { data: reviewers = [] } = useReviewers();
  const { data: achievements = [] } = useAchievements();

  // Authentication Mock State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "GKM563" && password === "gkm563") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid credentials. Try GKM563 / gkm563.");
    }
  };

  // Active sub-section tab
  const [activeTab, setActiveTab] = useState<"contributions" | "reviewers" | "journal" | "achievements">("contributions");

  // Form Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editType, setEditType] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Form fields for Contribution ---
  const [cTitle, setCTitle] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cPlatform, setCPlatform] = useState<any>("github");
  const [cStatus, setCStatus] = useState<any>("open");
  const [cRepo, setCRepo] = useState("");
  const [cTaskId, setCTaskId] = useState("");
  const [cPrId, setCPrId] = useState("");
  const [cReviewers, setCReviewers] = useState("");
  const [cReviewNotes, setCReviewNotes] = useState("");
  const [cTags, setCTags] = useState("");
  const [cLinks, setCLinks] = useState("");
  const [cDateStarted, setCDateStarted] = useState("");
  const [cDateCompleted, setCDateCompleted] = useState("");
  const [cTimeSpent, setCTimeSpent] = useState(0);

  // --- Form fields for Reviewer Feedback ---
  const [rName, setRName] = useState("");
  const [rPlatform, setRPlatform] = useState("gerrit");
  const [rFeedbackText, setRFeedbackText] = useState("");
  const [rCategory, setRCategory] = useState("process");
  const [rAppliesIn, setRAppliesIn] = useState("");
  const [rInternalized, setRInternalized] = useState(false);

  // --- Form fields for Journal ---
  const [jDate, setJDate] = useState("");
  const [jContent, setJContent] = useState("");

  // --- Form fields for Achievement ---
  const [aTitle, setATitle] = useState("");
  const [aDesc, setADesc] = useState("");
  const [aTier, setATier] = useState<any>("bronze");
  const [aIcon, setAIcon] = useState("Trophy");
  const [aUnlockedAt, setAUnlockedAt] = useState("");

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    // Contributions reset
    setCTitle(""); setCDesc(""); setCPlatform("github"); setCStatus("open"); setCRepo("");
    setCTaskId(""); setCPrId(""); setCReviewers(""); setCReviewNotes(""); setCTags("");
    setCLinks(""); setCDateStarted(""); setCDateCompleted(""); setCTimeSpent(0);
    // Reviewers reset
    setRName(""); setRPlatform("gerrit"); setRFeedbackText(""); setRCategory("process");
    setRAppliesIn(""); setRInternalized(false);
    // Journal reset
    setJDate(""); setJContent("");
    // Achievements reset
    setATitle(""); setADesc(""); setATier("bronze"); setAIcon("Trophy"); setAUnlockedAt("");
  };

  // CRUD handlers
  const handleSaveContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedList = [...contributions];

    const payload = {
      id: editType === "edit" ? editingId! : `c_${Date.now()}`,
      title: cTitle,
      description: cDesc,
      platform: cPlatform,
      status: cStatus,
      repository: cRepo,
      task_id: cTaskId || null,
      pr_or_change_id: cPrId || null,
      reviewers: cReviewers.split(",").map((s) => s.trim()).filter(Boolean),
      review_notes: cReviewNotes.split("\n").map((s) => s.trim()).filter(Boolean),
      tags: cTags.split(",").map((s) => s.trim()).filter(Boolean),
      screenshots: [],
      links: cLinks.split(",").map((s) => s.trim()).filter(Boolean),
      date_started: cDateStarted,
      date_completed: cDateCompleted || null,
      time_spent_minutes: Number(cTimeSpent) || 0,
      learning_note_id: cDateCompleted ? `j_${cDateCompleted}` : null,
      related_contribution_ids: [],
    };

    if (editType === "edit") {
      updatedList = updatedList.map((item) => (item.id === editingId ? payload : item));
    } else {
      updatedList.push(payload);
    }

    const success = await writeDataFile("data/contributions.json", updatedList);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      resetForm();
    }
  };

  const handleEditContribution = (c: any) => {
    setEditType("edit");
    setEditingId(c.id);
    setCTitle(c.title || "");
    setCDesc(c.description || "");
    setCPlatform(c.platform);
    setCStatus(c.status);
    setCRepo(c.repository || "");
    setCTaskId(c.task_id || "");
    setCPrId(c.pr_or_change_id || "");
    setCReviewers(c.reviewers?.join(", ") || "");
    setCReviewNotes(c.review_notes?.join("\n") || "");
    setCTags(c.tags?.join(", ") || "");
    setCLinks(c.links?.join(", ") || "");
    setCDateStarted(c.date_started || "");
    setCDateCompleted(c.date_completed || "");
    setCTimeSpent(c.time_spent_minutes || 0);
    setIsEditing(true);
  };

  const handleDeleteContribution = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this contribution?")) return;
    const updatedList = contributions.filter((c) => c.id !== id);
    const success = await writeDataFile("data/contributions.json", updatedList);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
    }
  };

  const handleSaveReviewerFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedList = [...reviewers];

    // Find reviewer
    let reviewer = updatedList.find((r) => r.name.toLowerCase() === rName.trim().toLowerCase());

    const newFeedback = {
      date: new Date().toISOString().split("T")[0],
      category: rCategory as any,
      text: rFeedbackText,
      applied_in: rAppliesIn.split(",").map((s) => s.trim()).filter(Boolean),
      internalized: rInternalized,
    };

    if (reviewer) {
      reviewer.feedback.push(newFeedback);
      if (!reviewer.platforms.includes(rPlatform)) {
        reviewer.platforms.push(rPlatform);
      }
    } else {
      reviewer = {
        id: `r_${Date.now()}`,
        name: rName.trim(),
        platforms: [rPlatform],
        feedback: [newFeedback],
      };
      updatedList.push(reviewer);
    }

    const success = await writeDataFile("data/reviewers.json", updatedList);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["reviewers"] });
      resetForm();
    }
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jDate) return;
    
    // Write markdown entry file directly under /data/journal/
    const success = await writeDataFile(`data/journal/${jDate}.md`, jContent);
    if (success) {
      alert("Journal markdown note saved successfully!");
      resetForm();
    }
  };

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedList = [...achievements];

    const payload = {
      id: editType === "edit" ? editingId! : `a_${Date.now()}`,
      title: aTitle,
      description: aDesc,
      tier: aTier,
      unlocked_at: aUnlockedAt ? new Date(aUnlockedAt).toISOString() : null,
      icon: aIcon,
    };

    if (editType === "edit") {
      updatedList = updatedList.map((item) => (item.id === editingId ? payload : item));
    } else {
      updatedList.push(payload);
    }

    const success = await writeDataFile("data/achievements.json", updatedList);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      resetForm();
    }
  };

  const handleEditAchievement = (a: any) => {
    setEditType("edit");
    setEditingId(a.id);
    setATitle(a.title || "");
    setADesc(a.description || "");
    setATier(a.tier || "bronze");
    setAIcon(a.icon || "Trophy");
    if (a.unlocked_at) {
      const dateObj = new Date(a.unlocked_at);
      const tzoffset = dateObj.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(dateObj.getTime() - tzoffset)).toISOString().slice(0, 16);
      setAUnlockedAt(localISOTime);
    } else {
      setAUnlockedAt("");
    }
    setIsEditing(true);
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this achievement?")) return;
    const updatedList = achievements.filter((a) => a.id !== id);
    const success = await writeDataFile("data/achievements.json", updatedList);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    }
  };

  // --- Login Screen ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-surface border border-border-default rounded-xl p-8 shadow-md max-w-sm w-full space-y-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-primary">Authorize Admin Session</h1>
            <p className="text-xs text-secondary mt-1">Authenticate to access CMS write pipeline</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-secondary block">Username:</label>
              <input
                type="text"
                placeholder="GKM563"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 rounded-btn border border-border-subtle bg-surface-elevated text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-1">
              <label className="text-secondary block">Password:</label>
              <input
                type="password"
                placeholder="gkm563"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-btn border border-border-subtle bg-surface-elevated text-primary focus:outline-none focus:border-accent"
              />
            </div>
            {authError && <div className="text-status-rejected text-[10px] leading-tight">{authError}</div>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-btn bg-accent text-white font-semibold font-sans hover:bg-accent-hover transition-colors shadow-lg shadow-accent/25"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Admin CMS Portal</h1>
          <p className="text-xs text-secondary mt-1">Manage database records and write updates directly to Git.</p>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-4 py-2 border border-border-subtle rounded-btn text-xs text-secondary hover:text-primary bg-surface flex items-center gap-1.5 self-start"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      {/* Main interface split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface border border-border-default rounded-xl p-4 shadow-sm space-y-1.5">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block px-2 mb-3">
              CMS Tables
            </span>
            {[
              { id: "contributions", label: "Contributions DB", icon: GitCommit },
              { id: "reviewers", label: "Reviewer Feedback", icon: UserCheck },
              { id: "journal", label: "Write Journal", icon: BookOpen },
              { id: "achievements", label: "Achievements", icon: Trophy },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    resetForm();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs font-semibold uppercase tracking-wider transition-all ${
                    activeTab === tab.id
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "text-secondary hover:text-primary hover:bg-surface-elevated border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CMS Forms / Listing Panels */}
        <div className="lg:col-span-3 space-y-6">
          {/* Form Overlay Editor */}
          {isEditing ? (
            <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <h2 className="text-base font-semibold text-primary">
                  {activeTab === "contributions"
                    ? (editType === "edit" ? "Edit Contribution" : "Log New Contribution")
                    : (editType === "edit" ? "Edit Achievement" : "Log New Achievement")}
                </h2>
                <button onClick={resetForm} className="text-secondary hover:text-primary">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Contribution edit Form */}
              {activeTab === "contributions" && (
                <form onSubmit={handleSaveContribution} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-secondary">Title:</label>
                    <input
                      type="text"
                      required
                      value={cTitle}
                      onChange={(e) => setCTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs font-sans focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-secondary">Description (What happened & Why):</label>
                    <textarea
                      required
                      rows={3}
                      value={cDesc}
                      onChange={(e) => setCDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs font-sans focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-secondary">Platform:</label>
                    <select
                      value={cPlatform}
                      onChange={(e) => setCPlatform(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary focus:outline-none"
                    >
                      <option value="github">GitHub</option>
                      <option value="gitlab">GitLab</option>
                      <option value="gerrit">Gerrit</option>
                      <option value="wikipedia">Wikimedia</option>
                      <option value="phabricator">Phabricator</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-secondary">Status:</label>
                    <select
                      value={cStatus}
                      onChange={(e) => setCStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary focus:outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="under_review">Under Review</option>
                      <option value="merged">Merged</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-secondary">Repository:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. language-data"
                      value={cRepo}
                      onChange={(e) => setCRepo(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-secondary">Task ID:</label>
                    <input
                      type="text"
                      placeholder="e.g. T428848"
                      value={cTaskId}
                      onChange={(e) => setCTaskId(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-secondary">PR / Change Number:</label>
                    <input
                      type="text"
                      placeholder="e.g. 503 or 1302995"
                      value={cPrId}
                      onChange={(e) => setCPrId(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-secondary">Time Spent (minutes):</label>
                    <input
                      type="number"
                      value={cTimeSpent}
                      onChange={(e) => setCTimeSpent(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-secondary">Date Started (YYYY-MM-DD):</label>
                    <input
                      type="date"
                      required
                      value={cDateStarted}
                      onChange={(e) => setCDateStarted(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-secondary">Date Completed (YYYY-MM-DD):</label>
                    <input
                      type="date"
                      value={cDateCompleted}
                      onChange={(e) => setCDateCompleted(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-secondary">Reviewers (comma-separated):</label>
                    <input
                      type="text"
                      placeholder="ToluAyodele, Srish"
                      value={cReviewers}
                      onChange={(e) => setCReviewers(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-secondary">Reviewer Notes / Feedback (one per line):</label>
                    <textarea
                      rows={2}
                      placeholder="Always run generator script before adding language data."
                      value={cReviewNotes}
                      onChange={(e) => setCReviewNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs font-sans focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-secondary">Tags (comma-separated):</label>
                    <input
                      type="text"
                      placeholder="i18n, language-data"
                      value={cTags}
                      onChange={(e) => setCTags(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-secondary">Reference Links (comma-separated):</label>
                    <input
                      type="text"
                      placeholder="https://gerrit.wikimedia.org/r/c/..."
                      value={cLinks}
                      onChange={(e) => setCLinks(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border-subtle flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-border-subtle rounded-btn text-xs text-secondary hover:bg-surface-elevated"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-btn bg-accent text-white hover:bg-accent-hover text-xs font-semibold flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    Save Record
                  </button>
                </div>
              </form>
              )}

              {/* Achievement edit Form */}
              {activeTab === "achievements" && (
                <form onSubmit={handleSaveAchievement} className="space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-secondary">Title:</label>
                      <input
                        type="text"
                        required
                        value={aTitle}
                        onChange={(e) => setATitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs font-sans focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-secondary">Description:</label>
                      <textarea
                        required
                        rows={3}
                        value={aDesc}
                        onChange={(e) => setADesc(e.target.value)}
                        className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs font-sans focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-secondary">Tier:</label>
                      <select
                        value={aTier}
                        onChange={(e) => setATier(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary focus:outline-none"
                      >
                        <option value="bronze">Bronze</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-secondary">Icon:</label>
                      <select
                        value={aIcon}
                        onChange={(e) => setAIcon(e.target.value)}
                        className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary focus:outline-none"
                      >
                        <option value="Trophy">Trophy (Default)</option>
                        <option value="GitPullRequest">GitPullRequest</option>
                        <option value="GitCommit">GitCommit</option>
                        <option value="BookOpen">BookOpen</option>
                        <option value="Flame">Flame</option>
                        <option value="Globe">Globe</option>
                      </select>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-secondary">Unlocked At (Date & Time):</label>
                      <input
                        type="datetime-local"
                        value={aUnlockedAt}
                        onChange={(e) => setAUnlockedAt(e.target.value)}
                        className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border-subtle flex justify-end gap-3 font-sans">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-border-subtle rounded-btn text-xs text-secondary hover:bg-surface-elevated"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-btn bg-accent text-white hover:bg-accent-hover text-xs font-semibold flex items-center gap-1"
                    >
                      <Save className="h-4 w-4" />
                      Save Record
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null}

          {/* Tab Content Panels */}
          {!isEditing && activeTab === "contributions" ? (
            <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div>
                  <h2 className="text-sm font-semibold text-primary">Contributions Records</h2>
                  <p className="text-[11px] text-secondary">Logged contributions inside data/contributions.json</p>
                </div>
                <button
                  onClick={() => {
                    setEditType("add");
                    setIsEditing(true);
                  }}
                  className="px-3 py-1.5 rounded-btn bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Contribution
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle text-secondary font-mono">
                      <th className="py-2.5">Platform</th>
                      <th className="py-2.5">Title</th>
                      <th className="py-2.5">Repository</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map((c) => (
                      <tr key={c.id} className="border-b border-border-subtle/50 hover:bg-surface-elevated/40">
                        <td className="py-3">
                          <PlatformBadge platform={c.platform} />
                        </td>
                        <td className="py-3 font-semibold text-primary max-w-[200px] truncate">{c.title}</td>
                        <td className="py-3 font-mono text-secondary truncate max-w-[150px]">{c.repository}</td>
                        <td className="py-3">
                          <StatusPill status={c.status} />
                        </td>
                        <td className="py-3 text-right space-x-1.5 shrink-0">
                          <button
                            onClick={() => handleEditContribution(c)}
                            className="p-1 rounded hover:bg-surface-elevated text-secondary hover:text-accent"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteContribution(c.id)}
                            className="p-1 rounded hover:bg-surface-elevated text-secondary hover:text-status-rejected"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {/* Tab 2: Write Reviewer Feedback */}
          {!isEditing && activeTab === "reviewers" ? (
            <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-6">
              <div className="border-b border-border-subtle pb-4">
                <h2 className="text-sm font-semibold text-primary">Log Reviewer Feedback Note</h2>
                <p className="text-[11px] text-secondary mt-0.5">Add feedback cards directly inside data/reviewers.json</p>
              </div>

              <form onSubmit={handleSaveReviewerFeedback} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-secondary">Reviewer Name:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LydiaPintscher"
                      value={rName}
                      onChange={(e) => setRName(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-secondary">Platform:</label>
                    <select
                      value={rPlatform}
                      onChange={(e) => setRPlatform(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary focus:outline-none"
                    >
                      <option value="github">GitHub</option>
                      <option value="gitlab">GitLab</option>
                      <option value="gerrit">Gerrit</option>
                      <option value="wikipedia">Wikimedia</option>
                      <option value="phabricator">Phabricator</option>
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-secondary">Feedback Text Note:</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Cite primary resources wherever possible."
                      value={rFeedbackText}
                      onChange={(e) => setRFeedbackText(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs font-sans focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-secondary">Category:</label>
                    <select
                      value={rCategory}
                      onChange={(e) => setRCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary focus:outline-none"
                    >
                      <option value="code_style">Code Style</option>
                      <option value="process">Process & CI</option>
                      <option value="domain_knowledge">Domain Knowledge</option>
                      <option value="tooling">Tooling & Tests</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-secondary">Applied in (Contribution IDs, comma-separated):</label>
                    <input
                      type="text"
                      placeholder="e.g. c_005"
                      value={rAppliesIn}
                      onChange={(e) => setRAppliesIn(e.target.value)}
                      className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4 sm:col-span-2">
                    <input
                      type="checkbox"
                      id="internalized"
                      checked={rInternalized}
                      onChange={(e) => setRInternalized(e.target.checked)}
                      className="h-4 w-4 accent-accent"
                    />
                    <label htmlFor="internalized" className="text-secondary select-none font-sans text-xs">
                      Mark this review as applied and internalized
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-subtle flex justify-end font-sans">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-btn bg-accent text-white hover:bg-accent-hover text-xs font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <Save className="h-4 w-4" />
                    Save Feedback
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {/* Tab 3: Write Markdown Journal entry */}
          {!isEditing && activeTab === "journal" ? (
            <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-6">
              <div className="border-b border-border-subtle pb-4">
                <h2 className="text-sm font-semibold text-primary">Write Learning Journal markdown</h2>
                <p className="text-[11px] text-secondary mt-0.5">Saves markdown file directly under data/journal/</p>
              </div>

              <form onSubmit={handleSaveJournal} className="space-y-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-secondary">Entry Date (saves as YYYY-MM-DD.md):</label>
                  <input
                    type="date"
                    required
                    value={jDate}
                    onChange={(e) => setJDate(e.target.value)}
                    className="px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-secondary">Markdown Content:</label>
                  <textarea
                    required
                    rows={12}
                    placeholder="# Learning Journal: 18 June 2026..."
                    value={jContent}
                    onChange={(e) => setJContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-btn border border-border-subtle bg-surface-elevated text-primary text-xs font-mono focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-border-subtle flex justify-end font-sans">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-btn bg-accent text-white hover:bg-accent-hover text-xs font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <FileCheck className="h-4 w-4" />
                    Save Markdown Note
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {/* Tab 4: Achievements */}
          {!isEditing && activeTab === "achievements" ? (
            <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <div>
                  <h2 className="text-sm font-semibold text-primary">Achievements / Milestones</h2>
                  <p className="text-[11px] text-secondary">Logged achievements inside data/achievements.json</p>
                </div>
                <button
                  onClick={() => {
                    setEditType("add");
                    setIsEditing(true);
                  }}
                  className="px-3 py-1.5 rounded-btn bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Achievement
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle text-secondary font-mono">
                      <th className="py-2.5">Tier</th>
                      <th className="py-2.5">Title</th>
                      <th className="py-2.5">Description</th>
                      <th className="py-2.5">Icon</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {achievements.map((a) => (
                      <tr key={a.id} className="border-b border-border-subtle/50 hover:bg-surface-elevated/40">
                        <td className="py-3 font-semibold font-mono uppercase text-secondary">{a.tier}</td>
                        <td className="py-3 font-semibold text-primary max-w-[200px] truncate">{a.title}</td>
                        <td className="py-3 text-secondary truncate max-w-[250px]">{a.description}</td>
                        <td className="py-3 font-mono text-secondary">{a.icon}</td>
                        <td className="py-3 text-right space-x-1.5 shrink-0">
                          <button
                            onClick={() => handleEditAchievement(a)}
                            className="p-1 rounded hover:bg-surface-elevated text-secondary hover:text-accent"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAchievement(a.id)}
                            className="p-1 rounded hover:bg-surface-elevated text-secondary hover:text-status-rejected"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
