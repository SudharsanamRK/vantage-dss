# AI-DRIVEN AQUACULTURE RISK, YIELD LOSS & ADAPTIVE FEEDING DECISION SUPPORT SYSTEM
This project is a high-performance, operational Decision Support System (DSS) designed for modern aquaculture management. Built on a MERN stack with an AI-driven FarmBrain engine, it provides real-time pond monitoring, adaptive feeding, survival prediction, and financial forecasting for shrimp and fish farms.

---

# Output Modules

**1. Dashboard**
> Serves as the central mission control for each pond displaying real-time sensor telemetry (DO, Ammonia, Temperature, pH), Days of Culture (DOC), Biomass Estimate, Health Score, Projected Revenue, and FATHOM_CORE logic output including Health Monitor and Feeding Advisor status. Weather integration via Open-Meteo is also shown inline.

<img width="1918" height="868" alt="image" src="https://github.com/user-attachments/assets/044b5649-edcd-4365-8c15-6b66af33bf67" />


---

**2. Pond Map**
> Offers a multi-pond spatial overview of the entire farm, allowing operators to monitor all active pond units simultaneously. Displays live telemetry (DO, Temp, pH, NH₃), DOC, Biomass, Harvest Progress, and health status (Optimal / Warning / Critical) across all registered ponds with live telemetry sync.

<img width="1919" height="869" alt="image" src="https://github.com/user-attachments/assets/a562ed93-969b-4c90-8f1a-7ca803797b91" />

---

**3. Feeding Advisor, BIO-LOGIC PROTOCOL**
> Utilizes the FeedEngine's bio-logic algorithms to calculate precise adaptive feed requirements based on current water quality, biomass, and average body weight. Displays real-time vitals, metabolic efficiency over a 24-hour cycle, and triggers critical alerts (e.g., CRITICAL OXYGEN EVENT - feed suspended) when water conditions are unsafe, optimizing FCR and preventing waste.

<img width="1919" height="864" alt="image" src="https://github.com/user-attachments/assets/fbfaad23-585e-4d8e-814d-c21be6114813" />


---

**4. Harvest Simulator**
> Runs predictive simulations to estimate future yield, ideal harvest windows, and financial outcomes. Displays a Biological Growth Curve (weight vs. biomass), P&L Curve, Final Biomass, Gross Revenue, Feed Cost, Net Profit, and Peak Profit Day. Simulator settings allow operators to adjust density, survival %, target weight, FCR, and market price in real time.

<img width="1919" height="858" alt="image" src="https://github.com/user-attachments/assets/a712cd35-650d-478b-8161-44575d178d14" />


---

**5. Biological Diagnostics**
> Functions as a digital health doctor - analyzing water parameters (DO, Temperature, pH, Ammonia) against species-specific thresholds to generate a Health Index (0–100), Mortality Risk %, DO Status, Active Alerts, Survival Estimate, and a 6-Hour Risk Forecast. Provides species-specific advisories (e.g., salinity warnings for Vannamei culture).

<img width="1916" height="869" alt="image" src="https://github.com/user-attachments/assets/f758ba57-7dd7-4c9d-b69e-0a091972cf33" />


---

**6. Economics, Capital Flow**
> Translates biological data into economic reality. Tracks Gross Revenue, Total Cost, Net Profit, Profit/kg, Daily Burn Rate, and Weekly Cash Need. Includes a Break-Even Analysis (break-even price, break-even volume, safety margin) and a Profit Projection chart across remaining culture days, with a Financial Forecast panel showing full cycle P&L.

<img width="1919" height="861" alt="image" src="https://github.com/user-attachments/assets/4989fb95-4eef-4414-8e78-f36c0780d736" />

---

**7. Task Manager, Daily Ops**
> Manages daily farm operations through a structured task board. Tracks tasks by status (Pending, In Progress, Completed, Overdue) across categories (Water Quality, Feeding, Sampling, Maintenance). Displays Today's Schedule with task priorities and a history log for audit and compliance purposes.

<img width="1919" height="863" alt="image" src="https://github.com/user-attachments/assets/2373ce10-73a3-40ff-b417-e26a1c8a42bf" />


---

**8. Field Logbook**
> Acts as a comprehensive digital logbook with continuous, timestamped records of all farm events — Water Quality snapshots, Feeding logs, Mortality counts, ABW Sampling, Aeration Checks, and more. Supports quick-entry templates, category filters (Health, Feeding, Economics, Harvest, Maintenance, System), and export for reporting and auditing.

<img width="1919" height="871" alt="image" src="https://github.com/user-attachments/assets/ed19dbeb-3f89-449b-8960-10fb280e078c" />

---

**9. Pond Setup, Configuration Wizard**
> Handles the technical foundation of the farm OS through a structured multi-section configuration panel. Operators define Farm & Pond Details, Stocking Information, Water Quality Baseline, Feed & Management preferences, Financial Inputs, and Alert Thresholds all editable in one place via Edit Mode.

<img width="1919" height="861" alt="image" src="https://github.com/user-attachments/assets/08cceb9e-9fe9-45c0-ad3e-50cfbe5064b8" />

---

**10. Event Notification System, Alerts**
> Manages the system's real-time signal layer, triggering severity-based alerts (High / Medium / Info) when sensor data or biological trends deviate from configured safe operational limits. Alert thresholds for DO, pH, Ammonia, and Temperature are fully customizable per pond. Notifications can be delivered via App, SMS, or Both.

<img width="1918" height="868" alt="image" src="https://github.com/user-attachments/assets/6ccde590-8df1-46fa-8bbd-be7685440dc6" />

---

**11. Authentication, Register & Login**
> Secure operator onboarding via the FATHOM platform. Supports role-based access (Farmer / Admin) with JWT authentication. New operators can register in under a minute and immediately configure their first pond and go live with telemetry.

<img width="1917" height="859" alt="image" src="https://github.com/user-attachments/assets/0df06241-ce10-4124-9193-6198bb2cd6e2" />
<img width="1919" height="865" alt="image" src="https://github.com/user-attachments/assets/a3c2460a-b384-4290-8144-9a0e68e4b5c1" />


---

**12. Vantage AI, Intelligent Farm Assistant**
> A natural language AI chatbot embedded directly into the platform, powered by live pond data. Operators can ask questions about pond health, feeding schedules, harvest timing, and financial projections in plain English and receive context-aware, data-driven responses in real time.

<img width="419" height="497" alt="image" src="https://github.com/user-attachments/assets/738b518f-8636-439c-bba3-573ef048e721" />


---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React.js, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Auth | JWT, Role-based Middleware |
| AI Engine | FarmBrain (Water Health), FeedEngine (Adaptive Feed) |
| IoT (Planned) | ESP32, Sensor Ingest API |
| Tools | VS Code, GitHub, Postman, MongoDB Atlas |

