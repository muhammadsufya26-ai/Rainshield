import React, { useState, useEffect, useRef } from "react";
import { CloudRain, AlertTriangle, Wind, Droplets, Gauge, MapPin, Sparkles, RefreshCw } from "lucide-react";
import { WeatherInfo, RainAlert } from "../types";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface WeatherWidgetProps {
  weather: WeatherInfo;
  onWeatherChange: (updated: WeatherInfo) => void;
  activeAlerts: RainAlert[];
  onTriggerAlert: (alert: RainAlert) => void;
  onClearAlerts: () => void;
}

// Custom Tooltip component for precipitation trends chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-lg shadow-xl text-xs font-sans">
        <p className="font-bold text-slate-300 border-b border-slate-800 pb-1 mb-2">{label}</p>
        <div className="space-y-1">
          <p className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-xs inline-block"></span>
            <span className="text-slate-400">Rainfall:</span>{" "}
            <strong className="text-white font-mono">{payload[0].value} mm</strong>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block"></span>
            <span className="text-slate-400">Flood Risk:</span>{" "}
            <strong className="text-white font-mono">{payload[1].value}%</strong>
          </p>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 font-mono">
          {payload[1].value >= 75 ? "🔴 Danger Level Saturation" : payload[1].value >= 40 ? "🟡 Significant Inundation" : "🟢 Stable Ground Absorption"}
        </p>
      </div>
    );
  }
  return null;
};

export default function WeatherWidget({
  weather,
  onWeatherChange,
  activeAlerts,
  onTriggerAlert,
  onClearAlerts,
}: WeatherWidgetProps) {
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [precipRateSlider, setPrecipRateSlider] = useState<number>(weather.precipitationRate);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sweepAngleRef = useRef<number>(0);

  // Generate historical data spanning the last 7 days ending today
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    const days = [];
    const baseRainfallValues = [12.4, 18.2, 5.0, 28.6, 48.0, 31.2];
    const baseFloodRisks = [15, 25, 8, 45, 80, 65];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
      
      if (i > 0) {
        const index = 6 - i;
        days.push({
          name: label,
          precipitation: baseRainfallValues[index],
          floodRisk: baseFloodRisks[index],
        });
      } else {
        days.push({
          name: `${label} (Today)`,
          precipitation: parseFloat((weather.precipitationRate * 2.4).toFixed(1)),
          floodRisk: Math.min(100, Math.round(weather.precipitationRate * 1.8 + (weather.precipitationRate > 25 ? 10 : 5))),
        });
      }
    }
    setHistoricalData(days);
  }, [weather.precipitationRate]);

  // Sync internal slider value to weather rate changes
  useEffect(() => {
    setPrecipRateSlider(weather.precipitationRate);
  }, [weather.precipitationRate]);

  // Request Express-Gemini Weather analysis when precipitation rate or temp shifts
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchWeatherAnalysis();
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [weather.precipitationRate, weather.temp, weather.condition]);

  const fetchWeatherAnalysis = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch("/api/analyze-temp-storm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weather),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);

        // Auto-generate active alerts based on AI analysis or storm limits
        if (data.severity === "severe" && !activeAlerts.some(a => a.id === "ai-severe-storm")) {
          onTriggerAlert({
            id: "ai-severe-storm",
            severity: "severe",
            title: `CRITICAL WATER FLASH: ${data.safeStatusRating || "DANGER"}`,
            message: `${data.analysis || "Rising rainfall rate detected."} ${data.shelterAdvice}`,
            timestamp: new Date().toISOString(),
            isSuddenChance: true,
          });
        } else if (data.severity === "moderate" && !activeAlerts.some(a => a.id === "ai-moderate-storm")) {
          onTriggerAlert({
            id: "ai-moderate-storm",
            severity: "moderate",
            title: "Elevated Rain Alert System",
            message: data.analysis || "High rain conditions may cause local street blockages. Plan shelters accordingly.",
            timestamp: new Date().toISOString(),
            isSuddenChance: false,
          });
        }
      }
    } catch (e) {
      console.error("AI Weather analysis failed or returned offline fallback:", e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Animate mock weather radar grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    // Fixed rain dots of storm cells
    const cells = [
      { x: width * 0.45, y: height * 0.4, size: 28, color: "rgba(239, 68, 68, 0.4)" }, // severe red cell
      { x: width * 0.52, y: height * 0.35, size: 18, color: "rgba(220, 38, 38, 0.5)" }, 
      { x: width * 0.38, y: height * 0.52, size: 45, color: "rgba(245, 158, 11, 0.35)" }, // warning orange cell
      { x: width * 0.65, y: height * 0.65, size: 60, color: "rgba(16, 185, 129, 0.15)" }, // light rain green
    ];

    const render = () => {
      // Clear with soft light gray background
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, width, height);

      // Radar rings
      ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
      ctx.lineWidth = 1;
      const center = { x: width / 2, y: height / 2 };

      for (let r = 30; r < width / 2; r += 30) {
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Radar crosshairs
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      // Plot active rain cells if rain rate is high enough
      const severityMultiplier = weather.precipitationRate / 40;
      if (severityMultiplier > 0.05) {
        cells.forEach(cell => {
          ctx.beginPath();
          ctx.fillStyle = cell.color;
          ctx.arc(
            cell.x + Math.sin(Date.now() / 2000) * 8 * severityMultiplier,
            cell.y + Math.cos(Date.now() / 3000) * 5 * severityMultiplier,
            cell.size * (0.6 + severityMultiplier * 0.5),
            0,
            Math.PI * 2
          );
          ctx.fill();
        });
      }

      // Draw sweeping line
      sweepAngleRef.current = (sweepAngleRef.current + 0.02) % (Math.PI * 2);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(79, 70, 229, 0.8)";
      ctx.lineWidth = 2.5;
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(
        center.x + Math.cos(sweepAngleRef.current) * (width / 2),
        center.y + Math.sin(sweepAngleRef.current) * (height / 2)
      );
      ctx.stroke();

      // Sweep gradient trail
      ctx.beginPath();
      ctx.fillStyle = "rgba(79, 70, 229, 0.05)";
      ctx.moveTo(center.x, center.y);
      ctx.arc(
        center.x,
        center.y,
        width / 2,
        sweepAngleRef.current - 0.25,
        sweepAngleRef.current,
        false
      );
      ctx.fill();

      // Pulse ring warning in deep rain
      if (weather.precipitationRate > 25) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(220, 38, 38, " + (Math.abs(Math.sin(Date.now() / 300)) * 0.6) + ")";
        ctx.lineWidth = 3;
        ctx.arc(center.x, center.y, (Date.now() / 15) % (width / 2), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Compass labels
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = "#64748b";
      ctx.fillText("N", center.x - 3, 11);
      ctx.fillText("S", center.x - 3, height - 4);
      ctx.fillText("W", 4, center.y + 3);
      ctx.fillText("E", width - 11, center.y + 3);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [weather.precipitationRate]);

  // Handle manual rain simulator updates
  const handlePrecipitationSlider = (val: number) => {
    setPrecipRateSlider(val);
    let condition = "Clear Skies / Overcast";
    if (val > 30) {
      condition = "Severe Flash Torrent / Gails";
    } else if (val > 15) {
      condition = "Heavy Heavy Rain / Thunderstorm";
    } else if (val > 5) {
      condition = "Steady Rainy Rain";
    } else if (val > 0) {
      condition = "Drizzle Mist";
    }

    onWeatherChange({
      ...weather,
      precipitationRate: val,
      precipitationPr: val > 0 ? Math.min(65 + val * 2, 100) : 10,
      condition,
    });
  };

  // Weather parameters simulator presets
  const triggerPreset = (type: "clear" | "sudden" | "extreme") => {
    if (type === "clear") {
      onWeatherChange({
        temp: 34,
        condition: "Partly Cloudy / Dry",
        humidity: 65,
        windSpeed: 10,
        precipitationPr: 10,
        precipitationRate: 0,
        pressure: 1010,
        place: "Faisalabad Central, Punjab",
      });
      onClearAlerts();
    } else if (type === "sudden") {
      onWeatherChange({
        temp: 28,
        condition: "Rapid Monsoon Cloudburst",
        humidity: 92,
        windSpeed: 25,
        precipitationPr: 95,
        precipitationRate: 20, // mm/hr
        pressure: 1000,
        place: "Lahore Mall Road, Punjab",
      });
      // Add sudden alert
      onTriggerAlert({
        id: "alert-sudden",
        severity: "moderate",
        title: "Sudden Monsoon Rain Front Impact",
        message: "High-density cloudburst reported over Lahore Center. City storm drains may overflow. Prepare portable water pumps.",
        timestamp: new Date().toISOString(),
        isSuddenChance: true,
      });
    } else if (type === "extreme") {
      onWeatherChange({
        temp: 24,
        condition: "Torrential Rain & Nullah Overflows",
        humidity: 98,
        windSpeed: 45,
        precipitationPr: 100,
        precipitationRate: 50, // Critical level
        pressure: 985,
        place: "Rawalpindi Nullah Lai Basin, Pakistan",
      });
      // Add extreme alert
      onTriggerAlert({
        id: "alert-extreme",
        severity: "severe",
        title: "CRITICAL: Nullah Lai Flash Flood Threat",
        message: "Rainrate exceeds dangerous 45mm/hr threshold! Immense threat of localized flooding. Move children and elderly to designated high-ground camps immediately.",
        timestamp: new Date().toISOString(),
        isSuddenChance: true,
      });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="weather-section-card">
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse"></span>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Storm Patrol & Rain Alert Center
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time sensory inputs for emergency displacement preparedness
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => triggerPreset("clear")}
            className="text-xs bg-slate-150 hover:bg-slate-200 text-slate-700 font-medium py-1.5 px-3 rounded-lg transition-colors border border-slate-200 bg-slate-100"
            id="preset-clear-btn"
          >
            Clear Sky (Test)
          </button>
          <button
            onClick={() => triggerPreset("sudden")}
            className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium py-1.5 px-3 rounded-lg transition-colors border border-amber-200 animate-pulse"
            id="preset-sudden-btn"
          >
            Sudden Rain (Test)
          </button>
          <button
            onClick={() => triggerPreset("extreme")}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-800 font-medium py-1.5 px-3 rounded-lg transition-colors border border-red-200 font-bold"
            id="preset-extreme-btn"
          >
            Disastrous Storm (Test)
          </button>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Core metrics and simulator controls */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm" id="weather-stat-precipitation">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Rain Rate</span>
                <CloudRain className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-950 tracking-tight">
                  {weather.precipitationRate}
                </span>
                <span className="text-xs text-slate-500 ml-1">mm/hr</span>
              </div>
              <div className="mt-2 text-[10px]">
                {weather.precipitationRate > 25 ? (
                  <span className="text-red-700 font-bold">⚠️ Critical Torrent</span>
                ) : weather.precipitationRate > 10 ? (
                  <span className="text-amber-700 font-medium">⚠️ Heavy Storms</span>
                ) : (
                  <span className="text-emerald-700 font-medium">Stable Levels</span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm" id="weather-stat-temp">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Temp</span>
                <Gauge className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-950 tracking-tight">
                  {weather.temp}°C
                </span>
                <span className="text-xs text-slate-500 ml-1">Outdoor</span>
              </div>
              <div className="mt-2 text-[10px] text-slate-500">
                Subtropical monsoon temperature levels
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm" id="weather-stat-wind">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Wind Speed</span>
                <Wind className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-950 tracking-tight">
                  {weather.windSpeed}
                </span>
                <span className="text-xs text-slate-500 ml-1">km/h</span>
              </div>
              <div className="mt-2 text-[10px] text-slate-500">
                {weather.windSpeed > 35 ? "Dangerous gusts" : "Moderate breeze"}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm" id="weather-stat-humidity">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Humidity</span>
                <Droplets className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-950 tracking-tight">
                  {weather.humidity}%
                </span>
                <span className="text-xs text-slate-500 ml-1">RH</span>
              </div>
              <div className="mt-2 text-[10px] text-slate-500">
                Dew point saturation complete
              </div>
            </div>
          </div>

          {/* Interactive Simulation Slider */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200" id="weather-simulator-slider">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-700 font-bold flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: "12s" }} />
                Interactive Precipitation Level Simulator
              </label>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                {weather.precipitationRate} mm/hour rate
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={precipRateSlider}
              onChange={(e) => handlePrecipitationSlider(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              id="precipitation-range-slider"
            />
            <div className="flex justify-between mt-1.5 text-[10px] text-slate-500 font-mono">
              <span>0 mm/hr (Clear)</span>
              <span>15 mm/hr (Moderate)</span>
              <span>30 mm/hr (Severe Storms)</span>
              <span>60 mm/hr (Extremely Severe)</span>
            </div>
            <p className="mt-3 text-[11px] text-slate-650 leading-relaxed italic bg-white p-2.5 rounded border border-slate-150 shadow-xs">
              💡 <strong>Meteorologist Note:</strong> Severe rates (&gt;30 mm/hr) simulate sudden intense cell storms which immediately alert vulnerable homeless groups, triggering flood protocols for community centers.
            </p>
          </div>

          {/* AI Weather Advisor Panel */}
          <div className="bg-indigo-50/50 p-4 border border-indigo-100 rounded-xl" id="ai-sensory-panel">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-750 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                Gemini AI Real-Time Meteorological Assessment
              </h3>
              {isLoadingAi && (
                <span className="text-[10px] text-indigo-600 flex items-center gap-1 animate-pulse font-semibold">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Analyzing conditions...
                </span>
              )}
            </div>

            {aiAnalysis ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    aiAnalysis.safeStatusRating === "DANGER" ? "bg-red-100 text-red-700 border border-red-200" :
                    aiAnalysis.safeStatusRating === "WATCH" || aiAnalysis.safeStatusRating === "UNSTABLE" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                    "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}>
                    SAFETY LEVEL: {aiAnalysis.safeStatusRating}
                  </span>
                  <span className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3" /> {weather.place}
                  </span>
                </div>
                <p className="text-xs text-slate-705 leading-relaxed bg-white p-3 rounded border border-slate-150 shadow-sm font-sans text-slate-800">
                  {aiAnalysis.analysis}
                </p>
                <div className="text-[11px] text-slate-700 grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-800 font-bold block mb-0.5">Shelter Directive:</span>
                    <p className="text-slate-600">{aiAnalysis.shelterAdvice}</p>
                  </div>
                  <div>
                    <span className="text-slate-800 font-bold block mb-0.5">Critical Evacuation Gear:</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {aiAnalysis.suppliesRecommendation?.map((sup: string, i: number) => (
                        <span key={i} className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded border border-slate-200">
                          {sup}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs font-medium">
                {isLoadingAi ? "Querying weather model..." : "Use the simulator controls to initiate weather state updates."}
              </div>
            )}
          </div>
        </div>

        {/* Localized Tactical Storm Radar Grid Map */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="flex flex-col items-center bg-slate-55 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <span className="text-xs font-semibold text-slate-600 mb-2 font-mono uppercase tracking-widest flex items-center gap-1.5 self-start">
              <AlertTriangle className={`w-3.5 h-3.5 ${weather.precipitationRate > 25 ? "text-red-650 animate-bounce" : "text-slate-500"}`} />
              Emergency Storm Radar System (Live)
            </span>
            <div className="relative w-full max-w-[240px] aspect-square rounded-full border border-slate-200 overflow-hidden shadow-inner bg-slate-100">
              <canvas
                ref={canvasRef}
                width="240"
                height="240"
                className="w-full h-full block"
                id="radar-screen-canvas"
              ></canvas>
              {weather.precipitationRate > 25 && (
                <div className="absolute inset-0 bg-red-600/5 pointer-events-none border-2 border-red-500 flex items-center justify-center animate-pulse">
                  <span className="bg-red-600 text-white font-mono text-[9px] px-2 py-0.5 rounded font-bold tracking-tight shadow-md border border-red-400">
                    SUDDEN RAIN THREAT
                  </span>
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-between w-full text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse"></span> Severe Cells</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full inline-block"></span> Local Storms</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-indigo-600 rounded-full inline-block"></span> Active Sweep</span>
            </div>
          </div>

          {/* Active Rain Warnings alerts listing */}
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Issued Flash Rain Warnings ({activeAlerts.length})
            </h4>
            {activeAlerts.length === 0 ? (
              <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-center text-xs text-slate-400">
                No sudden flooding incidents alerts currently issued.
              </div>
            ) : (
              <div className="max-h-[148px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 shadow-sm transition-all ${
                      alert.severity === "severe"
                        ? "bg-red-50 border-red-200 text-red-900"
                        : "bg-amber-50 border-amber-200 text-amber-900"
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${alert.severity === "severe" ? "text-red-650 animate-pulse" : "text-amber-600"}`} />
                    <div>
                      <div className="font-bold flex items-center justify-between gap-2">
                        <span>{alert.title}</span>
                        <span className="text-[9px] font-mono text-slate-500">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 mt-1 leading-snug">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HISTORICAL PRECIPITATION TREND & FLOOD RISK INDEX CHART */}
      <div className="border-t border-slate-200 bg-slate-50 p-5 md:p-6" id="weather-historical-chart-block">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center">
                <CloudRain className="w-4 h-4 text-indigo-600" />
              </span>
              <h3 className="text-sm md:text-base font-bold text-slate-800 font-sans">
                Accumulated Precipitation Trend & Flood Risk Index
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              7-day continuous tracking of rainfall depth in comparison with estimated regional saturation and flood risk
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-600">
              <span className="w-3 h-3 bg-indigo-600/25 border border-indigo-600 rounded-xs inline-block"></span>
              <span>Rainfall (mm)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-600">
              <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
              <span>Flood Risk (%)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          {/* Chart Core Rendering */}
          <div className="lg:col-span-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs h-[280px]" id="precipitation-recharts-container">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={historicalData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                {/* Left Y Axis (Rainfall depth) */}
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: "Rainfall (mm)", angle: -90, position: "insideLeft", offset: 10, fill: '#64748b', fontSize: 9, fontWeight: 650 }}
                />
                {/* Right Y Axis (Flood Risk %) */}
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fill: '#ef4444', fontSize: 10, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: "Flood Risk (%)", angle: 90, position: "insideRight", offset: 10, fill: '#ef4444', fontSize: 9, fontWeight: 650 }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Reference Area or Line indicating Flood Risk Danger Level (>75%) */}
                <ReferenceLine 
                  yAxisId="right"
                  y={75} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  label={{ value: "Danger Threshold (75%)", fill: '#ef4444', fontSize: 9, position: 'insideTopLeft' }} 
                />

                {/* Composed Chart Layers */}
                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="precipitation" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#rainGradient)" 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="floodRisk" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  dot={{ r: 4, stroke: '#ef4444', strokeWidth: 1, fill: '#ffffff' }}
                  activeDot={{ r: 6 }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Key Insights List sidebar */}
          <div className="lg:col-span-1 flex flex-col justify-between space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Predictive Insights
              </h4>
              <ul className="space-y-2.5 text-slate-700">
                <li className="text-[11px] leading-relaxed flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0"></span>
                  <div>
                    <strong className="text-slate-800">Ground Saturation:</strong> High previous rainfall has reduced topsoil absorption capability.
                  </div>
                </li>
                <li className="text-[11px] leading-relaxed flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0"></span>
                  <div>
                    <strong className="text-slate-800">Peak Surge Alert:</strong> Any simulation exceeding <strong className="text-indigo-700">25 mm/hr</strong> moves the live marker directly into active flood risk.
                  </div>
                </li>
                <li className="text-[11px] leading-relaxed flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                  <div>
                    <strong className="text-slate-800">Critical Drains:</strong> Major channels like Nullah Lai are pre-filled, giving citizens a 15-minute evacuation window.
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-indigo-50/50 p-4 border border-indigo-100 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block font-mono">Interactive Telemetry</span>
              <p className="text-[11px] text-slate-700 leading-snug">
                Adjusting the slide bar on the left will immediately reflect our <strong>Live Day Estimate</strong> on the chart. Give it a try to simulate a storm front!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
