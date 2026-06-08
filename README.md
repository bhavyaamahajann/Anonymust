# AnonyMust ☁️
> **Safe release, gentle recovery.**

AnonyMust is a premium mental health and anonymous support utility designed to help professionals express workload struggles, receive warm AI reflection support, and log daily pulse trends before burnout escalates.

This repository contains two implementations of the project UI/UX:
1. **Python Streamlit App**: Configured for instant deployment and hosting on [Streamlit Community Cloud](https://streamlit.io/).
2. **React + Express + SQLite App**: A full-stack mobile-optimized Web App with modular components, JWT authorization, and local SQLite persistence.

---

## Key Features
- **Teal Sheet Authenticated Portal**: Log In / Sign Up flows matching the brand mockup, supporting both standard Email/Password credentials and Phone verification with OTP.
- **Anonymous Community Feed**: Release stressful moments completely company-safe under randomized anonymous roles (e.g. Ops Team, Product Circle) and color-coded mood chips.
- **Warm AI Reflections**: Integrated contextual support that automatically reflects on your submitted notes based on tone (tense, frustrated, sad, hopeful, steady) to recommend actionable, tiny recovery steps.
- **Daily Pulse Tracker**: Visual indicators (bar charts and progress gauges) tracking calm/stress recovery levels over the last 7 entries.
- **Interactive Micro-interventions**: Prompts for 2-minute breathing and task prioritization resets.

---

## Project Structure
```text
Anonymust/
├── app.py                # Python Streamlit Application
├── requirements.txt      # Python dependencies for Streamlit
├── frontend/             # Vite + React Mobile-Shell Frontend
│   ├── src/
│   │   ├── contexts/     # AuthContext (JWT/OTP), ThemeContext (Light/Dark Mode)
│   │   ├── pages/        # Welcome, Login, Signup, Phone, OTP, and Dashboard views
│   │   ├── App.jsx       # Routing config
│   │   └── index.css     # Unified global UI tokens (styles, gradients, margins)
│   └── package.json
└── backend/              # Node.js + Express API Backend
    ├── src/
    │   ├── server.js     # API endpoints & mock OTP generation log
    │   └── database.js   # SQLite schema & DB initialization seed script
    └── package.json
```

---

## Getting Started

### Option A: Running the Streamlit App (Fast & Lightweight)
The Streamlit app is ready for cloud hosting and uses an SQLite backend out-of-the-box.

1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the application:
   ```bash
   streamlit run app.py
   ```

### Option B: Running the React + Node.js Application

#### 1. Start the Backend API Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server (runs on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

#### 2. Start the React Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
4. Open the browser and visit `http://localhost:5173`.

---

## Deployment

### Streamlit Community Cloud (streamlit.io)
Deploy the Python app directly from your GitHub repository:
1. Connect your GitHub account to [Streamlit Share](https://share.streamlit.io/).
2. Create a new app and link to this repository (`bhavyaamahajann/Anonymust`).
3. Set the Branch to `main` and the Main file path to `app.py`.
4. Click **Deploy**.

### GitHub Pages (For static UI preview)
Deploy static HTML versions from the main repository branch under the Pages settings on GitHub.
- Live Dashboard: `https://bhavyaamahajann.github.io/Anonymust/index.html`
- Live Auth screens: `https://bhavyaamahajann.github.io/Anonymust/login.html`
