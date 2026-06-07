import React, { useState, useEffect } from "react";
import { CloudRain, MapPin, HandHelping, ShieldAlert, Sparkles, AlertTriangle, Phone, Activity, Heart, Clock, Download } from "lucide-react";
import { WeatherInfo, RainAlert, EmergencyShelter, AidRequest, AidOffer, IncidentReport, UserProfile } from "./types";
import {
  INITIAL_SHELTERS,
  INITIAL_WEATHER,
  INITIAL_AID_REQUESTS,
  INITIAL_AID_OFFERS,
  INITIAL_INCIDENT_REPORTS,
  INITIAL_RAIN_ALERTS,
  EMERGENCY_CONTACTS
} from "./data";
import WeatherWidget from "./components/WeatherWidget";
import SheltersMap from "./components/SheltersMap";
import AidPortal from "./components/AidPortal";
import AiCrisisAdvisor from "./components/AiCrisisAdvisor";
import DisplacementReporter from "./components/DisplacementReporter";
import LoginPage from "./components/LoginPage";

export default function App() {
  // --- STATE PERSISTENCE IN LOCALSTORAGE ---
  const [weather, setWeather] = useState<WeatherInfo>(() => {
    const saved = localStorage.getItem("shelters_weather");
    return saved ? JSON.parse(saved) : INITIAL_WEATHER;
  });

  const [activeAlerts, setActiveAlerts] = useState<RainAlert[]>(() => {
    const saved = localStorage.getItem("shelters_alerts");
    return saved ? JSON.parse(saved) : INITIAL_RAIN_ALERTS;
  });

  const [shelters, setShelters] = useState<EmergencyShelter[]>(() => {
    const saved = localStorage.getItem("shelters_list");
    return saved ? JSON.parse(saved) : INITIAL_SHELTERS;
  });

  const [aidRequests, setAidRequests] = useState<AidRequest[]>(() => {
    const saved = localStorage.getItem("shelters_aid_requests");
    return saved ? JSON.parse(saved) : INITIAL_AID_REQUESTS;
  });

  const [aidOffers, setAidOffers] = useState<AidOffer[]>(() => {
    const saved = localStorage.getItem("shelters_aid_offers");
    return saved ? JSON.parse(saved) : INITIAL_AID_OFFERS;
  });

  const [incidents, setIncidents] = useState<IncidentReport[]>(() => {
    const saved = localStorage.getItem("shelters_incidents");
    return saved ? JSON.parse(saved) : INITIAL_INCIDENT_REPORTS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("shelters_user_profile");
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation Panel Tab State
  const [activeTab, setActiveTab] = useState<"weather" | "shelters" | "aid" | "incidents" | "ai">("weather");

  // Sync state mutations to LocalStorage
  useEffect(() => {
    localStorage.setItem("shelters_weather", JSON.stringify(weather));
  }, [weather]);

  useEffect(() => {
    localStorage.setItem("shelters_alerts", JSON.stringify(activeAlerts));
  }, [activeAlerts]);

  useEffect(() => {
    localStorage.setItem("shelters_list", JSON.stringify(shelters));
  }, [shelters]);

  useEffect(() => {
    localStorage.setItem("shelters_aid_requests", JSON.stringify(aidRequests));
  }, [aidRequests]);

  useEffect(() => {
    localStorage.setItem("shelters_aid_offers", JSON.stringify(aidOffers));
  }, [aidOffers]);

  useEffect(() => {
    localStorage.setItem("shelters_incidents", JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem("shelters_user_profile", JSON.stringify(userProfile));
    } else {
      localStorage.removeItem("shelters_user_profile");
    }
  }, [userProfile]);

  // --- ACTIONS HANDLERS ---
  const handleWeatherUpdate = (updated: WeatherInfo) => {
    setWeather(updated);
  };

  const handleTriggerAlert = (alert: RainAlert) => {
    if (!activeAlerts.some((a) => a.id === alert.id)) {
      setActiveAlerts((prev) => [alert, ...prev]);
    }
  };

  const handleClearAlerts = () => {
    setActiveAlerts([]);
  };

  // Shelters
  const handleAddShelter = (newShelter: EmergencyShelter) => {
    setShelters((prev) => [newShelter, ...prev]);
  };

  const handleUpdateShelterCapacity = (id: string, capacityUsed: number) => {
    setShelters((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const clampedUsed = Math.max(0, Math.min(s.capacityTotal, capacityUsed));
          const updatedStatus =
            clampedUsed >= s.capacityTotal ? "full" : clampedUsed > s.capacityTotal * 0.8 ? "limited" : "open";
          return { ...s, capacityUsed: clampedUsed, status: updatedStatus };
        }
        return s;
      })
    );
  };

  // Aid requests
  const handleAddAidRequest = (newReq: AidRequest) => {
    setAidRequests((prev) => [newReq, ...prev]);
    // Also trigger alert on extreme immediate requests
    if (newReq.urgency === "immediate") {
      handleTriggerAlert({
        id: "alert-req-" + newReq.id,
        severity: "severe",
        title: `URGENCY: Families need displacement aid at ${newReq.location}`,
        message: `${newReq.requesterName} reported: "${newReq.description}"`,
        timestamp: new Date().toISOString(),
        isSuddenChance: true,
      });
    }
  };

  const handleAddAidOffer = (newOffer: AidOffer) => {
    setAidOffers((prev) => [newOffer, ...prev]);
  };

  const handleFulfillAidRequest = (id: string) => {
    setAidRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "fulfilled" } : r)));
  };

  const handleDistributeAidOffer = (id: string) => {
    setAidOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status: "distributed" } : o)));
  };

  // Incidents
  const handleAddIncident = (newInc: IncidentReport) => {
    setIncidents((prev) => [newInc, ...prev]);
    // Trigger alarm feed on heavy stranded citizen cases
    if (newInc.type === "seeking-rescue" && newInc.headcount > 3) {
      handleTriggerAlert({
        id: "alert-inc-" + newInc.id,
        severity: "severe",
        title: `CRITICAL RESCUE LODGE: ${newInc.location}`,
        message: `${newInc.reporterName} reported: "${newInc.description}" for ${newInc.headcount} citizens stranded.`,
        timestamp: new Date().toISOString(),
        isSuddenChance: true,
      });
    }
  };

  const handleDispatchIncident = (id: string, status: "dispatched" | "resolved") => {
    setIncidents((prev) => prev.map((inc) => (inc.id === id ? { ...inc, status } : inc)));
  };

  // Summary Metrics Calculations
  const totalShelterSpaces = shelters.reduce((acc, curr) => (curr.status !== "closed" ? acc + curr.capacityTotal : acc), 0);
  const totalShelterDisplaced = shelters.reduce((acc, curr) => (curr.status !== "closed" ? acc + curr.capacityUsed : acc), 0);
  const activeDeficitPercent = totalShelterSpaces > 0 ? (totalShelterDisplaced / totalShelterSpaces) * 100 : 0;

  const urgentRequestsCount = aidRequests.filter((r) => r.status === "pending" && (r.urgency === "immediate" || r.urgency === "high")).length;
  const verifiedStrandedCount = incidents
    .filter((inc) => inc.status !== "resolved")
    .reduce((acc, curr) => acc + curr.headcount, 0);

  const handleExportData = () => {
    const reportData = {
      exportTimestamp: new Date().toISOString(),
      weather,
      activeAlerts,
      shelters,
      aidRequests,
      aidOffers,
      incidents,
      summaryMetrics: {
        totalShelterSpaces,
        totalShelterDisplaced,
        accommodationFillRate: `${activeDeficitPercent.toFixed(1)}%`,
        unmetPriorityBundles: urgentRequestsCount,
        trappedLivesCount: verifiedStrandedCount,
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `crisis_tactical_report_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="application-container-root">
      {!userProfile ? (
        <LoginPage onLogin={setUserProfile} />
      ) : (
        <>
          {/* HEADER COMMAND STATION BLOCK */}
          <header className="bg-white/95 border-b border-slate-200 backdrop-blur-md sticky top-0 z-40 px-4 py-4 md:px-8 shadow-sm">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CloudRain className="w-7 h-7 text-indigo-600 shrink-0" />
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                    Rain & Refuge <span className="text-indigo-650 font-extrabold text-sm ml-1.5 uppercase bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 tracking-wider">Tactical Hub</span>
                  </h1>
                </div>
                <p className="text-xs text-slate-500 mt-1 select-none">
                  Active Severe Weather Rain Alerts • Emergency Shelter Routing • Humanitarian Material Logistics
                </p>

                {/* ACTIVE USER PROFILE STRIP */}
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full text-slate-600 font-sans w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active Session: <strong className="text-slate-800">{userProfile.name}</strong> <span className="text-slate-400">({userProfile.email})</span></span>
                  <span className="text-slate-300">|</span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Coordinates: <strong>{userProfile.lat.toFixed(4)}, {userProfile.lng.toFixed(4)}</strong></span>
                  </span>
                  <button
                    onClick={() => setUserProfile(null)}
                    className="ml-2 text-[10px] font-extrabold text-red-700 hover:text-red-800 bg-red-50 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-50 border border-red-200/80 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
                    id="profile-disconnect-btn"
                  >
                    Disconnect Station
                  </button>
                </div>
              </div>

          {/* Quick Metrics display */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="bg-slate-100/80 px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-2.5 shadow-sm" id="total-bed-occupancy">
              <div className="text-right">
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-semibold">Accommodations Fill Rate</span>
                <span className="text-slate-800 font-bold">{totalShelterDisplaced} / {totalShelterSpaces} Beds</span>
              </div>
              <div className="relative w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-[10px] bg-white shadow-sm">
                <span className="font-bold text-indigo-600">{activeDeficitPercent.toFixed(0)}%</span>
                <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="transparent"
                    stroke="#eae1ff"
                    strokeWidth="2"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="transparent"
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                    strokeDasharray="88"
                    strokeDashoffset={88 - (88 * Math.min(activeDeficitPercent, 100)) / 100}
                  />
                </svg>
              </div>
            </div>

            <div className="bg-slate-100/80 px-3 py-2 rounded-xl border border-slate-200 shadow-sm" id="urgent-mat-demands">
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-semibold">Crises Unmet Needs</span>
              <span className="text-red-650 font-bold text-sm block">
                {urgentRequestsCount} Priority Bundles
              </span>
            </div>

            <div className="bg-slate-100/80 px-3 py-2 rounded-xl border border-slate-200 shadow-sm" id="verified-stranded-headcount">
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-semibold">Stranded In Fields</span>
              <span className="text-amber-650 font-bold text-sm block">
                {verifiedStrandedCount} Trapped Lives
              </span>
            </div>

            <button
              id="export-crisis-report-btn"
              onClick={handleExportData}
              className="bg-indigo-600 hover:bg-indigo-700 font-sans font-bold py-2 px-3.5 rounded-xl border border-indigo-700 text-white flex items-center justify-center gap-2 shadow-sm hover:shadow-indigo-500/10 transition-all active:scale-95 cursor-pointer h-10 text-xs"
              title="Download full JSON report of active alerts, shelters, and incidents for emergency responder relay."
            >
              <Download className="w-4 h-4 text-white" />
              <span>Export JSON Report</span>
            </button>
          </div>
        </div>
      </header>

      {/* HELPLINE EMERGENCY BAR OVERVIEW */}
      <div className="bg-red-50 px-4 py-2.5 border-b border-red-200 text-xs text-red-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
            <strong>DISASTER RESPONSE HOTLINE ROUTERS:</strong>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-slate-700">
            {EMERGENCY_CONTACTS.map((con, index) => (
              <span key={index} className="flex items-center gap-1">
                <span className="text-red-500">●</span> {con.service}: <strong className="text-slate-900">{con.phone}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* APP WORKSPACE MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* TABS SELECTOR PANEL */}
        <div className="flex flex-wrap border-b border-slate-200 gap-1" id="nav-workscreen-tabs">
          <button
            onClick={() => setActiveTab("weather")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold tracking-wider uppercase transition-all border-t-2 border-x ${
              activeTab === "weather"
                ? "bg-white text-indigo-650 border-indigo-600 border-x-slate-200"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-t-transparent border-x-transparent"
            }`}
          >
            <CloudRain className="w-4 h-4" /> Command Weather Center
          </button>
          <button
            onClick={() => setActiveTab("shelters")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold tracking-wider uppercase transition-all border-t-2 border-x ${
              activeTab === "shelters"
                ? "bg-white text-indigo-650 border-indigo-600 border-x-slate-200"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-t-transparent border-x-transparent"
            }`}
          >
            <MapPin className="w-4 h-4" /> Shelter Finder ({shelters.filter(s => s.status === 'open').length} Open)
          </button>
          <button
            onClick={() => setActiveTab("aid")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold tracking-wider uppercase transition-all border-t-2 border-x ${
              activeTab === "aid"
                ? "bg-white text-indigo-650 border-indigo-600 border-x-slate-200"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-t-transparent border-x-transparent"
            }`}
          >
            <HandHelping className="w-4 h-4" /> Food & Clothes Hub
          </button>
          <button
            onClick={() => setActiveTab("incidents")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold tracking-wider uppercase transition-all border-t-2 border-x ${
              activeTab === "incidents"
                ? "bg-white text-red-600 border-red-500 border-x-slate-200"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-t-transparent border-x-transparent"
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Rescue Incident Logs ({incidents.filter(i => i.status !== 'resolved').length} Open)
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-extrabold tracking-wider uppercase transition-all border-t-2 border-x ${
              activeTab === "ai"
                ? "bg-white text-amber-600 border-amber-500 border-x-slate-200"
                : "text-indigo-650 hover:text-slate-900 hover:bg-indigo-50 border-t-transparent border-x-transparent"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> AI Evacuation Assistant
          </button>
        </div>

        {/* WORK PANELS RENDERING */}
        <div className="min-h-[480px]">
          {activeTab === "weather" && (
            <div className="space-y-6">
              <WeatherWidget
                weather={weather}
                onWeatherChange={handleWeatherUpdate}
                activeAlerts={activeAlerts}
                onTriggerAlert={handleTriggerAlert}
                onClearAlerts={handleClearAlerts}
              />

              {/* Helpful sudden rain displacement tips */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="displacement-tips-cards">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                    1. Sudden Rain Flash Plan
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Urban flash precipitation can fill underground apartments in under 15 minutes. Instantly pack identifying documents, driver licenses, and birth certificates into airtight plastic zipper bags before exiting the flood zone.
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                    2. Finding Dry Clothing Aid
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Wear multiple wool or synthetic layers if wet. Seek charity distribution hubs or shelters displaying the <strong>Clothes Rations</strong> tag. Avoid keeping wet cotton cotton t-shirts directly on the body during windy gale drops.
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    3. Hydration & Pack Rations
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Urban flooding contaminates municipal pipelines. Do not consume raw water from affected grids. Request sealed bottled water and hot food boxes from Saylani, Al-Khidmat, or Edhi depots displayed on the <strong>Food & Clothes Hub</strong> tab.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "shelters" && (
            <SheltersMap
              shelters={shelters}
              onAddShelter={handleAddShelter}
              onUpdateShelterCapacity={handleUpdateShelterCapacity}
              userProfile={userProfile}
            />
          )}

          {activeTab === "aid" && (
            <AidPortal
              requests={aidRequests}
              offers={aidOffers}
              onAddRequest={handleAddAidRequest}
              onAddOffer={handleAddAidOffer}
              onFulfillRequest={handleFulfillAidRequest}
              onDistributeOffer={handleDistributeAidOffer}
              userProfile={userProfile}
            />
          )}

          {activeTab === "incidents" && (
            <DisplacementReporter
              incidents={incidents}
              onAddIncident={handleAddIncident}
              onDispatchIncident={handleDispatchIncident}
              userProfile={userProfile}
            />
          )}

          {activeTab === "ai" && (
            <AiCrisisAdvisor
              shelters={shelters}
              currentWeather={weather}
            />
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 md:px-8 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Emergency Weather & Shelter Coordination System. Dedicated to Pakistan disaster preparedness and rapid aid logistics.</p>
          <div className="flex gap-4 font-mono text-[10px] text-slate-400 select-none">
            <span>DISASTER RESPONSE PORTAL</span>
            <span>DATA PLATFORM STATUS: RELIEF DISPATCH TIMELINE CONNECTED</span>
          </div>
        </div>
      </footer>
        </>
      )}
    </div>
  );
}
