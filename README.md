# Co-Fleeter (Enterprise Edition v1.0)

Maritime Decarbonization Platform - Web Application

## 📌 Overview
Co-Fleeter is a comprehensive platform designed to help shipping companies manage their fleet's environmental performance, calculate CII (Carbon Intensity Indicator) ratings, and trade carbon credits (ETS/FuelEU).

**Version**: v1.0
**Status**: Production Ready for Deployment

## ✨ Key Features
*   **Fleet Management**: Register and track vessels (IMO, Type, DWT).
*   **CII Calculator**: Simulate CO2 emissions and CII ratings based on fuel consumption.
*   **Carbon Trading (ETS & FuelEU)**: Buy and sell credits in a simulated marketplace.
*   **Admin Panel**: Manage users, permissions, and email configurations.
*   **Data Backup**: Built-in JSON export/import for data safety.

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [Git](https://git-scm.com/)

### Installation
1.  **Clone the repository**
    ```bash
    git clone https://github.com/YOUR_USERNAME/cofleeter.git
    cd cofleeter
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```
    *This will install dependencies for both frontend (lite-server) and backend (express, mongoose, etc).*

3.  **Run the Application**
    Windows users can simply run the provided batch file:
    ```bash
    start.bat
    ```
    Or manually via terminal:
    ```bash
    npm start
    ```

4.  **Access the App**
    *   **Frontend**: http://localhost:3000
    *   **Backend API**: http://localhost:8000

## 🔑 Default Credentials
To log in as the Super Admin:
*   **Email**: `cfadmin@cofleeter.com`
*   **Password**: `1234`

## 📦 Deployment
This project is configured for easy deployment on **Render.com** (recommended).
1.  Push this code to your GitHub.
2.  Create a **Web Service** on Render connected to this repo.
3.  **Start Command**: `node backend/server.js`

## 💾 Data Management (Important)
*   **File Storage**: By default, data is saved in `backend/data/*.json`.
*   **MongoDB (Optional)**: Set `MONGO_URI` environment variable to enable hybrid sync for persistent Database storage.
*   **Backup**: Use the Admin Panel > Data Management tab to backup/restore data when upgrading.

## 📝 License
Proprietary - Co-Fleeter Team
