# MonsoonMitra — GenAI Monsoon Preparedness & Citizen Assistance

## 🌊 1. Problem Statement
Every monsoon season, urban centers across India—especially low-lying and rapidly expanding cities like **Pune, Maharashtra**—face severe waterlogging, flash floods, power disruptions, and transit paralyzation. Citizens lack:
- Hyper-personalized preparedness plans tailored to household vulnerabilities (ground floor vs. upper floor, elderly/infants, vehicle ownership).
- Grounded, authoritative guidance that avoids AI hallucination during safety-critical emergencies.
- Real-time route risk assessments for daily travel across vulnerable localities.
- Decentralized citizen reporting for waterlogging and hazards.

## 💡 2. The MonsoonMitra Solution
**MonsoonMitra** is a 100% free, browser-first GenAI web application built for the **PromptWars Hackathon Challenge**. It seamlessly integrates real-time meteorological data with RAG-grounded Generative AI to guide citizens **before, during, and after** severe monsoon events.

---

## 🛠️ 3. Fully Free Technology Stack (0 Paid APIs / 0 Hosting Costs)
Every single component in MonsoonMitra is genuinely free and requires zero credit cards or billing:
- **Frontend & UI:** Modern Vanilla ES Modules + CSS Glassmorphism Design System (Mobile-first, WCAG AAA accessible, < 100 KB total bundle).
- **GenAI LLM:** **Google Gemini 2.0 Flash / 1.5 Flash** via Google AI Studio Free Tier (`aistudio.google.com`).
- **RAG & Knowledge Base:** Local client-side TF-IDF / Semantic Vector Retriever over authoritative **IMD (India Meteorological Department)**, **MSEDCL**, and **Pune Municipal Corporation (PMC)** disaster safety guidelines.
- **Live Meteorological Data:** **Open-Meteo Weather & Flood APIs** (`open-meteo.com`) — 100% free, no API key needed.
- **Interactive Mapping:** **Leaflet.js + OpenStreetMap Tiles** — free open-source interactive waterlogging & hazard reporting map.
- **State & Storage:** Local Persistent Storage (`localStorage` / IndexedDB) — zero backend hosting fees.
- **Simulated Real-Time Alerts:** Pure UI Rule Engine triggering phase-aware (**Before / During / After**) severity banners based on Open-Meteo live thresholds.

---

## ⭐ 4. Core Features & Judge Walkthrough (Under 3 Minutes)

### 1️⃣ User Onboarding & 4 One-Click Pune Demo Profiles
Instantly switch between 4 pre-loaded real-world Pune household profiles or customize your own:
- **Ramesh & Family (Kothrud near Mutha River):** Ground-floor independent house, elderly parents, pets.
- **Priya (Hinjewadi IT Commuter):** Upper-floor apartment, daily car commuter.
- **Vikram (Sinhagad Road Low-Lying Area):** Ground-floor settlement, young children, extreme flood risk.
- **Sunita (Shivaji Nagar Senior Citizen):** Differently-abled senior citizen with medical needs.

### 2️⃣ Personalized Preparedness Plan Generator
Leverages Gemini AI + user profile to generate structured checklists across 5 critical categories:
- **Documents & Essentials** | **Supplies & Rations** | **Home & Structural Safety** | **Health & Medical** | **Communication & Power**

### 3️⃣ RAG-Grounded Weather Guidance & Citations
All safety answers and recommendations retrieve context from 10 authoritative knowledge base documents (IMD color alerts, Khadakwasla dam discharge protocols, electrical safety) and cite exact sources to prevent AI hallucination.

### 4️⃣ Severity-Aware Emergency Scenarios & Alerts
Dynamic rule engine monitors Open-Meteo rainfall and wind speeds to display **Before / During / After** event alert banners and scenario action plans (*"If basement floods"*, *"If power goes out"*, *"If stranded while traveling"*).

### 5️⃣ Pune Localities Travel Advisory
Select Source & Destination across major Pune corridors (*Shivaji Nagar, Kothrud, Hinjewadi, Baner, Wakad, Hadapsar, Viman Nagar, Swargate, PCMC*) for plain-language route risk summaries.

### 6️⃣ Multilingual Native Support (English / Hindi / Marathi)
Full UI and GenAI chat support across English, Hindi (हिन्दी), and Marathi (मराठी) without external translation APIs.

### 7️⃣ Interactive Citizen Waterlogging Map
Pin and view crowdsourced waterlogging, fallen tree, and drain overflow reports across Pune on a live OpenStreetMap canvas.
