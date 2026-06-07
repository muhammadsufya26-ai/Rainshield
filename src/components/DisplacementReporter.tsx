import React, { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, MessageSquare, Phone, User, MapPin, Check, Plus, Landmark, Flame } from "lucide-react";
import { IncidentReport, UserProfile } from "../types";

interface DisplacementReporterProps {
  incidents: IncidentReport[];
  onAddIncident: (newInc: IncidentReport) => void;
  onDispatchIncident: (id: string, status: "dispatched" | "resolved") => void;
  userProfile?: UserProfile | null;
}

export default function DisplacementReporter({
  incidents,
  onAddIncident,
  onDispatchIncident,
  userProfile,
}: DisplacementReporterProps) {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [repName, setRepName] = useState(userProfile?.name || "");
  const [repPhone, setRepPhone] = useState("");
  const [repLocation, setRepLocation] = useState(userProfile?.address || "");
  const [repType, setRepType] = useState<"flooding" | "landslide" | "blocked" | "heavy-rain" | "seeking-rescue">("flooding");
  const [repHeadcount, setRepHeadcount] = useState<number>(1);
  const [repDescription, setRepDescription] = useState("");

  // Sync profile details when loaded
  useEffect(() => {
    if (userProfile) {
      setRepName(userProfile.name);
      setRepLocation(userProfile.address);
    }
  }, [userProfile]);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repName.trim() || !repLocation.trim() || !repDescription.trim()) {
      alert("Please provide reporter name, blocked location, and description.");
      return;
    }

    const created: IncidentReport = {
      id: "incident-custom-" + Date.now(),
      type: repType,
      reporterName: repName,
      phone: repPhone || "+1 (555) 911-0000",
      location: repLocation,
      description: repDescription,
      headcount: Number(repHeadcount) || 1,
      status: "verified",
      createdAt: new Date().toISOString()
    };

    onAddIncident(created);
    setShowForm(false);

    // reset fields
    setRepName("");
    setRepPhone("");
    setRepLocation("");
    setRepType("flooding");
    setRepHeadcount(1);
    setRepDescription("");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="displacement-incident-reporter">
      <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
            Active Displacement & Rescue Logging Board
          </h2>
          <p className="text-xs text-slate-400">
            Emergency sector dispatch and rescue logistics tracking for field responders
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-900/40 hover:bg-red-910/60 text-red-300 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-1.5 border border-red-800/40"
          id="toggle-incident-form-btn"
        >
          {showForm ? "Cancel Log Report" : "Lodge Emergency Incident"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleReportSubmit} className="p-5 bg-slate-950/50 border-b border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">
              LODGE STREER-LEVEL FLOODING LOG ENTRY
            </h3>
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">Reporter Name/Officer Designation *</label>
              <input
                type="text"
                required
                value={repName}
                onChange={(e) => setRepName(e.target.value)}
                placeholder="e.g. Inspector Myers or Resident Diana"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={repPhone}
                  onChange={(e) => setRepPhone(e.target.value)}
                  placeholder="e.g. (555) 911-3030"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Estimated Stranded Count *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={repHeadcount}
                  onChange={(e) => setRepHeadcount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">Exact Location Landmark *</label>
              <input
                type="text"
                required
                value={repLocation}
                onChange={(e) => setRepLocation(e.target.value)}
                placeholder="e.g. Route 9 Highway, 50m south of canal exit"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Incident Type Classification</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "flooding", label: "🌊 Flooding" },
                  { value: "landslide", label: "⛰️ Landslide" },
                  { value: "blocked", label: "❌ Road Block" },
                  { value: "heavy-rain", label: "🌧️ Huge Storm" },
                  { value: "seeking-rescue", label: "🚒 SEEK RESCUE" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRepType(item.value as any)}
                    className={`p-1.5 rounded text-[10px] font-bold border transition-all text-center ${
                      repType === item.value ? "bg-red-900/30 border-red-500 text-red-350" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">Describe Incident Scenario *</label>
              <textarea
                required
                value={repDescription}
                onChange={(e) => setRepDescription(e.target.value)}
                placeholder="e.g. Creek breached banks. Lower garage completely flooded, electrical hazard. 3 families trapped on upper level deck..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg text-xs transition-colors"
            >
              Dispatch Verification Logs
            </button>
          </div>
        </form>
      )}

      {/* active logs timeline */}
      <div className="p-4 bg-slate-900/40">
        {incidents.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No incidents filed. Safe operations maintained.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className={`bg-slate-950/50 p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  inc.status === "resolved" ? "border-slate-800/65 opacity-55" :
                  inc.type === "seeking-rescue" ? "border-red-900 bg-red-950/5" : "border-slate-800"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                      inc.status === "resolved" ? "bg-slate-800 text-slate-400 border border-slate-700/40" :
                      inc.status === "dispatched" ? "bg-blue-900/50 text-blue-300 border border-blue-800/40 animate-pulse" :
                      "bg-red-900/60 text-red-300 border border-red-800/40"
                    }`}>
                      {inc.status === "resolved" ? "Resolved" : inc.status === "dispatched" ? "🚨 EN-ROUTE DISPATCHED" : "⚠️ UNVERIFIED ENTRY"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-200 mt-2.5 flex items-center gap-1">
                    {inc.type === "seeking-rescue" && <Flame className="w-4 h-4 text-red-500 shrink-0" />}
                    {inc.type.replace("-", " ").toUpperCase()}: {inc.location}
                  </h3>
                  <p className="mt-2 text-xs text-slate-350 leading-relaxed">
                    {inc.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-850/80 flex flex-wrap gap-2 items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-900/80 border border-slate-850 px-2 py-0.5 rounded font-mono text-[10px] text-slate-400">
                      Party headcount: {inc.headcount}
                    </span>
                    <span>By: {inc.reporterName}</span>
                  </div>

                  {inc.status === "verified" && (
                    <button
                      onClick={() => onDispatchIncident(inc.id, "dispatched")}
                      className="bg-blue-950 border border-blue-900/60 font-semibold text-blue-300 rounded text-[10px] py-1 px-2.5 hover:bg-blue-900 transition-colors"
                    >
                      Dispatch Responders
                    </button>
                  )}
                  {inc.status === "dispatched" && (
                    <button
                      onClick={() => onDispatchIncident(inc.id, "resolved")}
                      className="bg-emerald-950 border border-emerald-900/60 font-semibold text-emerald-300 rounded text-[10px] py-1 px-2.5 hover:bg-emerald-900 transition-colors animate-pulse"
                    >
                      Confirm Resolved
                    </button>
                  )}
                  {inc.status === "resolved" && (
                    <div className="text-emerald-400 font-semibold flex items-center gap-1 text-[10px]">
                      <Check className="w-3.5 h-3.5" /> Incident Closed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
