# 🏏 IPL Auction Simulator & Ball-by-Ball Analytics System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://ipl-auction-system-delta.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)](https://python.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript)](https://developer.mozilla.org)

> **AIML with Python Minor Project**  
> **Author:** Soumya Ranjan Padhi  
> **Roll No:** 25/AIML-A6/DEC-8399  
> **Batch:** December Batch &bull; InternsElite

---

## 🌟 Project Overview

This project performs exploratory data analysis (EDA) on delivery-level IPL datasets (150,000+ records) and provides an interactive, broadcast-grade **IPL Mega Auction Simulator** web application built with algorithmic bidding logic, purse management, and squad constraints.

Live URL: **[https://ipl-auction-system-delta.vercel.app/](https://ipl-auction-system-delta.vercel.app/)**

---

## ✨ Features

### 1. ⚡ Live Auction Room Simulator
- **10 Official IPL Franchises:** CSK, MI, RCB, KKR, RR, SRH, GT, LSG, DC, and PBKS with authentic brand color palettes and badges.
- **Franchise Management Mode:** Pick any team to actively manage or let all 10 franchises bid autonomously using tactical AI.
- **Dynamic Bidding Console:** Dynamic bid escalations (`+₹20L`, `+₹50L`, `+₹1.00 Cr`, `+₹2.00 Cr`) with budget reserve protection.
- **15-Second Hammer Countdown:** Tension-building visual countdown timer with sound notifications and hammer warnings.
- **Web Audio Sound Effects:** Synthesized audio for bids, ticking clocks, gavel hammer strikes, and winning fanfares.
- **40+ Curated Star Players:** Marquee players, batsmen, bowlers, all-rounders, and wicketkeepers with real IPL career statistics.
- **Auction Rules Enforced:** Maximum 25 players, minimum 18 players, maximum 8 overseas players, and strict ₹100 Crore purse cap.
- **CSV Export:** Download full auction transaction logs and team rosters with one click.

### 2. 🏆 Team Squads & Purse Ticker
- Real-time purse balances and expenditure progress bars for all 10 teams.
- Clickable franchise cards to inspect complete acquired player rosters, bought prices, and player ratings.

### 3. 📋 Player Pool Database
- Searchable and filterable player index by Set (Marquee, Batsmen, Bowlers, etc.), Role, Country, and Sale Status.

### 4. 📊 Minor Project Analytics & EDA
- **Total Runs by Innings:** 1st Innings vs 2nd Innings vs Super Overs.
- **Top 10 Batsmen by Total Runs:** Historical run aggregates featuring Virat Kohli, Suresh Raina, Rohit Sharma, and David Warner.
- **Top 10 Teams by Total Runs:** Tournament-level team scoring metrics.
- **Boundaries Comparison (4s vs 6s):** Boundary clearing frequency per team.
- **Over Progression Curve (Overs 1–20):** Scoring velocity from Powerplay through the explosive Death Overs (16–20).
- **Extras Breakdown:** Analysis of Wides, Leg Byes, No Balls, and Byes.

---

## 🛠️ Technologies Used
- **Frontend / Simulation:** HTML5, Modern CSS3 (Glassmorphism & Sports-Broadcast Dark Theme), Vanilla JavaScript (ES6+ Modules), Chart.js
- **Audio:** Web Audio API (real-time procedural sound synthesis)
- **Data Science / EDA:** Python, Pandas, NumPy, Matplotlib, Jupyter Notebook
- **Deployment:** Vercel Static Hosting

---

## 📁 Dataset
- `IPL.csv`: Complete ball-by-ball delivery-level dataset
- `IPL_Cleaned.csv`: Preprocessed dataset with feature engineering (`Is_Boundary_4`, `Is_Boundary_6`)
- `IPL_BallByBall_Cleaned.csv`: Cleaned delivery logs

---

## 🚀 Getting Started Locally

This project requires **zero build steps** and runs statically in any modern browser:

### Option 1: Using Python's Built-in HTTP Server
```bash
# Clone the repository
git clone https://github.com/padhisoumyaranjan87-design/ipl-auction-system.git
cd ipl-auction-system

# Start a local web server
python -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Using Node.js / npx
```bash
npx serve .
```

---

## 📁 Repository Structure

```text
├── css/
│   └── styles.css              # Ultra-premium dark broadcast styling & design tokens
├── js/
│   ├── app.js                  # Main controller, event bindings, and tab routing
│   ├── auction.js              # Real-time bidding engine, AI valuation & Web Audio
│   ├── players.js              # Curated player pool with career stats & bio
│   ├── teams.js                # 10 IPL franchises data and purse models
│   └── analytics.js            # Chart.js visualization configurations
├── index.html                  # Main web application entry point
├── vercel.json                 # Vercel static routing and security headers
├── IPL.csv                     # Original IPL ball-by-ball dataset
├── IPL_Cleaned.csv             # Cleaned EDA dataset
├── Soumya Ranjan Padhi_...ipynb# Python Jupyter Notebook with EDA workflows
├── Soumya Ranjan Padhi_...docx # Project formal report document
└── README.md                   # Project documentation
```

---

## 📜 License
This project is open source and available under the [MIT License](LICENSE).
