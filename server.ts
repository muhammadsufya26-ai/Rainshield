import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize backend Gemini client
const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not defined in the environment. AI advisor services will run in simulation fallback mode.");
}

// ----------------------------------------------------
// API ENDPOINTS
// ----------------------------------------------------

// 1. Analyze sudden weather parameters for rapid warnings and rain status
app.post("/api/analyze-temp-storm", async (req, res) => {
  const { temp, condition, humidity, windSpeed, precipitationRate, place } = req.body;

  if (!ai) {
    // Fallback JSON in case API key is missing
    return res.json({
      severity: precipitationRate > 25 ? "severe" : precipitationRate > 10 ? "moderate" : "info",
      safeStatusRating: precipitationRate > 25 ? "DANGER" : "UNSTABLE",
      analysis: `[Simulation Fallback] The rain rate is ${precipitationRate}mm/hr at ${place || "your area"}. Seek immediate higher ground if near Nullah Lai, Malir River, or low-lying streets like Karachi's Nipa/Liaquatabad underpasses.`,
      shelterAdvice: "Proceed to the nearest Karachi Expo Centre relief camp or Edhi Welfare / Al Khidmat community shelter.",
      suppliesRecommendation: ["Bottled drinking water", "Dry dates or high-energy bars", "Waterproof drybag for CNICs/IDs"]
    });
  }

  try {
    const prompt = `
      You are an expert disaster meteorologist in Pakistan. Analyze the following local weather indicators:
      - Location Name: ${place || "Pakistan Region"}
      - Temperature: ${temp}°C
      - Condition Description: ${condition}
      - Humidity: ${humidity}%
      - Wind Speed: ${windSpeed} km/hr
      - Water Precipitation Rate: ${precipitationRate} mm/hr (Rates > 15mm/hr indicate massive intense storm cells, and > 30mm/hr represents immediate flash flooding threats in Pakistani urban storm drains and Nullahs).
      
      Provide a structured response analyzing overall severity, the direct safe status rating (SAFE, CAUTION, WATCH, or DANGER), a scientific but clear analysis paragraph for vulnerable residents, emergency guidance for seeking shelter, and necessary immediate supplies for displaced households.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["severity", "safeStatusRating", "analysis", "shelterAdvice", "suppliesRecommendation"],
          properties: {
            severity: {
              type: Type.STRING,
              description: "Assess severity: 'info', 'moderate', or 'severe'."
            },
            safeStatusRating: {
              type: Type.STRING,
              description: "Safety classification rating: 'SAFE', 'CAUTION', 'WATCH', or 'DANGER'."
            },
            analysis: {
              type: Type.STRING,
              description: "A short, compassionate 2-3 sentence analysis of current storm conditions and flooding trends for displaced families."
            },
            shelterAdvice: {
              type: Type.STRING,
              description: "Specific actionable advice regarding emergency local shelter operations under these conditions."
            },
            suppliesRecommendation: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 crucial items needed for direct humanitarian relief under high storm rates."
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Analyze Error:", error);
    res.status(500).json({ error: "Failed to query weather advisor AI", details: error.message });
  }
});

// 2. Chat and Evacuation Matcher: Create immediate evacuation instructions based on situation
app.post("/api/weather-advise", async (req, res) => {
  const { situation, currentPosition, familyHeadcount, hasSpecialNeeds, nearbyShelters } = req.body;

  if (!ai) {
    return res.json({
      adviceMarkdown: `### ⚠️ Immediate Warning Guidance (Fallback System Active)
- **Current Headcount**: ${familyHeadcount || 1} person(s).
- **Position**: ${currentPosition || "Not specified"}.
- **Action plan**: Rain levels are rising in the area. Secure important identity documents (CNIC/family certificates) inside sealed plastic bags. Prepare warm dry clothes and move valuables to higher levels of your house.
- **Shelter Advice**: Navigate to **Karachi Expo Centre Relief Camp** (University Rd), **Edhi Welfare Complex** (Sohrab Goth), or **Lahore Nishtar Stadium Complex**. Avoid low-lying underpasses like Nipa, Liaquatabad, or Mall Road. Call Rescue **1122** or Edhi **115** if stuck.
`
    });
  }

  try {
    const sheltersContextJson = JSON.stringify(nearbyShelters || []);
    const prompt = `
      You are an automated disaster response relief assistant on duty. A resident is facing emergency weather/displacement difficulty.
      
      Here are the incident specifics:
      - Current Location description: "${currentPosition || "Undefined Area"}"
      - Situation / Emergency details: "${situation || "Need shelter due to rain"}"
      - Household Count: ${familyHeadcount || 1} people
      - Specific needs / Vulnerabilities: "${hasSpecialNeeds ? "Has special elderly/kid/medical vulnerabilities" : "None indicated"}"
      - Available Near Shelters List (with capacities, statuses, features): ${sheltersContextJson}
      
      Write a highly empathetic, structured, and clear response in **Markdown**. Use bold typography and bullet points for high readability in emergency damp/rain conditions:
      1. Provide a **Direct Match** on which of the nearby shelters is most appropriate based on their features (hasFood, hasClothes, hasMedical, capacityTotal, and status). Give details!
      2. Draw a **3-Step Immediate Evacuation Checklist** detailing what physical items they must secure (like identification, clothes, clean water) and where to avoid (such as flooded subway stations or underpasses).
      3. Supply a brief comforting message reinforcing human solidarity. Keep it practical and direct.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an official Emergency Evacuation Advisor. Maintain a calm, decisive, rapid, and compassionate response tone. Always prioritize the preservation of human life.",
        temperature: 0.2
      }
    });

    res.json({ adviceMarkdown: response.text });
  } catch (error: any) {
    console.error("Gemini Advise Error:", error);
    res.status(500).json({ error: "Failed to coordinate with emergency evacuation assistant", details: error.message });
  }
});

// ----------------------------------------------------
// BOOTSTRAPPING VITE DEV SERVER VS PRODUCTION MIDDLEWARE
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("🚀 Starting in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("📦 Starting in PRODUCTION mode with compiled asset delivery...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Emergency Weather Server running on http://localhost:${PORT}`);
  });
}

startServer();
