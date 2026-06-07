export interface WeatherInfo {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitationPr: number; // probability 0-100
  precipitationRate: number; // mm/hour, high rates mean sudden/severe rain
  pressure: number;
  place: string;
}

export interface RainAlert {
  id: string;
  severity: "info" | "moderate" | "severe";
  title: string;
  message: string;
  timestamp: string;
  isSuddenChance: boolean;
}

export type ShelterStatus = "open" | "limited" | "full" | "closed";

export interface EmergencyShelter {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  capacityTotal: number;
  capacityUsed: number;
  status: ShelterStatus;
  hasFood: boolean;
  hasClothes: boolean;
  hasMedical: boolean;
  hasPower: boolean;
  allowsPets: boolean;
  notes?: string;
}

export type AidCategory = "food" | "clothes" | "blankets" | "medical" | "hygiene" | "other";

export interface AidRequest {
  id: string;
  requesterName: string;
  phone: string;
  location: string;
  category: AidCategory;
  urgency: "immediate" | "high" | "medium" | "low";
  headcount: number; // number of affected people needing help
  description: string;
  status: "pending" | "fulfilled";
  createdAt: string;
}

export interface AidOffer {
  id: string;
  donorName: string;
  phone: string;
  category: AidCategory;
  description: string;
  location: string;
  status: "available" | "distributed";
  createdAt: string;
}

export interface IncidentReport {
  id: string;
  type: "flooding" | "landslide" | "blocked" | "heavy-rain" | "seeking-rescue";
  reporterName: string;
  phone: string;
  location: string;
  description: string;
  headcount: number; // people stranded / displaced
  status: "verified" | "dispatched" | "resolved";
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  lat: number;
  lng: number;
  address: string;
}

