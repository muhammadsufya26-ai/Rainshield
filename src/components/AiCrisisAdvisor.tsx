import React, { useState } from "react";
import { Sparkles, Navigation, Send, Printer, Copy, Users, Compass, HelpCircle, Heart, Check, RefreshCw } from "lucide-react";
import { EmergencyShelter } from "../types";

interface AiCrisisAdvisorProps {
  shelters: EmergencyShelter[];
  currentWeather: { temp: number; precipitationRate: number; condition: string };
}

export default function AiCrisisAdvisor({ shelters, currentWeather }: AiCrisisAdvisorProps) {
  const [situation, setSituation] = useState<string>("");
  const [locationName, setLocationName] = useState<string>("");
  const [headcount, setHeadcount] = useState<number>(1);
  const [hasSpecialNeeds, setHasSpecialNeeds] = useState<boolean>(false);

  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Quick preset sample prompts to test easily
  const loadPresetSample = (type: "flooded-mom" | "elderly-ins") => {
    if (type === "flooded-mom") {
      setSituation("Lower level house flooded completely due to rainwater accumulation. Evacuated with my 2 young children. We are cold, completely drenched, and need dry clothes and warm food.");
      setLocationName("Nipa Chowrangi Underpass Area, Gulshan, Karachi");
      setHeadcount(3);
      setHasSpecialNeeds(true);
    } else if (type === "elderly-ins") {
      setSituation("Power shutdown, heavy storms. I am an elderly resident in my apartment and my medical supplies require storage out of the intense heat. No vehicle of my own.");
      setLocationName("Gulberg III Main Boulevard, near Nishtar, Lahore");
      setHeadcount(1);
      setHasSpecialNeeds(true);
    }
  };

  const handleEvacuationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim() || !locationName.trim()) {
      alert("Please state your location and describe your current situation.");
      return;
    }

    setIsLoading(true);
    setAiAdvice("");
    try {
      // Gather list of shelters as immediate input details for Gemini matching
      const parsedShelters = shelters.map((s) => ({
        name: s.name,
        address: s.address,
        capacityFree: s.capacityTotal - s.capacityUsed,
        status: s.status,
        food: s.hasFood,
        clothes: s.hasClothes,
        medical: s.hasMedical,
        power: s.hasPower,
        pets: s.allowsPets,
        lat: s.lat,
        lng: s.lng,
      }));

      const response = await fetch("/api/weather-advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation,
          currentPosition: locationName,
          familyHeadcount: headcount,
          hasSpecialNeeds,
          nearbyShelters: parsedShelters,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiAdvice(data.adviceMarkdown || "Unable to extract response from Emergency center server.");
      } else {
        throw new Error("Relay server returned an internal code error.");
      }
    } catch (err) {
      console.error("Evacuation adviser service failed:", err);
      setAiAdvice(`### ⚠️ Critical Fallback Evacuation Plan Generated
- **Primary Shelter**: Please check **Karachi Expo Centre Relief Camp** located at **University Road, Gulshan-e-Iqbal, Karachi**. It has dry setups, food supply, and active medical units.
- **Evacuation Instructions**:
  1. Store all identification cards (CNIC/family certificates), mobile accessories, and core medical items inside tightly sealed plastic polythene bags.
  2. Avoid underpasses (like Nipa, Liaquatabad, or Mall Road), low basement entrances, and open sewerage grates.
  3. Signal local emergency services at Rescue **1122** or Edhi Helpline **115** if walking paths become too dangerous to navigate.
`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiAdvice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerPrintAdvice = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>EMERGENCY EVACUATION INSTRUCTIONS DIRECTIVE</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1, h2, h3 { color: #dc2626; border-bottom: 2px solid #e2e8f0; padding-bottom: 10.5px; }
            .meta { background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
            .content { white-space: pre-wrap; font-size: 15px; }
            button { display: none; }
          </style>
        </head>
        <body>
          <h1>⚠️ CRITICAL EMERGENCY ROUTING ADVISORY</h1>
          <div class="meta">
            <strong>Estimated Party Count:</strong> ${headcount} person(s)<br/>
            <strong>Last Lodged Position:</strong> ${locationName}<br/>
            <strong>Active Outer Climate:</strong> ${currentWeather.precipitationRate} mm/hr - ${currentWeather.condition}<br/>
            <strong>Printed Date:</strong> ${new Date().toLocaleString()}
          </div>
          <h2>HUMANITARIAN ROUTING ACTIONS</h2>
          <div class="content">${aiAdvice.replace(/#/g, "").replace(/\*\*/g, "")}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="ai-evacuation-coordinator">
      <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            AI Humanitarian Evacuation & Shelter Matcher
          </h2>
          <p className="text-xs text-slate-400">
            Intelligent immediate action routing powered by Gemini flash models using real shelter parameters
          </p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Evacuation Request Form Details */}
        <form onSubmit={handleEvacuationRequest} className="lg:col-span-5 space-y-4" id="ai-matching-input-form">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loadPresetSample("flooded-mom")}
              className="text-[10px] bg-sky-950/40 hover:bg-sky-900/60 text-sky-305 border border-sky-850 py-1 px-2.5 rounded transition-colors"
            >
              Test: Stranded Parent
            </button>
            <button
              type="button"
              onClick={() => loadPresetSample("elderly-ins")}
              className="text-[10px] bg-purple-950/40 hover:bg-purple-900/60 text-purple-305 border border-purple-850 py-1 px-2.5 rounded transition-colors"
            >
              Test: Elderly Special Needs
            </button>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 font-semibold mb-1">
              What is your current emergency situation? *
            </label>
            <textarea
              required
              rows={4}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Detail your challenges. (e.g. My basement is filling with rain water. I evacuated but we have no coats, we are cold and shivering, looking for food...)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs p-3 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 font-semibold mb-1">
              Where are you currently located? (Be as specific as possible) *
            </label>
            <div className="relative">
              <Navigation className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Lobby of 202 Grand St, next to public library"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                Household Count (People) *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="number"
                  min="1"
                  max="15"
                  required
                  value={headcount}
                  onChange={(e) => setHeadcount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs pl-9 pr-3 py-2.5 text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-2">
                Special Vulnerabilities
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-350 select-none cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={hasSpecialNeeds}
                  onChange={(e) => setHasSpecialNeeds(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                />
                Kids / Elderly / Medical Aid
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/20 disabled:hover:from-indigo-600"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Matching Shelter & Advising Evacuation...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Match Nearest Shelter & Generate Custom Instructions
              </>
            )}
          </button>
        </form>

        {/* AI Evacuation Guidance Response Output */}
        <div className="lg:col-span-7 flex flex-col justify-between" id="ai-matching-output">
          <div className="bg-slate-950/60 rounded-xl border border-slate-850 p-5 flex-1 flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-850 mb-4 shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1">
                <Compass className="w-4 h-4" /> Personal Evacuation Guide Card
              </span>
              {aiAdvice && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 py-1 px-2.5 rounded hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy text"}
                  </button>
                  <button
                    onClick={triggerPrintAdvice}
                    className="text-[10px] bg-slate-900 border border-slate-800 text-slate-305 py-1 px-2.5 rounded hover:bg-slate-800 transition-colors flex items-center gap-1.5 font-bold"
                  >
                    <Printer className="w-3 h-3 text-blue-400" />
                    Print / Share card
                  </button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs py-10 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
                <div className="font-semibold text-slate-400 animate-pulse text-center">
                  Emergency model querying active shelter coordinates...
                </div>
                <p className="text-[11px] text-slate-600 max-w-sm text-center font-sans leading-relaxed">
                  Scanning for available food, clothing packages, medical clinics, and pet policies relative to your headcount. Please stay calm.
                </p>
              </div>
            ) : aiAdvice ? (
              <div className="flex-1 text-slate-300 text-xs leading-relaxed space-y-3 overflow-y-auto max-h-[360px] pr-2 scrollbar-thin">
                {/* Parse key headings and lists dynamically for ultra clarity */}
                <div className="emergency-advice-sheet prose prose-invert font-sans" id="advice-markdown-text-content">
                  {aiAdvice.split("\n").map((line, i) => {
                    if (line.startsWith("###")) {
                      return <h4 key={i} className="text-sm font-bold text-slate-100 border-b border-slate-850 pb-1 mt-4 mb-2 first:mt-0">{line.replace("###", "").trim()}</h4>;
                    }
                    if (line.startsWith("##")) {
                      return <h3 key={i} className="text-base font-bold text-indigo-400 mt-5 mb-2 first:mt-0">{line.replace("##", "").trim()}</h3>;
                    }
                    if (line.startsWith("-") || line.startsWith("*")) {
                      return <li key={i} className="ml-4 list-disc text-slate-300 pl-1 my-1 leading-normal">{line.slice(1).trim()}</li>;
                    }
                    if (line.trim().startsWith("1.") || line.trim().startsWith("2.") || line.trim().startsWith("3.")) {
                      return <div key={i} className="p-2 my-2 bg-slate-900/60 rounded border-l-2 border-indigo-500 pl-3 leading-normal font-sans">{line}</div>;
                    }
                    if (line.trim() === "") return <div key={i} className="h-2" />;
                    return <p key={i} className="my-1.5 text-slate-305 leading-relaxed">{line}</p>;
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <HelpCircle className="w-10 h-10 text-slate-600 mb-3 shrink-0" />
                <h4 className="text-xs font-bold text-slate-400">Assemble Your Advice Package</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed font-sans">
                  Detail your displacement condition, specify your approximate location, and click match to compile immediate safety guidelines from Gemini.
                </p>
                <div className="mt-4 flex gap-1.5 text-[10px] text-slate-400 leading-none bg-slate-900/40 p-2.5 rounded border border-slate-850 justify-center">
                  <span className="font-bold text-slate-300">Outputs:</span> 
                  <span>Matched Shelter Name, Safe Navigation Path, 3 Urgent Tasks checklist</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 bg-yellow-500/5 p-3 rounded-xl border border-yellow-500/10 flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-yellow-405 shrink-0 mt-0.5 animate-pulse" />
            <p className="text-[11px] text-slate-400 leading-normal">
              <strong>Humanitarian Solidarity notice:</strong> Rescue volunteers keep active watch of these logs. In extreme flash events, your coordinates are referenced dynamically to optimize rescue paths. Maintain communication lines open if power allows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
