# 🛰️ OrbitWatch
### Mapping Earth's invisible threat, one orbit at a time.

> Built for **Student Hackpad 2026** | Space Debris Monitoring Dashboard

---

## 🌍 What is OrbitWatch?

OrbitWatch is a real-time space debris monitoring dashboard that visualizes thousands of tracked objects orbiting Earth. With over **27,000 debris objects** traveling at speeds up to 28,000 km/h, space is becoming increasingly dangerous for satellites, the ISS, and future missions.

OrbitWatch makes this invisible threat visible — through a live 3D interactive globe, real-time data, and risk analysis tools.

---

## ✨ Features

- 🌐 **Interactive 3D Globe** — Real Earth visualization powered by CesiumJS
- 🔴 **Color-coded Risk Levels** — Red (High) / Yellow (Medium) / Green (Low)
- 🖱️ **Hover Tooltips** — Hover over any debris dot to see its details instantly
- 📋 **Click Detail Panel** — Click any dot for full debris information
- 📡 **Live Data** — Fetches real orbital data from CelesTrak via a Node.js server
- 🔍 **Search & Filter** — Search by name or filter by risk level
- 📊 **Live Stats** — Real-time count of total debris, high risk objects, and LEO objects
- 🗺️ **Table → Globe Link** — Click any row in the table to fly the camera to that object

---

## 🚀 How to Run

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- A modern browser (Chrome recommended)
- VS Code with Live Server extension

### Step 1 — Clone the repository
```bash
git clone https://github.com/Jaahnavi2005/Orbitwatch.git
cd Orbitwatch
```

### Step 2 — Install dependencies
```bash
npm install express cors
```

### Step 3 — Start the server
```bash
node server.js
```
You should see:
```
Server running on http://localhost:3000
```

### Step 4 — Open the app
- Open `index.html` with **Live Server** in VS Code
- OR open your browser and go to `http://127.0.0.1:5500/index.html`

> ⚠️ **Note:** If the server is not running, the app automatically falls back to 20 sample debris objects so it never looks broken.

---

## 🗂️ Project Structure

```
Orbitwatch/
│
├── index.html    → Main page structure and layout
├── style.css     → Dark space theme styling
├── data.js       → Fetches and processes debris data
├── globe.js      → 3D globe visualization (CesiumJS)
├── app.js        → Main controller — ties everything together
├── server.js     → Node.js backend server (bypasses CORS)
└── README.md     → You are here!
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML / CSS / JavaScript | Frontend |
| CesiumJS | 3D interactive globe |
| Node.js + Express | Backend server |
| CelesTrak API | Real orbital debris data |
| Live Server (VS Code) | Local development |

---

## 📡 Data Source

All debris data is sourced from **[CelesTrak](https://celestrak.org)** — a trusted, NASA-affiliated source that tracks orbital objects 24/7 using data from the US Space Surveillance Network.

---

## 🌌 Why This Matters

**Kessler Syndrome** — A chain reaction where debris collisions create more debris, potentially making low Earth orbit unusable for generations.

Even a **1cm piece of debris** traveling at 28,000 km/h can destroy a functioning satellite worth hundreds of millions of dollars. Growing debris clouds threaten future Moon missions, Mars missions, and the daily communications we rely on.

OrbitWatch exists to make this crisis visible and understandable.

---

## 👩‍💻 Built By

**Jaahnavi** — Student Developer
Built with ❤️ for Student Hackpad 2026


*"The Earth is what we all have in common — let's keep its orbit clean."*
