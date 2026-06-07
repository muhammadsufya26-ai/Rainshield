import React, { useState } from "react";
import { User, Mail, MapPin, Compass, AlertCircle, RefreshCw, Send, CheckCircle } from "lucide-react";
import { UserProfile } from "../types";

// Pakistan prominent coordinates for simulation convenience
const PAKISTAN_PRESETS = [
  { name: "Islamabad (Capital)", lat: 33.6844, lng: 73.0479, address: "Sector G-6, Islamabad, Punjab / ICT" },
  { name: "Faisalabad (Industrial Belt)", lat: 31.4504, lng: 73.1350, address: "Iqbal Stadium Road, Faisalabad, Punjab" },
  { name: "Karachi (Coastal Delta)", lat: 24.8607, lng: 67.0011, address: "Clifton Beach Rd, Karachi, Sindh" },
  { name: "Lahore (Ravi Basin Area)", lat: 31.5204, lng: 74.3587, address: "Mall Road, Lahore, Punjab" },
  { name: "Peshawar (Runoff Catchment)", lat: 34.0151, lng: 71.5249, address: "University Road, Peshawar, KPK" },
  { name: "Quetta (Mountain Flash Run)", lat: 30.1798, lng: 66.9750, address: "Saryab Road, Quetta, Balochistan" }
];

interface LoginPageProps {
  onLogin: (profile: UserProfile) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [lat, setLat] = useState<string>("31.4504"); // Default to Faisalabad centroid
  const [lng, setLng] = useState<string>("73.1350");
  const [address, setAddress] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleFetchPreciseGPS = () => {
    if (!navigator.geolocation) {
      setErrorText("Browser geolocation is not supported by your browser software.");
      return;
    }
    setIsLocating(true);
    setErrorText("");
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
        setIsLocating(false);
        setLocationSuccess(true);
        if (!address) {
          setAddress(`GPS Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
        }
      },
      (error) => {
        setIsLocating(false);
        setErrorText(
          "We could not fetch precise GPS coordinates automatically. Please select a regional preset or input coordinates manually."
        );
      },
      { enableHighAccuracy: true, timeout: 8050 }
    );
  };

  const applyPreset = (preset: typeof PAKISTAN_PRESETS[0]) => {
    setLat(preset.lat.toFixed(6));
    setLng(preset.lng.toFixed(6));
    setAddress(preset.address);
    setLocationSuccess(true);
    setErrorText("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");

    if (!name.trim()) {
      setErrorText("Please enter your name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorText("Please enter a valid email address.");
      return;
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      setErrorText("Please enter a valid Latitude coordinate (-90 to 90).");
      return;
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      setErrorText("Please enter a valid Longitude coordinate (-180 to 180).");
      return;
    }

    const finalAddress = address.trim() || `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

    // Invoke callback to set the global user profile
    onLogin({
      name: name.trim(),
      email: email.trim(),
      lat: latitude,
      lng: longitude,
      address: finalAddress,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 md:p-10 font-sans" id="login-page-container">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-20">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-650 blur-[130px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-emerald-600 blur-[130px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-white border border-slate-200/85 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
        
        {/* Left Side: Strategic Info Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-950 to-slate-900 p-8 text-white flex flex-col justify-between relative border-r border-slate-100">
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/15 pointer-events-none"></div>
          
          <div className="relative z-10 space-y-6">
            <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase bg-indigo-900/50 border border-indigo-800 px-3 py-1.5 rounded-full inline-block">
              Rapid Disasters Station
            </span>
            
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                Rain & Refuge
              </h2>
              <p className="text-indigo-200 text-xs leading-relaxed font-sans">
                A technical command module for monsoon disaster mapping, real-time humanitarian logistics, and emergency shelter routing.
              </p>
            </div>

            <div className="border-t border-indigo-900/60 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Precise Geolocation Benefits
              </h4>
              <div className="space-y-3">
                <div className="flex gap-2.5 items-start text-xs">
                  <div className="p-1 bg-indigo-950 rounded border border-indigo-800 text-indigo-400 shrink-0 mt-0.5">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-slate-300 leading-snug">
                    <strong className="text-white">Proximity Snapping:</strong> Sorts shelters, distribution hubs, and rescue cells starting from your exact coordinate.
                  </p>
                </div>
                <div className="flex gap-2.5 items-start text-xs">
                  <div className="p-1 bg-indigo-950 rounded border border-indigo-800 text-indigo-400 shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-slate-300 leading-snug">
                    <strong className="text-white">Tactical Rescue Routing:</strong> Pre-fills your current location fields inside dispatch forms.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-indigo-900/60 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>COORDINATE HUB v1.0.5</span>
            <span>SECURE ENCRYPTED</span>
          </div>
        </div>

        {/* Right Side: Interactive Login Credentials Form */}
        <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-between bg-white text-slate-800">
          <div>
            <div className="mb-6">
              <h3 className="text-lg md:text-xl font-bold text-slate-900">
                Establish Tactical Connection
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your identity and verify your coordinates to initialize the emergency portal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-sans" id="login-form-element">
              
              {/* Name field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Your Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs pl-10 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    id="login-input-name"
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Email Address (Logistics Contact)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs pl-10 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    id="login-input-email"
                  />
                </div>
              </div>

              {/* Coordinate section description */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    Determine Precise Location Coordinates
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleFetchPreciseGPS}
                    disabled={isLocating}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-55 text-white text-[10px] sm:text-xs font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                    id="login-gps-fetch-btn"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLocating ? "animate-spin" : ""}`} />
                    <span>{isLocating ? "Locating..." : "Use Live GPS"}</span>
                  </button>
                </div>

                {locationSuccess && !errorText && (
                  <div className="bg-emerald-50 text-emerald-800 text-[11px] p-2.5 rounded-lg border border-emerald-250 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Coordinates initialized successfully! Snap search distance is prepared.</span>
                  </div>
                )}

                {/* Coordinate inputs details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">LATITUDE (DECIMAL)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 31.4504"
                      value={lat}
                      onChange={(e) => {
                        setLat(e.target.value);
                        setLocationSuccess(false);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg text-xs px-2.5 py-1.5 font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">LONGITUDE (DECIMAL)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 73.1350"
                      value={lng}
                      onChange={(e) => {
                        setLng(e.target.value);
                        setLocationSuccess(false);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg text-xs px-2.5 py-1.5 font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Address representation */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">LOCAL AREA ADDRESS / AREA DESCRIPTION</label>
                  <input
                    type="text"
                    placeholder="Specific sector, block, or nearest landmark..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg text-xs px-2.5 py-1.5 text-slate-855 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* SIMULATED REGION PRESETS SHORTCUT */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Quick Simulation Presets (Pakistan)</span>
                <div className="flex flex-wrap gap-1.5">
                  {PAKISTAN_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-md border border-slate-200/80 transition-all font-medium cursor-pointer"
                    >
                      {p.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show validation or runtime geolocation error text */}
              {errorText && (
                <div className="bg-red-50 text-red-800 text-[11.5px] p-2.5 rounded-lg border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
                  <span>{errorText}</span>
                </div>
              )}

              {/* Submit triggers button */}
              <button
                type="submit"
                className="w-full bg-indigo-650 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-500/40 text-white font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                id="login-submit-button"
              >
                <Send className="w-4 h-4" />
                <span>Initialize Command Station & Connect Grid</span>
              </button>

            </form>
          </div>

          <div className="text-[10px] text-slate-400 text-center select-none pt-4 border-t border-slate-100 mt-4 leading-normal">
            By connecting, your precise location is mapped locally on this client station. Absolutely no data is sent to external advertising grids.
          </div>
        </div>

      </div>
    </div>
  );
}
