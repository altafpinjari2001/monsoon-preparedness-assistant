# MonsoonMitra — GenAI Monsoon Preparedness & Citizen Assistance Platform

[![Build with AI — PromptWars Challenge](https://img.shields.io/badge/Build%20with%20AI-PromptWars%20Challenge-06B6D4?style=for-the-badge&logo=google)](https://github.com/altafpinjari2001/monsoon-preparedness-assistant)
[![Live Online Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-10B981?style=for-the-badge)](https://altafpinjari2001.github.io/monsoon-preparedness-assistant/)
[![WCAG AAA Accessible](https://img.shields.io/badge/Accessibility-WCAG%20AAA%20Compliant-10B981?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Tested with Vitest](https://img.shields.io/badge/Testing-77%20Tests%20Passing-F59E0B?style=for-the-badge)](https://vitest.dev/)

---

## 🌐 Live Online Application (1-Click Access)

**Anyone can use MonsoonMitra instantly online directly in their browser without installing anything:**

👉 **Live Application URL:** [https://altafpinjari2001.github.io/monsoon-preparedness-assistant/](https://altafpinjari2001.github.io/monsoon-preparedness-assistant/)

---

## 🌧️ Overview

**MonsoonMitra** is an intelligent, 100% free, GenAI-powered web application built for the **PromptWars Hackathon Challenge** (focus region: **Pune, Maharashtra**). Designed to empower individuals, families, and communities before, during, and after severe monsoon weather events, MonsoonMitra integrates **Google Gemini AI** (structured JSON plan generation & multilingual chat) with **Open-Meteo live weather & flood forecasting APIs** and **RAG-grounded safety knowledge bases**.

Every single component in this application uses genuinely free technologies (Vanilla ES Modules, CSS Glassmorphism, Open-Meteo APIs, Leaflet + OpenStreetMap canvas, client-side RAG vector/keyword search, and client-side storage) requiring zero credit cards or backend hosting fees.

---

## ⭐ Core Features Built for PromptWars Evaluation

1. **User Onboarding & 4 One-Click Pune Demo Profiles:**
   - Switch between 4 pre-loaded real-world Pune household profiles directly on the Dashboard for instant judging in under 3 minutes:
     - **Ramesh & Family (Kothrud near Mutha River)** — Ground-floor independent house, elderly parents, pets.
     - **Priya (Hinjewadi IT Commuter)** — Upper-floor apartment, daily car commuter.
     - **Vikram (Sinhagad Road Low-Lying Area)** — Ground-floor settlement, young children, extreme flood risk.
     - **Sunita (Shivaji Nagar Senior Citizen)** — Differently-abled senior citizen with medical needs.
2. **Interactive AI Preparedness Plan Generator (`Prep Plan` tab):**
   - Click **"✨ Generate AI Personalized Plan"** to generate structured JSON checklists across 5 categories grounded in your household profile: *Documents & Essentials*, *Supplies & Rations*, *Home & Structural Safety*, *Health & Medical*, and *Communication & Power*.
3. **RAG-Grounded Weather Guidance & Citations (`AI Advisor` tab):**
   - Built-in local knowledge base of 10 authoritative IMD, MSEDCL, and Pune Municipal Corporation (PMC) disaster safety documents. Answers cite exact sources (`[Source: IMD ...]`) to eliminate hallucination.
4. **Pune Localities Travel Advisory (`Travel` tab):**
   - Source ↔ Destination route planner across 11 Pune localities (*Shivaji Nagar, Kothrud, Hinjewadi, Baner, Wakad, Hadapsar, Viman Nagar, Sinhagad Road, Camp, Swargate, PCMC*) combining Open-Meteo rainfall metrics and flood history.
5. **Citizen Community Waterlogging & Hazard Map (`Map` tab):**
   - Embedded OpenStreetMap Pune canvas with interactive crowdsourced citizen reporting for waterlogging, fallen trees, and drain overflows.
6. **Simulated Real-Time Before/During/After Alert Engine:**
   - Dynamic rule engine evaluating live Open-Meteo rainfall and wind thresholds to render interactive phase severity banners.
7. **Multilingual Native Support (English / Hindi / Marathi):**
   - Full UI localization and native Gemini AI multilingual chat in English, Hindi (हिन्दी), and Marathi (मराठी).

---

## 🏗️ Architecture & Project Structure

```
monsoon-preparedness-assistant/
├── index.html                  # Accessible entry point (semantic tags, skip-link, ARIA labels)
├── PITCH.md                    # Hackathon pitch & technical overview
├── src/
│   ├── main.js                 # Router & application lifecycle
│   ├── style.css               # Responsive design tokens & glassmorphic UI
│   ├── modules/
│   │   ├── knowledge-base.js   # 10 authoritative IMD/PMC RAG safety documents + TF-IDF retriever
│   │   ├── profiles.js         # User onboarding state & 4 Pune Demo Profiles
│   │   ├── travel.js           # Pune localities route risk engine
│   │   ├── community-map.js    # Citizen hazard reporting management
│   │   ├── alert-engine.js     # Before/During/After phase alert rules engine
│   │   ├── gemini.js           # Gemini API structured JSON & RAG chat integration
│   │   ├── weather.js          # Open-Meteo live weather API integration
│   │   ├── flood.js            # Open-Meteo GloFAS flood API integration
│   │   ├── checklist.js        # Checklist state & completion tracking
│   │   ├── budget.js           # Budget planner calculations
│   │   └── i18n.js             # Multilingual dictionary (English, Hindi, Marathi, etc.)
│   └── components/
│       ├── dashboard.js        # Dashboard view + profile cards + phase alert banners
│       ├── checklist-view.js   # Prep Plan view + Generate AI Plan button
│       ├── travel-view.js      # Pune Travel Advisory view
│       ├── community-view.js   # Citizen hazard reporting map view
│       ├── budget-view.js      # Budget planner view
│       └── advisor-view.js     # AI Advisor multilingual chat view
└── tests/                      # 77 Vitest unit tests covering all core modules
```

---

## 🚀 Getting Started & Local Development

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/altafpinjari2001/monsoon-preparedness-assistant.git
   cd monsoon-preparedness-assistant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Run Automated Unit Tests:**
   ```bash
   npm test
   ```
   Runs 77 automated unit tests across 5 suites.

5. **Build for Production:**
   ```bash
   npm run build
   ```
   Produces an optimized bundle (~36 KB gzipped).

---

## 📜 License
MIT License — Created for the Google PromptWars / Build with AI Challenge.
