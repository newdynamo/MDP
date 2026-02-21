# 📘 Co-Fleeter (Enterprise Edition v1.0) - User Manual

## 1. Introduction

Welcome to **Co-Fleeter**, the comprehensive Maritime Decarbonization Platform. This platform is designed to help shipping companies, charterers, and traders navigate the complex landscape of environmental regulations, including **CII (Carbon Intensity Indicator)**, **EU-ETS (Emissions Trading System)**, and **FuelEU Maritime**.

**Key Capabilities:**
*   **Fleet Management**: Centralized database of your vessels with technical specifications.
*   **Regulatory Calculator**: Instant calculation of CII ratings, EU-ETS costs, and FuelEU penalties/surpluses.
*   **Carbon Trading Marketplace**: Buy and sell EU Allowances (EUA) and FuelEU compliance units.
*   **Compliance Pooling**: Optimize fleet-wide or cross-company compliance through pooling mechanisms.

---

## 2. Getting Started

### 2.1 Accessing the Platform
Open your web browser and navigate to the Co-Fleeter URL (e.g., `http://localhost:3000` for local deployments). You will see the Landing Page with our vision and supported standards.

### 2.2 Registration
1.  Click the **Login / Register** button in the top right corner.
2.  In the login modal, click the link: **"New here? Create an account"**.
3.  Fill in the required details:
    *   **Full Name**: Your actual name.
    *   **Company Name**: The organization you represent.
    *   **Email Address**: Your corporate email (used for login).
    *   **Phone Number**: Contact number for trading verifications.
    *   **Password**: Create a secure password (min. 4 characters).
4.  Click **Create Account**. You will be automatically logged in upon success.

### 2.3 Logging In
1.  Click **Login / Register**.
2.  Enter your **Email Address** and **Password**.
3.  Click **Sign In to Portal**.

---

## 3. Dashboard Overview

After logging in, you are presented with the main Dashboard. This acts as your command center.

*   **Market Price (EUA)**: Displays the current market price for EU Allowances with the latest daily change trend.
*   **Managed Vessels**: Total count of ships currently registered in your fleet.
*   **YTD CO2 Emissions**: Total Year-to-Date CO2 emissions aggregated from your fleet's performance data.
*   **Charts**:
    *   **Market Tendency**: Visual trend of carbon credit prices over time.
    *   **CII Rating Distribution**: A pie chart showing how your fleet is performing against CII ratings (A to E).
    *   **Top 10 Vessels by CO2**: A bar chart highlighting your highest emitting vessels.
*   **Quick Actions**: Shortcuts to commonly used features like "Manage Fleet", "Run Calculator", and "View Market".

---

## 4. Fleet Management

Navigate to the **Fleet** page via the sidebar to manage your vessels.

### 4.1 Registering a New Vessel
1.  Click the **+ Register** button in the top right.
2.  Enter the vessel details:
    *   **Vessel Name**: The operational name of the ship.
    *   **IMO Number**: The unique 7-digit identification number.
    *   **Ship Type**: Select from the dropdown (e.g., Bulk Carrier, Tanker, LNG Carrier).
    *   **DWT (Deadweight Tonnage)**: Enter the ship's capacity in tonnes.
3.  **Validation**: The system checks if the entered DWT matches the selected Ship Type (e.g., if you select "Bulk carrier (>= 279,000 DWT)", you cannot enter a DWT of 50,000).
4.  Click **Register**.

### 4.2 Importing Vessels (Bulk Upload)
1.  Click the **📄 Template** button to download the official Excel template. This template includes a dropdown list for Ship Types to ensure data validity.
2.  Fill in your vessel data in the Excel file and save it.
3.  Click **📥 Import** and select your saved Excel file.
4.  The system will parse the file and ask for confirmation before adding the vessels to your fleet.

### 4.3 Exporting Fleet Data
Click the **📊 Export** button to download your current fleet list as an Excel file.

### 4.4 Managing Vessels
*   **Delete**: Remove a vessel from your fleet (requires confirmation).
*   **Calculate**: Jump directly to the Calculator pre-filled with this vessel's technical data.

---

## 5. Regulatory Calculator

The Calculator is a powerful tool to simulate compliance scenarios. Navigate to **Calculator** from the sidebar.

### 5.1 Input Parameters
*   **Vessel Details**: Select a ship from your fleet or manually enter IMO, Type, and DWT.
*   **Voyage Data**:
    *   **Distance (nm)**: Total nautical miles traveled in the period.
    *   **Reporting Period**: Select the applicable year (affects reduction factors and phase-in rates).
    *   **Market Price (€/EUA)**: Enter the assumed carbon price for cost estimation.

### 5.2 Fuel Consumption
Add the fuels consumed during the period.
1.  Click **+ Add Fuel**.
2.  **Fuel Type**: Select the fuel (e.g., HFO, LFO, LNG, Bio-diesel, Methanol).
3.  **Quantity (MT)**: Mass of fuel consumed in Metric Tonnes.
4.  **Scope**:
    *   **Voyage (50% / 100%)**: For EU-ETS, voyages between EU and non-EU ports count 50%. Intra-EU voyages count 100%.
    *   **Port**: Emissions at berth in EU ports count 100%.
5.  **Advanced Options**: You can customize **LCV (Lower Calorific Value)** and **WtW Emission Intensity** if you have specific fuel batch data.

### 5.3 Viewing Results
Click **Calculate All Regulations** to see the analysis:
*   **CII Rating**: Shows the Attained CII, Required CII, and the resulting **A-E Rating**.
*   **EU-ETS**:
    *   **Payable CO2**: Emissions liable for surrender after applying the phase-in rate (40% in 2024, 70% in 2025, 100% from 2026).
    *   **Estimated Cost**: Projected financial impact based on the input EUA price.
*   **FuelEU Maritime**:
    *   **Compliance Balance**: Shows if you have a **Surplus** (over-compliance) or **Deficit** (penalty).
    *   **Penalty**: If in deficit, an estimated penalty amount is shown.

---

## 6. Carbon Trading (ETS)

The **Trading (ETS)** page allows you to manage your carbon credits.

### 6.1 Market View
*   **Order Book**: View active Buy and Sell orders from other participants.
*   **Filter**: Toggle between "All", "Buys", and "Sells".
*   **Market Tendency**: A chart showing recent price movements.

### 6.2 Placing Orders
*   **BUY Order**: Use the Green panel. Enter **Quantity** and **Unit Price (€)**, then click **PLACE BUY ORDER**.
*   **SELL Order**: Use the Red panel. Enter **Quantity** and **Unit Price (€)**, then click **PLACE SELL ORDER**.
*   **Matching**: If your price matches an existing order, the trade may be executed immediately. Otherwise, it sits in the Order Book.

### 6.3 RFQ (Request for Quote)
For large volumes or specific needs, you can issue an RFQ.
1.  Enter the **Quantity** required.
2.  Click **Request Quote**.
3.  Traders will see your request and submit price quotes.
4.  You can review quotes in the "Active Orders" list and click **Accept** on the best offer.

---

## 7. Compliance Trading (FuelEU & Pooling)

Navigate to **Trading (FuelEU)** for managing fuel intensity compliance.

### 7.1 Marketplace
Similar to the ETS market, but for **FuelEU Compliance Units**. You can buy surplus energy from green vessels or sell your own surplus to non-compliant vessels.

### 7.2 Pooling (Compliance)
This unique feature allows fleets to pool together to avoid penalties.
1.  Click the **Pooling (Compliance)** tab.
2.  **My Compliance Status**: Shows your calculated fleet-wide FuelEU balance.
3.  **Available Pools**: View lists of pools offering Surplus (to offset your deficit) or requesting Compliance.
4.  **Simulate**: Click on a pool to see how joining it would affect your financial compliance (e.g., "Joining this pool saves 25% compared to paying the penalty").
5.  **Post Offer**: If you have a vessel with a surplus (e.g., a dual-fuel methanol ship), you can create a pool to sell that surplus to others.

---

## 8. My Page & Support

### 8.1 Profile Management
*   Navigate to **My Page**.
*   Update your **Phone Number** (critical for trade verification).
*   **Change Password**: Secure your account by updating your credentials.

---

## 9. Troubleshooting & FAQ

**Q: I cannot register my ship due to DWT error.**
*   **A**: Ensure the **DWT** value matches the **Ship Type** definition (e.g., "Bulk Carrier < 279,000 DWT" requires a value strictly less than 279,000).

**Q: Calculations seem wrong for EU-ETS cost.**
*   **A**: Check the **Reporting Year**. The system automatically applies the phase-in percentage (40% for 2024). If you want the full cost, set the year to 2026+.

**Q: How do I backup my data?**
*   **A**: Currently, data is stored on the server. Fleet data can be exported to Excel for local backup via the **Fleet** page.

**Q: Who do I contact for support?**
*   **A**: Please use the Contact Form on the landing page or email support at `support@co-fleeter.com`.
