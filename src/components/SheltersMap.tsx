import React, { useState, useEffect } from "react";
import { Search, MapPin, Phone, Check, X, ShieldAlert, Plus, Layers, Sparkles, Navigation, Users, Eye, EyeOff, Sliders, Waves, Activity } from "lucide-react";
import { EmergencyShelter, ShelterStatus, UserProfile } from "../types";
import { calculateDistance, CENTER_LAT, CENTER_LNG } from "../data";

const PAKISTAN_HOTSPOTS = [
  { id: "karachi", name: "Karachi Delta Hub", province: "Sindh", displacedCount: 11200, headwaters: "Malir River Overflows", rainRate: 50, lat: 24.8607, lng: 67.0011, severity: "danger", description: "Coastal surge backed by heavy cloudbursts. Low-lying metropolitan underpasses are flooded." },
  { id: "faisalabad", name: "Faisalabad Industrial Belt", province: "Punjab", displacedCount: 2800, headwaters: "Local Drain Backups", rainRate: 40, lat: 31.4504, lng: 73.1350, severity: "warning", description: "Urban drainage congestion and ponding. Iqbal Stadium shelter activated." },
  { id: "lahore", name: "Lahore Ravi Basin", province: "Punjab", displacedCount: 6400, headwaters: "Ravi stream Overflows", rainRate: 35, lat: 31.5204, lng: 74.3587, severity: "danger", description: "High-density urban precipitation causing river-bed ponding along lower ring roadways." },
  { id: "rawalpindi", name: "Rawalpindi Lai Nullah", province: "Punjab / ICT", displacedCount: 8500, headwaters: "Nullah Lai Flash Torrent", rainRate: 45, lat: 33.6007, lng: 73.0679, severity: "danger", description: "Nullah Lai stream levels rising. Red alerts for Katarian & Gwaltandi bridges." },
  { id: "peshawar", name: "Peshawar Kabul Runoff", province: "Khyber Pakhtunkhwa", displacedCount: 5900, headwaters: "Nowshera Riverside Runoff", rainRate: 30, lat: 34.0151, lng: 71.5249, severity: "warning", description: "Nowshera river levels rising rapidly. PDMA alerts active." },
  { id: "quetta", name: "Quetta Saryab Run", province: "Balochistan", displacedCount: 1200, headwaters: "Mountain Flash Mudflows", rainRate: 20, lat: 30.1798, lng: 66.9750, severity: "warning", description: "Dry-mountain runoff streams flooded. Safe high-elevation railway encampments active." },
  { id: "gilgit", name: "Gilgit Slide Block", province: "Gilgit-Baltistan", displacedCount: 800, headwaters: "Karakoram Landslides", rainRate: 15, lat: 35.9208, lng: 74.3089, severity: "info", description: "Highway blocks and sub-zero temperatures. Dry weather shelters are distributing blankets." }
];

interface SheltersMapProps {
  shelters: EmergencyShelter[];
  onAddShelter: (newShelter: EmergencyShelter) => void;
  onUpdateShelterCapacity: (id: string, capacityUsed: number) => void;
  userProfile?: UserProfile | null;
}

export default function SheltersMap({
  shelters,
  onAddShelter,
  onUpdateShelterCapacity,
  userProfile,
}: SheltersMapProps) {
  const [searchTerm, setSearchTerm] = useState<string>(userProfile?.address || "");
  const [userLat, setUserLat] = useState<number>(userProfile ? userProfile.lat : CENTER_LAT);
  const [userLng, setUserLng] = useState<number>(userProfile ? userProfile.lng : CENTER_LNG);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Sync profile coordinates when they update or on initial loading
  useEffect(() => {
    if (userProfile) {
      setUserLat(userProfile.lat);
      setUserLng(userProfile.lng);
      if (userProfile.address) {
        setSearchTerm(userProfile.address);
      }
    }
  }, [userProfile]);

  // Map visual configurations
  const [showMapVisual, setShowMapVisual] = useState<boolean>(true);
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<any | null>(null);
  const [mapIntensity, setMapIntensity] = useState<number>(3.0);
  const [showIndusHydro, setShowIndusHydro] = useState<boolean>(true);

  // Filter terms
  const [filterFood, setFilterFood] = useState<boolean>(false);
  const [filterClothes, setFilterClothes] = useState<boolean>(false);
  const [filterMedical, setFilterMedical] = useState<boolean>(false);
  const [filterPower, setFilterPower] = useState<boolean>(false);
  const [filterPets, setFilterPets] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Shelter Registration State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCapTotal, setNewCapTotal] = useState<number>(100);
  const [newLatOffset, setNewLatOffset] = useState<number>(1.2); // custom adjustments relative to center
  const [newLngOffset, setNewLngOffset] = useState<number>(-0.8);
  const [newHasFood, setNewHasFood] = useState(true);
  const [newHasClothes, setNewHasClothes] = useState(true);
  const [newHasMedical, setNewHasMedical] = useState(false);
  const [newHasPower, setNewHasPower] = useState(true);
  const [newAllowsPets, setNewAllowsPets] = useState(true);
  const [newNotes, setNewNotes] = useState("");

  // Quick positioning triggers
  const setPositionPreset = (area: "faisalabad" | "karachi" | "lahore" | "islamabad" | "peshawar" | "quetta") => {
    if (area === "faisalabad") {
      setUserLat(31.4504);
      setUserLng(73.1350);
    } else if (area === "karachi") {
      setUserLat(24.8607);
      setUserLng(67.0011);
    } else if (area === "lahore") {
      setUserLat(31.5204);
      setUserLng(74.3587);
    } else if (area === "islamabad") {
      setUserLat(33.6844);
      setUserLng(73.0479);
    } else if (area === "peshawar") {
      setUserLat(34.0151);
      setUserLng(71.5249);
    } else if (area === "quetta") {
      setUserLat(30.1798);
      setUserLng(66.9750);
    }
  };

  // Attempt real browser geolocation
  const triggerBrowserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your current browser environment.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLng(position.coords.longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation failed:", error);
        alert("Could not access browser location. Falling back to default coordinate systems.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Filter & calculate distances
  const processedShelters = shelters
    .map((shelter) => {
      const distance = calculateDistance(userLat, userLng, shelter.lat, shelter.lng);
      return { ...shelter, distance };
    })
    .filter((shelter) => {
      // search match
      const matchesSearch =
        shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shelter.address.toLowerCase().includes(searchTerm.toLowerCase());

      // resource filters
      const matchesFood = !filterFood || shelter.hasFood;
      const matchesClothes = !filterClothes || shelter.hasClothes;
      const matchesMedical = !filterMedical || shelter.hasMedical;
      const matchesPower = !filterPower || shelter.hasPower;
      const matchesPets = !filterPets || shelter.allowsPets;

      // status filters
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && (shelter.status === "open" || shelter.status === "limited")) ||
        shelter.status === statusFilter;

      return matchesSearch && matchesFood && matchesClothes && matchesMedical && matchesPower && matchesPets && matchesStatus;
    })
    .sort((a, b) => a.distance - b.distance); // Nearest first

  // Submit shelter creation
  const handleRegisterShelter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAddress.trim()) {
      alert("Please provide the emergency shelter's name and address.");
      return;
    }

    const created: EmergencyShelter = {
      id: "shelter-custom-" + Date.now(),
      name: newName,
      address: newAddress,
      phone: newPhone || "+1 (555) 019-9999",
      lat: CENTER_LAT + (newLatOffset / 100), // convert small offsets to realistic coordinates
      lng: CENTER_LNG + (newLngOffset / 100),
      capacityTotal: Number(newCapTotal) || 100,
      capacityUsed: 0,
      status: "open",
      hasFood: newHasFood,
      hasClothes: newHasClothes,
      hasMedical: newHasMedical,
      hasPower: newHasPower,
      allowsPets: newAllowsPets,
      notes: newNotes,
    };

    onAddShelter(created);
    setShowAddForm(false);

    // Reset fields
    setNewName("");
    setNewAddress("");
    setNewPhone("");
    setNewCapTotal(100);
    setNewHasFood(true);
    setNewHasClothes(true);
    setNewHasMedical(false);
    setNewHasPower(true);
    setNewAllowsPets(true);
    setNewNotes("");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="shelter-portal-wrapper">
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Accidental & Displacement Shelters Finder
          </h2>
          <p className="text-xs text-slate-500">
            Real-time dry-safe hubs, capacities, and relative distance optimization
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-550 hover:bg-indigo-705 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-1.5 border border-indigo-500 shadow-sm"
          id="toggle-add-shelter-btn"
        >
          {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAddForm ? "Cancel Registration" : "Register Temporary Shelter"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleRegisterShelter} className="p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              New shelter specifications
            </h3>
            <div>
              <label className="block text-[11px] text-slate-650 text-slate-600 font-semibold mb-1">Facility Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Faisalabad Emergency Dry Haven"
                className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-505 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 font-semibold mb-1">Street Address *</label>
              <input
                type="text"
                required
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="e.g. 102 Jail Road, Civil Lines"
                className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-505 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Emergency Phone</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+92 (300) 123-4567"
                  className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-505 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-semibold mb-1">Max Capacity Total *</label>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  required
                  value={newCapTotal}
                  onChange={(e) => setNewCapTotal(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-505 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] text-slate-600 font-semibold mb-1">Location Coordinates Modifier</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-[10px] text-slate-500">
                  Lat Grid Offset:
                  <input
                    type="number"
                    step="0.1"
                    value={newLatOffset}
                    onChange={(e) => setNewLatOffset(Number(e.target.value))}
                    className="w-full mt-1 bg-white border border-slate-200 text-xs p-1 text-slate-700"
                  />
                </label>
                <label className="text-[10px] text-slate-500">
                  Lng Grid Offset:
                  <input
                    type="number"
                    step="0.1"
                    value={newLngOffset}
                    onChange={(e) => setNewLngOffset(Number(e.target.value))}
                    className="w-full mt-1 bg-white border border-slate-200 text-xs p-1 text-slate-700"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 font-semibold mb-1.5">Available On-site Resources</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-1.5 text-slate-700 select-none cursor-pointer">
                  <input type="checkbox" checked={newHasFood} onChange={(e) => setNewHasFood(e.target.checked)} className="rounded" /> Ready Food Supply
                </label>
                <label className="flex items-center gap-1.5 text-slate-700 select-none cursor-pointer">
                  <input type="checkbox" checked={newHasClothes} onChange={(e) => setNewHasClothes(e.target.checked)} className="rounded" /> Free Clothing/Blankets
                </label>
                <label className="flex items-center gap-1.5 text-slate-700 select-none cursor-pointer">
                  <input type="checkbox" checked={newHasMedical} onChange={(e) => setNewHasMedical(e.target.checked)} className="rounded" /> First Aid/Medical Room
                </label>
                <label className="flex items-center gap-1.5 text-slate-700 select-none cursor-pointer">
                  <input type="checkbox" checked={newHasPower} onChange={(e) => setNewHasPower(e.target.checked)} className="rounded" /> Active Power charging
                </label>
                <label className="flex items-center gap-1.5 text-slate-700 select-none cursor-pointer">
                  <input type="checkbox" checked={newAllowsPets} onChange={(e) => setNewAllowsPets(e.target.checked)} className="rounded" /> Pets Welcomed
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 font-semibold mb-1">Evacuee Instruction Memo / Notes</label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Specify specific parking directions or immediate material needs..."
                rows={2}
                className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-505 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-emerald-650 bg-emerald-600 hover:bg-emerald-550 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
            >
              Add Active Shelter to Registry
            </button>
          </div>
        </form>
      )}

      {/* Geolocation Calibration Sub-header */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-500 font-medium">Relative Reference Location: </span>
            <span className="font-mono text-slate-700 font-bold bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
              {userLat.toFixed(4)}°N, {userLng.toFixed(4)}°E
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Calibrate to:</span>
          <button
            onClick={() => setPositionPreset("faisalabad")}
            className={`text-[10px] py-1 px-2.5 rounded transition-all font-medium border ${
              userLat === 31.4504 ? "bg-indigo-50 font-bold border-indigo-200 text-indigo-700 animate-pulse" : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            📍 Faisalabad (HQ)
          </button>
          <button
            onClick={() => setPositionPreset("karachi")}
            className={`text-[10px] py-1 px-2.5 rounded transition-all font-medium border ${
              userLat === 24.8607 ? "bg-indigo-50 font-bold border-indigo-200 text-indigo-700" : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            Karachi (Sindh)
          </button>
          <button
            onClick={() => setPositionPreset("lahore")}
            className={`text-[10px] py-1 px-2.5 rounded transition-all font-medium border ${
              userLat === 31.5204 ? "bg-indigo-50 font-bold border-indigo-200 text-indigo-700" : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            Lahore (Punjab)
          </button>
          <button
            onClick={() => setPositionPreset("islamabad")}
            className={`text-[10px] py-1 px-2.5 rounded transition-all font-medium border ${
              userLat === 33.6844 ? "bg-indigo-50 font-bold border-indigo-200 text-indigo-700" : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            Islamabad (ICT)
          </button>
          <button
            onClick={() => setPositionPreset("peshawar")}
            className={`text-[10px] py-1 px-2.5 rounded transition-all font-medium border ${
              userLat === 34.0151 ? "bg-indigo-50 font-bold border-indigo-200 text-indigo-700" : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            Peshawar (KPK)
          </button>
          <button
            onClick={() => setPositionPreset("quetta")}
            className={`text-[10px] py-1 px-2.5 rounded transition-all font-medium border ${
              userLat === 30.1798 ? "bg-indigo-50 font-bold border-indigo-200 text-indigo-700" : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            Quetta (Balochistan)
          </button>
          <button
            onClick={triggerBrowserLocation}
            className={`text-[10px] py-1 px-2.5 rounded transition-all font-medium border bg-emerald-50 border-emerald-250 border-emerald-200 hover:bg-emerald-100/90 text-emerald-800 flex items-center gap-1 ${
              isLocating ? "animate-pulse" : ""
            }`}
          >
            <Navigation className="w-3 h-3" />
            {isLocating ? "Locating..." : "Use Real GPS"}
          </button>
        </div>
      </div>

      {/* PAKISTAN MONSOON DISPLACEMENT HEATMAP & HYDROLOGY LAYER */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div 
          onClick={() => setShowMapVisual(!showMapVisual)}
          className="p-4 bg-slate-55 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
              🗺️ Pakistan Monsoon Displacement Heatmap Overlay
              <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[9px] px-1.5 py-0.2 rounded font-mono font-normal tracking-normal capitalize">
                D3/SVG Live Analytics Layer
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-550 text-slate-550 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              <span>{shelters.length} active shelter nodes registered cross-country</span>
            </div>
            <button className="text-slate-500 hover:text-indigo-600">
              {showMapVisual ? <EyeOff className="w-4 h-4 text-indigo-600" /> : <Eye className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {showMapVisual && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5" id="pakistan-map-panel">
            {/* Left side: Interactive SVG projection layer */}
            <div className="lg:col-span-8 flex flex-col justify-between bg-slate-100/50 p-4 rounded-xl border border-slate-200 relative overflow-hidden min-h-[420px]">
              <div className="absolute top-3 left-3 z-10 bg-white/95 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-mono select-none shadow-sm text-slate-700">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Map Configuration</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400">Glow Intensity:</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    step="0.5"
                    value={mapIntensity} 
                    onChange={(e) => setMapIntensity(parseFloat(e.target.value))}
                    className="w-16 accent-indigo-600 cursor-pointer h-1 rounded bg-slate-200" 
                  />
                  <span className="text-indigo-600 text-[10px] font-bold">{mapIntensity.toFixed(1)}x</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={showIndusHydro}
                      onChange={(e) => setShowIndusHydro(e.target.checked)}
                      className="rounded accent-blue-600"
                    />
                    <span>Indus Canal Hydrology</span>
                  </label>
                </div>
              </div>

              {/* Responsive Map Area */}
              <div className="relative flex-1 flex items-center justify-center">
                <svg 
                  viewBox="0 0 600 500" 
                  className="w-full max-w-[550px] aspect-[1.2] select-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="hydrology-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                    </linearGradient>
                    <radialGradient id="dense-shimmer-red" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                    </radialGradient>
                    <radialGradient id="dense-shimmer-amber" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </radialGradient>
                  </defs>

                  {/* 1. Pakistan Provincial Boundary Shapes */}
                  {/* Balochistan Shape Grid */}
                  <polygon 
                    points="45,410 180,240 280,310 270,355 210,430 45,430" 
                    className="fill-slate-100/90 stroke-slate-300 hover:fill-slate-100/50 transition-colors"
                  />
                  {/* Sindh Region */}
                  <polygon 
                    points="210,430 270,355 330,320 380,360 360,450 220,450" 
                    className="fill-indigo-50/60 stroke-indigo-200/50 hover:fill-indigo-50/90 transition-colors"
                  />
                  {/* Punjab Hub */}
                  <polygon 
                    points="330,320 400,240 470,210 500,165 440,140 340,185 300,230" 
                    className="fill-purple-50/50 stroke-purple-200/40 hover:fill-purple-50/80 transition-colors"
                  />
                  {/* KPK Area */}
                  <polygon 
                    points="300,230 340,185 375,130 410,110 390,60 350,90" 
                    className="fill-slate-100/80 stroke-slate-200 hover:fill-slate-100/90 transition-colors"
                  />
                  {/* Gilgit Baltistan & Kashmir Grid */}
                  <polygon 
                    points="390,60 470,60 560,40 480,120 440,135 410,110" 
                    className="fill-blue-50/40 stroke-blue-200/35 hover:fill-blue-50/70 transition-colors"
                  />

                  {/* Province Labels */}
                  <text x="110" y="360" className="fill-slate-400 font-bold tracking-widest text-[9px] uppercase font-sans">Balochistan</text>
                  <text x="270" y="420" className="fill-indigo-600/70 font-semibold tracking-widest text-[9px] uppercase font-sans">Sindh</text>
                  <text x="390" y="270" className="fill-purple-600/70 font-semibold tracking-widest text-[9px] uppercase font-sans">Punjab</text>
                  <text x="325" y="145" className="fill-slate-500/80 font-semibold tracking-widest text-[8px] uppercase font-sans">KPK</text>
                  <text x="465" y="85" className="fill-blue-600/60 font-semibold tracking-wider text-[8px] uppercase font-sans">Gilgit-Baltistan</text>

                  {/* 2. Indus Canal & Hydrology Networks */}
                  {showIndusHydro && (
                    <g>
                      {/* Indus River Main Trunk */}
                      <path 
                        d="M 500,45 L 480,55 L 465,68 L 440,105 L 398,128 L 382,175 L 348,220 L 318,275 L 292,325 L 272,365 L 252,405 L 225,438" 
                        fill="none" 
                        stroke="url(#hydrology-glow)" 
                        strokeWidth="3.2" 
                        strokeLinecap="round" 
                        className="animate-pulse"
                      />
                      {/* River label */}
                      <text x="260" y="310" transform="rotate(-62 260 310)" className="fill-blue-500/75 font-mono text-[8px] tracking-wider font-bold uppercase">Indus River Corridor</text>
                    </g>
                  )}

                  {/* 3. Heatmap Density Overlays for Displaced Communities */}
                  {PAKISTAN_HOTSPOTS.map((spot) => {
                    // Projection coordinates
                    const mapLngMin = 60.5;
                    const mapLngMax = 77.5;
                    const mapLatMin = 23.5;
                    const mapLatMax = 37.5;

                    const sx = ((spot.lng - mapLngMin) / (mapLngMax - mapLngMin)) * 600;
                    const sy = (1 - (spot.lat - mapLatMin) / (mapLatMax - mapLatMin)) * 500;
                    
                    const densityRadius = (spot.displacedCount / 12000) * 35 * mapIntensity;
                    const isDanger = spot.severity === "danger";

                    return (
                      <g 
                        key={spot.id} 
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredNode(spot)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={() => {
                          setSelectedHotspot(spot);
                          setUserLat(spot.lat);
                          setUserLng(spot.lng);
                        }}
                      >
                        {/* Shimmering Hotspot Glow */}
                        <circle 
                           cx={sx} 
                          cy={sy} 
                          r={Math.max(10, densityRadius)} 
                          fill={isDanger ? "url(#dense-shimmer-red)" : "url(#dense-shimmer-amber)"}
                        />
                        {/* Core Hotspot Pin */}
                        <circle 
                          cx={sx} 
                          cy={sy} 
                          r={isDanger ? 6 : 5} 
                          className={`${
                            isDanger ? "fill-rose-500 stroke-rose-200" : "fill-amber-500 stroke-amber-200"
                          } stroke-2 hover:scale-125 transition-transform`} 
                        />
                        {/* Pulse Ring */}
                        <circle 
                          cx={sx} 
                          cy={sy} 
                          r={isDanger ? 14 : 11} 
                          className={`fill-none stroke-2 ${
                            isDanger ? "stroke-rose-500/40 animate-ping" : "stroke-amber-500/30 animate-pulse"
                          }`}
                        />
                      </g>
                    );
                  })}

                  {/* 4. Active Registered Shelters dynamic coordinate projections */}
                  {shelters.map((shelter) => {
                    // Projection coordinates
                    const mapLngMin = 60.5;
                    const mapLngMax = 77.5;
                    const mapLatMin = 23.5;
                    const mapLatMax = 37.5;

                    const px = ((shelter.lng - mapLngMin) / (mapLngMax - mapLngMin)) * 600;
                    const py = (1 - (shelter.lat - mapLatMin) / (mapLatMax - mapLatMin)) * 500;
                    
                    // Filter off out-of-bounds nodes
                    if (px < 0 || px > 600 || py < 0 || py > 500) return null;

                    return (
                      <g key={shelter.id} className="cursor-help">
                        {/* Shelter node */}
                        <rect 
                          x={px - 4} 
                          y={py - 4} 
                          width="8" 
                          height="8" 
                          rx="1.5"
                          className="fill-emerald-500 stroke-white stroke-1 hover:fill-emerald-600 transition-colors"
                        />
                        {/* Visual indicator for open statuses */}
                        {shelter.status === "open" && (
                          <circle cx={px} cy={py} r="8" className="fill-none stroke-emerald-500/40 stroke-1 animate-ping" />
                        )}
                        <title>{shelter.name} — Status: {shelter.status}</title>
                      </g>
                    );
                  })}

                  {/* 5. Glowing GPS Reference Crosshair Target */}
                  {(() => {
                    const mapLngMin = 60.5;
                    const mapLngMax = 77.5;
                    const mapLatMin = 23.5;
                    const mapLatMax = 37.5;

                    const targetX = ((userLng - mapLngMin) / (mapLngMax - mapLngMin)) * 600;
                    const targetY = (1 - (userLat - mapLatMin) / (mapLatMax - mapLatMin)) * 500;

                    if (targetX < 0 || targetX > 600 || targetY < 0 || targetY > 500) return null;

                    return (
                      <g className="pointer-events-none opacity-90">
                        {/* Intersecting reticles */}
                        <line x1={targetX - 16} y1={targetY} x2={targetX + 16} y2={targetY} className="stroke-indigo-600 stroke-1.5" />
                        <line x1={targetX} y1={targetY - 16} x2={targetX} y2={targetY + 16} className="stroke-indigo-600 stroke-1.5" />
                        {/* Outer targeting boundary rings */}
                        <circle cx={targetX} cy={targetY} r="10" className="fill-none stroke-indigo-500 stroke-1" />
                        <circle cx={targetX} cy={targetY} r="18" className="fill-none stroke-indigo-500/30 stroke-1 animate-pulse" />
                        <circle cx={targetX} cy={targetY} r="3" className="fill-indigo-600" />
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Map Footer Metadata overlay */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 mt-2 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block border border-rose-250 border-rose-200" />
                    <span>Severe Storm & Threat ({`> 4K Displaced`})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block border border-amber-250 border-amber-200" />
                    <span>Moderate/Caution ({`< 4K Displaced`})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-550 bg-emerald-500 rounded-sm inline-block border border-emerald-250 border-emerald-200" />
                    <span>Registered Shelters</span>
                  </div>
                </div>
                <div className="text-slate-400 italic">
                  Hover to inspect • Click map hotspots to center reference coords
                </div>
              </div>
            </div>

            {/* Right side: Selected Hotspot / Detailed info-pane */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[420px]">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Regional Displacement Node
                  </h3>
                  <span className="bg-indigo-50 text-indigo-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-200 shadow-xs">
                    Live Data
                  </span>
                </div>

                {/* Display hovered node statistics, or fallback selected, or default Faisalabad */}
                {(() => {
                  const activeNode = hoveredNode || selectedHotspot || PAKISTAN_HOTSPOTS.find(h => h.id === "faisalabad");
                  
                  if (!activeNode) return null;

                  // Find registered shelters within 150km of this node
                  const nearbySheltersCount = shelters.filter(s => {
                    const d = calculateDistance(activeNode.lat, activeNode.lng, s.lat, s.lng);
                    return d < 150;
                  }).length;

                  return (
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">{activeNode.province} Province</div>
                        <h4 className="text-base font-extrabold text-slate-800 mt-0.5 tracking-tight flex items-center gap-1">
                          {activeNode.name}
                        </h4>
                      </div>

                      {/* Headcount Statbox */}
                      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                        <div className="text-[10px] text-slate-400 font-medium uppercase font-sans">Displaced / Stranded Headcount</div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-extrabold text-slate-800 tracking-tight font-mono">
                            {activeNode.displacedCount.toLocaleString()}
                          </span>
                          <span className="text-xs text-rose-600 font-bold uppercase">individuals</span>
                        </div>
                      </div>

                      {/* Storm Conditions / Meteorological metrics */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-xs">
                          <div className="text-[10px] text-slate-450 text-slate-500">Water Overflows</div>
                          <div className="font-semibold text-slate-700 mt-1 font-sans">{activeNode.headwaters}</div>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-xs">
                          <div className="text-[10px] text-slate-450 text-slate-500">Precipitation Rate</div>
                          <div className="font-semibold text-indigo-700 mt-1 font-mono">{activeNode.rainRate} mm/hr</div>
                        </div>
                      </div>

                      {/* Short Description */}
                      <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/40 p-3 rounded-lg border border-indigo-100 font-sans italic">
                        “ {activeNode.description} ”
                      </p>

                      {/* Cross references */}
                      <div className="text-xs space-y-2 border-t border-slate-200 pt-3 text-slate-500">
                        <div className="flex justify-between">
                          <span>Nearby registered shelters (150km):</span>
                          <span className="font-bold text-emerald-600">{nearbySheltersCount} facilities</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Geographic latitude coordinate:</span>
                          <span className="font-mono text-slate-600">{activeNode.lat.toFixed(4)}° N</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Geographic longitude coordinate:</span>
                          <span className="font-mono text-slate-600">{activeNode.lng.toFixed(4)}° E</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action: Calibrate reference location directly here */}
              <div className="mt-6 pt-3 border-t border-slate-200">
                {(() => {
                  const activeNode = hoveredNode || selectedHotspot || PAKISTAN_HOTSPOTS.find(h => h.id === "faisalabad");
                  if (!activeNode) return null;

                  const isCurrentlyTargeted = Math.abs(userLat - activeNode.lat) < 0.01 && Math.abs(userLng - activeNode.lng) < 0.01;

                  return (
                    <button
                      onClick={() => {
                        setUserLat(activeNode.lat);
                        setUserLng(activeNode.lng);
                      }}
                      disabled={isCurrentlyTargeted}
                      className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border leading-none cursor-pointer ${
                        isCurrentlyTargeted 
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200 cursor-default" 
                          : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-xs"
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {isCurrentlyTargeted 
                        ? `Reference center calibrated to ${activeNode.id.toUpperCase()}` 
                        : `Calibrate center GPS to ${activeNode.name}`}
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Toolbar Controls */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 shrink-0">
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-lg text-xs pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Search by shelter name, area, or road..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="md:col-span-8 flex flex-wrap gap-2 items-center justify-start md:justify-end text-xs font-bold">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-lg text-xs py-1.5 px-2.5 focus:outline-none cursor-pointer outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Map Statuses: All</option>
            <option value="open">Open Evac Points</option>
            <option value="limited">Limited Space</option>
            <option value="full">Full Capacity</option>
            <option value="closed">Inactive/Standby</option>
          </select>

          {/* Quick toggle filter tag buttons (Toggling lists) */}
          <button
            onClick={() => setFilterFood(!filterFood)}
            className={`py-1 px-2.5 rounded-full border text-xs font-semibold select-none flex items-center gap-1 transition-all cursor-pointer ${
              filterFood ? "bg-sky-50 border-sky-305 border-sky-300 text-sky-700" : "bg-white border-slate-205 border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-350 hover:border-slate-300"
            }`}
          >
            {filterFood && <Check className="w-3 h-3" />} Food Available
          </button>
          <button
            onClick={() => setFilterClothes(!filterClothes)}
            className={`py-1 px-2.5 rounded-full border text-xs font-semibold select-none flex items-center gap-1 transition-all cursor-pointer ${
              filterClothes ? "bg-amber-50 border-amber-305 border-amber-250 text-amber-700 font-semibold" : "bg-white border-slate-205 border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-350 hover:border-slate-300"
            }`}
          >
            {filterClothes && <Check className="w-3 h-3" />} Clothes Rations
          </button>
          <button
            onClick={() => setFilterMedical(!filterMedical)}
            className={`py-1 px-2.5 rounded-full border text-xs font-semibold select-none flex items-center gap-1 transition-all cursor-pointer ${
              filterMedical ? "bg-red-50 border-red-305 border-red-200 text-red-700" : "bg-white border-slate-205 border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-350 hover:border-slate-300"
            }`}
          >
            {filterMedical && <Check className="w-3 h-3" />} Medical Wing
          </button>
          <button
            onClick={() => setFilterPower(!filterPower)}
            className={`py-1 px-2.5 rounded-full border text-xs font-semibold select-none flex items-center gap-1 transition-all cursor-pointer ${
              filterPower ? "bg-yellow-50 border-yellow-250 border-yellow-200 text-yellow-700" : "bg-white border-slate-205 border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-350 hover:border-slate-300"
            }`}
          >
            {filterPower && <Check className="w-3 h-3" />} Power Generator
          </button>
          <button
            onClick={() => setFilterPets(!filterPets)}
            className={`py-1 px-2.5 rounded-full border text-xs font-semibold select-none flex items-center gap-1 transition-all cursor-pointer ${
              filterPets ? "bg-purple-50 border-purple-250 border-purple-200 text-indigo-700" : "bg-white border-slate-205 border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-350 hover:border-slate-300"
            }`}
          >
            {filterPets && <Check className="w-3 h-3" />} Pets Allowed
          </button>
        </div>
      </div>

      {/* Main Shelters List content */}
      <div className="p-4">
        {processedShelters.length === 0 ? (
          <div className="py-12 bg-slate-50 text-center border border-slate-200 rounded-xl">
            <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-600">No matched shelters matching criteria</h4>
            <p className="text-xs text-slate-500 mt-1">Adjust search strings or turn off selective resource filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="shelter-grid-lists">
            {processedShelters.map((shelter) => {
              const occupancyRate = shelter.capacityTotal > 0 ? (shelter.capacityUsed / shelter.capacityTotal) * 100 : 0;
              const isFull = shelter.status === "full" || occupancyRate >= 100;
              const isClosed = shelter.status === "closed";

              return (
                <div
                  key={shelter.id}
                  className={`bg-white rounded-xl border p-4 flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-md ${
                    isFull ? "border-red-300 bg-red-50/5" :
                    isClosed ? "border-slate-200 opacity-60 bg-slate-50" :
                    "border-slate-205 border-slate-200 hover:border-slate-350 hover:border-slate-300"
                  }`}
                  id={`shelter-item-${shelter.id}`}
                >
                  <div>
                    {/* Header: Name and Distance */}
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                        isFull ? "bg-red-100 text-red-700 border border-red-200" :
                        isClosed ? "bg-slate-100 text-slate-500 border border-slate-200" :
                        shelter.status === "limited" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                        "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}>
                        {isFull ? "FULL CAPACITY" : isClosed ? "STANDBY" : shelter.status === "limited" ? "LIMITED CAP" : "OPEN"}
                      </span>
                      <span className="text-[11px] font-mono text-slate-600 font-bold bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        {shelter.distance} km
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 mt-2.5 font-sans leading-tight">
                      {shelter.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">{shelter.address}</p>

                    {/* Contact or Notes memo */}
                    <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-600">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{shelter.phone}</span>
                    </div>

                    {/* Occupancy Progress Bar */}
                    <div className="mt-4 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${isFull ? "bg-red-500" : occupancyRate > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-505 text-slate-500 mt-1 font-mono">
                      <span>{shelter.capacityUsed} / {shelter.capacityTotal} evacuees</span>
                      <span className="font-bold">{occupancyRate.toFixed(0)}% full</span>
                    </div>

                    {/* Resource tag badges */}
                    <div className="flex flex-wrap gap-1 mt-4">
                      {shelter.hasFood && (
                        <span className="bg-sky-50 text-sky-700 text-[10px] px-2 py-0.5 rounded border border-sky-200 font-medium font-sans">Food</span>
                      )}
                      {shelter.hasClothes && (
                        <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded border border-amber-200 font-medium font-sans">Clothes</span>
                      )}
                      {shelter.hasMedical && (
                        <span className="bg-red-50 text-red-700 text-[10px] px-2 py-0.5 rounded border border-red-200 font-medium font-sans">FirstAid</span>
                      )}
                      {shelter.hasPower && (
                        <span className="bg-yellow-50 text-yellow-700 text-[10px] px-2 py-0.5 rounded border border-yellow-250 border-yellow-200 font-medium font-sans">Power</span>
                      )}
                      {shelter.allowsPets && (
                        <span className="bg-purple-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded border border-indigo-200 font-medium font-sans">PetsOk</span>
                      )}
                    </div>

                    {shelter.notes && (
                      <p className="mt-3 text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-150 leading-relaxed font-sans">
                        “ {shelter.notes} ”
                      </p>
                    )}
                  </div>

                  {/* Active adjustments panel (simulate disaster coordination) */}
                  {!isClosed && (
                    <div className="mt-4 pt-3.5 border-t border-slate-200 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 leading-none">
                        <Users className="w-3.5 h-3.5" />
                        Coordination
                      </span>
                      <div className="flex gap-1">
                        <button
                          disabled={shelter.capacityUsed <= 0}
                          onClick={() => onUpdateShelterCapacity(shelter.id, shelter.capacityUsed - 5)}
                          className="bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 font-mono text-[10px] rounded px-2 py-1 text-slate-700 font-bold border border-slate-200"
                        >
                          -5
                        </button>
                        <button
                          disabled={shelter.capacityUsed >= shelter.capacityTotal}
                          onClick={() => onUpdateShelterCapacity(shelter.id, shelter.capacityUsed + 5)}
                          className="bg-indigo-50 hover:bg-indigo-110 hover:bg-indigo-100 disabled:opacity-30 disabled:hover:bg-indigo-50 font-mono text-[10px] rounded px-2 py-1 text-indigo-700 font-bold border border-indigo-205 border-indigo-200 animate-pulse cursor-pointer"
                          style={{ animationDuration: "2500ms" }}
                        >
                          +5 Admits
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
