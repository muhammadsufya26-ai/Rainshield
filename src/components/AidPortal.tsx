import React, { useState, useEffect } from "react";
import { HandHelping, Heart, Plus, ShoppingBag, User, Phone, MapPin, Check, Sparkles, Filter, Grid, Clock, AlertCircle } from "lucide-react";
import { AidRequest, AidOffer, AidCategory, UserProfile } from "../types";

interface AidPortalProps {
  requests: AidRequest[];
  offers: AidOffer[];
  onAddRequest: (newReq: AidRequest) => void;
  onAddOffer: (newOffer: AidOffer) => void;
  onFulfillRequest: (id: string) => void;
  onDistributeOffer: (id: string) => void;
  userProfile?: UserProfile | null;
}

export default function AidPortal({
  requests,
  offers,
  onAddRequest,
  onAddOffer,
  onFulfillRequest,
  onDistributeOffer,
  userProfile,
}: AidPortalProps) {
  const [activeTab, setActiveTab] = useState<"all" | "requests" | "offers">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showRequestForm, setShowRequestForm] = useState<boolean>(false);
  const [showOfferForm, setShowOfferForm] = useState<boolean>(false);

  // Form states - Request
  const [reqName, setReqName] = useState(userProfile?.name || "");
  const [reqPhone, setReqPhone] = useState("");
  const [reqLocation, setReqLocation] = useState(userProfile?.address || "");
  const [reqCategory, setReqCategory] = useState<AidCategory>("food");
  const [reqUrgency, setReqUrgency] = useState<"immediate" | "high" | "medium" | "low">("high");
  const [reqHeadcount, setReqHeadcount] = useState<number>(1);
  const [reqDescription, setReqDescription] = useState("");

  // Form states - Offer
  const [offName, setOffName] = useState(userProfile?.name || "");
  const [offPhone, setOffPhone] = useState("");
  const [offLocation, setOffLocation] = useState(userProfile?.address || "");
  const [offCategory, setOffCategory] = useState<AidCategory>("food");
  const [offDescription, setOffDescription] = useState("");

  // Automatically prefill based on logged-in credentials
  useEffect(() => {
    if (userProfile) {
      setReqName(userProfile.name);
      setReqLocation(userProfile.address);
      setOffName(userProfile.name);
      setOffLocation(userProfile.address);
    }
  }, [userProfile]);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim() || !reqLocation.trim() || !reqDescription.trim()) {
      alert("Please fill in name, location, and the item description.");
      return;
    }

    const created: AidRequest = {
      id: "req-custom-" + Date.now(),
      requesterName: reqName,
      phone: reqPhone || "+1 (555) 999-9999",
      location: reqLocation,
      category: reqCategory,
      urgency: reqUrgency,
      headcount: Number(reqHeadcount) || 1,
      description: reqDescription,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    onAddRequest(created);
    setShowRequestForm(false);

    // reset fields
    setReqName("");
    setReqPhone("");
    setReqLocation("");
    setReqCategory("food");
    setReqUrgency("high");
    setReqHeadcount(1);
    setReqDescription("");
  };

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offName.trim() || !offLocation.trim() || !offDescription.trim()) {
      alert("Please fill in your name, material pickup location, and description.");
      return;
    }

    const created: AidOffer = {
      id: "off-custom-" + Date.now(),
      donorName: offName,
      phone: offPhone || "+1 (555) 012-3456",
      category: offCategory,
      description: offDescription,
      location: offLocation,
      status: "available",
      createdAt: new Date().toISOString()
    };

    onAddOffer(created);
    setShowOfferForm(false);

    // reset fields
    setOffName("");
    setOffPhone("");
    setOffLocation("");
    setOffCategory("food");
    setOffDescription("");
  };

  // Filters logic
  const filteredRequests = requests.filter((r) => {
    const matchesCat = selectedCategory === "all" || r.category === selectedCategory;
    return matchesCat;
  });

  const filteredOffers = offers.filter((o) => {
    const matchesCat = selectedCategory === "all" || o.category === selectedCategory;
    return matchesCat;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="aid-portal-section-card">
      <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <HandHelping className="w-5 h-5 text-emerald-400" />
            Humanitarian Aid & Items Exchange Hub
          </h2>
          <p className="text-xs text-slate-400">
            Emergency requests from displaced citizens matched with volunteer clothes & food donations
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowRequestForm(!showRequestForm);
              setShowOfferForm(false);
            }}
            className="bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-1.5 border border-rose-800/40"
            id="req-assistant-toggle-btn"
          >
            <Plus className="w-3.5 h-3.5" /> Request immediate food/clothing
          </button>
          <button
            onClick={() => {
              setShowOfferForm(!showOfferForm);
              setShowRequestForm(false);
            }}
            className="bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 font-bold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center gap-1.5 border border-emerald-800/40"
            id="offer-assistant-toggle-btn"
          >
            <Plus className="w-3.5 h-3.5" /> Offer dry supplies/meals
          </button>
        </div>
      </div>

      {/* Immediate Request submission form */}
      {showRequestForm && (
        <form onSubmit={handleRequestSubmit} className="p-5 bg-slate-950/50 border-b border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> LODGE EXPEDIENT DISPLACEMENT NEED
            </h3>
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">Your Full Name (or shelter contact/helper) *</label>
              <input
                type="text"
                required
                value={reqName}
                onChange={(e) => setReqName(e.target.value)}
                placeholder="e.g. Officer Davis or Sarah Jenkins"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={reqPhone}
                  onChange={(e) => setReqPhone(e.target.value)}
                  placeholder="e.g. (555) 303-1200"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 font-semibold mb-1">Number of Displaced People *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={reqHeadcount}
                  onChange={(e) => setReqHeadcount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">Current Rescue Location *</label>
              <input
                type="text"
                required
                value={reqLocation}
                onChange={(e) => setReqLocation(e.target.value)}
                placeholder="e.g. Grand Arena Room 4B or West Underpass"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Immediate Category of Need</label>
              <div className="grid grid-cols-3 gap-2">
                {(["food", "clothes", "blankets", "medical", "hygiene", "other"] as AidCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setReqCategory(cat)}
                    className={`p-1.5 rounded text-[10px] uppercase font-bold border transition-all text-center ${
                      reqCategory === cat ? "bg-rose-900/30 border-rose-500 text-rose-350" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Crisis Urgency</label>
                <select
                  value={reqUrgency}
                  onChange={(e: any) => setReqUrgency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200 outline-none"
                >
                  <option value="immediate">🔥 Immediate (Life Danger)</option>
                  <option value="high">⚠️ High Crisis</option>
                  <option value="medium">Medium Assistance</option>
                  <option value="low">Low Standby</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">Specify requested supplies details *</label>
              <textarea
                required
                value={reqDescription}
                onChange={(e) => setReqDescription(e.target.value)}
                placeholder="e.g. Wet and cold after walking through deep floods. Need infant warmers, size 4 diaper packs, and 3 dry hoodies."
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-lg text-xs transition-colors"
            >
              Post Live Displacement Request
            </button>
          </div>
        </form>
      )}

      {/* Volunteer donation submission form */}
      {showOfferForm && (
        <form onSubmit={handleOfferSubmit} className="p-5 bg-slate-950/50 border-b border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Heart className="w-4 h-4 text-emerald-500 animate-pulse" /> DECLARE GENTLE DONATION OFFER
            </h3>
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1 font-sans">Donor Name / Agency *</label>
              <input
                type="text"
                required
                value={offName}
                onChange={(e) => setOffName(e.target.value)}
                placeholder="e.g. Arthur's Clothing Co. or Downtown Church"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">Donor Phone Number *</label>
              <input
                type="text"
                required
                value={offPhone}
                onChange={(e) => setOffPhone(e.target.value)}
                placeholder="e.g. (555) 750-1200"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">Supplies Collection Point Address *</label>
              <input
                type="text"
                required
                value={offLocation}
                onChange={(e) => setOffLocation(e.target.value)}
                placeholder="e.g. Back Alley Loading Ramp, 44 Market Row"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Offer Category</label>
              <div className="grid grid-cols-3 gap-2">
                {(["food", "clothes", "blankets", "medical", "hygiene", "other"] as AidCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setOffCategory(cat)}
                    className={`p-1.5 rounded text-[10px] uppercase font-bold border transition-all text-center ${
                      offCategory === cat ? "bg-emerald-900/30 border-emerald-500 text-emerald-350" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">Describe Supplies Quantity & Condition *</label>
              <textarea
                required
                value={offDescription}
                onChange={(e) => setOffDescription(e.target.value)}
                placeholder="e.g. 50 packs of fresh dry sandwich loaves, 4 carton boxes of dry sorted thick winter coats (adult sizes)."
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition-colors"
            >
              Post donation available for dispatch
            </button>
          </div>
        </form>
      )}

      {/* Filtering Toolbar */}
      <div className="p-4 bg-slate-900/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        {/* Tab Selection */}
        <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex">
          <button
            onClick={() => setActiveTab("all")}
            className={`text-xs py-1.5 px-3 rounded-md transition-all font-medium ${
              activeTab === "all" ? "bg-slate-800 text-white font-semibold" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            All Action Listings ({filteredRequests.length + filteredOffers.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`text-xs py-1.5 px-3 rounded-md transition-all font-medium ${
              activeTab === "requests" ? "bg-rose-950 text-rose-350 font-semibold border-b border-rose-800/20" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Requested Aid Needs ({filteredRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`text-xs py-1.5 px-3 rounded-md transition-all font-medium ${
              activeTab === "offers" ? "bg-emerald-950 text-emerald-350 font-semibold border-b border-emerald-800/20" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Donor Offers Available ({filteredOffers.length})
          </button>
        </div>

        {/* Category filtering */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-305 rounded-lg text-xs py-1.5 px-2.5 outline-none cursor-pointer"
          >
            <option value="all">Category Filter: All Items</option>
            <option value="food">Food & Rations</option>
            <option value="clothes">Dry Clothing</option>
            <option value="blankets">Warm Blankets / Bedding</option>
            <option value="medical">Medical/First Aid kits</option>
            <option value="hygiene">Hygiene / Basic Kits</option>
            <option value="other">Other Resources</option>
          </select>
        </div>
      </div>

      {/* Exchange Ledger Lists */}
      <div className="p-5 grid grid-cols-1 xl:grid-cols-2 gap-6" id="aid-listings-split-portal">
        {/* LEFT COLUMN: ACTIVE DISPLACEMENT REQUESTS */}
        {(activeTab === "all" || activeTab === "requests") && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-rose-450 flex items-center gap-1">
              <Clock className="w-4 h-4 text-rose-500" /> DISPLACED HOUSEHOLDS REQUESTS ({filteredRequests.filter(r => r.status === "pending").length} active)
            </h3>

            {filteredRequests.length === 0 ? (
              <div className="py-8 bg-slate-950/20 border border-slate-850 rounded-xl text-center text-xs text-slate-500">
                No displacement requests match this resource category.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`bg-slate-950/45 p-4 rounded-xl border transition-all ${
                      req.status === "fulfilled"
                        ? "border-slate-800 bg-slate-950/10 opacity-60"
                        : req.urgency === "immediate"
                        ? "border-red-900/80 bg-red-950/5 hover:border-red-800"
                        : "border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          req.status === "fulfilled" ? "bg-slate-700 text-slate-300" :
                          req.urgency === "immediate" ? "bg-red-900/60 text-red-300 animate-pulse border border-red-800/40" :
                          req.urgency === "high" ? "bg-amber-900/40 text-amber-300 border border-amber-800/40" : "bg-blue-900/30 text-blue-300"
                        }`}>
                          {req.status === "fulfilled" ? "Fulfilled" : req.urgency === "immediate" ? "IMMEDIATE NEED" : `${req.urgency} urgency`}
                        </span>
                        <span className="bg-slate-900 text-slate-300 text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded border border-slate-800">
                          Category: {req.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-slate-200 leading-relaxed font-medium">
                      {req.description}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-900/60 font-sans">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{req.requesterName} ({req.headcount} affected)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{req.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-slate-300 truncate">{req.location}</span>
                      </div>
                    </div>

                    {req.status === "pending" ? (
                      <button
                        onClick={() => onFulfillRequest(req.id)}
                        className="mt-3.5 w-full bg-slate-800 hover:bg-emerald-900/40 hover:text-emerald-305 text-slate-300 hover:border-emerald-800 font-bold py-1.5 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1 border border-slate-700/60"
                      >
                        <Check className="w-3.5 h-3.5" /> Dispatch Supply & Resolve
                      </button>
                    ) : (
                      <div className="mt-3.5 text-[10px] text-emerald-400 font-bold text-center bg-emerald-950/40 py-1 rounded border border-emerald-900/20 flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Handled / Items Distributed Successfully
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RIGHT COLUMN: ACTIVE VOLUNTEER DONATION OFFERS */}
        {(activeTab === "all" || activeTab === "offers") && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-450 flex items-center gap-1">
              <ShoppingBag className="w-4 h-4 text-emerald-500 animate-pulse" style={{ animationDuration: "3s" }} /> REPUTABLE DONOR RESOURCES AVAILABLE ({filteredOffers.filter(o => o.status === "available").length} active)
            </h3>

            {filteredOffers.length === 0 ? (
              <div className="py-8 bg-slate-950/20 border border-slate-850 rounded-xl text-center text-xs text-slate-500">
                No donor resources declared in this category yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredOffers.map((off) => (
                  <div
                    key={off.id}
                    className={`bg-slate-950/45 p-4 rounded-xl border transition-all ${
                      off.status === "distributed"
                        ? "border-slate-800 bg-slate-950/10 opacity-60"
                        : "border-slate-850 hover:border-slate-800 hover:bg-slate-950/60"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          off.status === "distributed" ? "bg-slate-700 text-slate-300" : "bg-emerald-900/40 text-emerald-300 h-5"
                        }`}>
                          {off.status === "distributed" ?"Allocated" : "AVAILABLE DIRECT"}
                        </span>
                        <span className="bg-slate-900 text-slate-300 text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded border border-slate-800">
                          {off.category} Gift
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(off.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-slate-350 leading-relaxed font-medium">
                      “ {off.description} ”
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-900/60 font-sans">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-slate-300 font-bold truncate">{off.donorName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{off.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-slate-300 truncate">{off.location}</span>
                      </div>
                    </div>

                    {off.status === "available" ? (
                      <button
                        onClick={() => onDistributeOffer(off.id)}
                        className="mt-3.5 w-full bg-emerald-950 text-emerald-300 hover:bg-emerald-900 font-bold py-1.5 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1 border border-emerald-800/50"
                      >
                        <Check className="w-3.5 h-3.5" /> Book Offer For Transport Dispatch
                      </button>
                    ) : (
                      <div className="mt-3.5 text-[10px] text-slate-400 text-center bg-slate-900/50 py-1 rounded border border-slate-800 font-medium">
                        All items loaded for transit delivery.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
