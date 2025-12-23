/**
 * Co-Fleeter Data Service
 * Handles Fleets via API
 */

const MOCK_REPORTS = [
    { id: 'rpt_2023_01', type: 'EU-ETS', status: 'Verified', date: '2023-12-31' },
    { id: 'rpt_2024_q1', type: 'DCS', status: 'Pending', date: '2024-03-31' }
];

class DataService {
    constructor() {
        // Admin Email Init
        if (!localStorage.getItem('adminEmail')) {
            localStorage.setItem('adminEmail', 'newdynamo@gmail.com');
        }
    }

    getAdminEmail() {
        return localStorage.getItem('adminEmail');
    }

    setAdminEmail(email) {
        localStorage.setItem('adminEmail', email);
    }

    async registerShip(user, shipData) {
        if (!user || !user.id) return { success: false, message: 'Invalid User' };

        try {
            const response = await fetch('/api/data/fleets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, shipData })
            });
            const data = await response.json();

            if (data.success) {
                return { success: true, ship: data.ship };
            } else {
                return { success: false, message: data.message || 'Failed to add ship' };
            }
        } catch (e) {
            console.error(e);
            return { success: false, message: 'Network error' };
        }
    }

    async registerBatchShips(user, shipsArray) {
        if (!user || !user.id) return { success: false, message: 'Invalid User' };

        try {
            const response = await fetch('/api/data/fleets/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, ships: shipsArray })
            });
            const data = await response.json();
            return data;
        } catch (e) {
            console.error('Batch import error', e);
            return { success: false, message: 'Network error' };
        }
    }

    async deleteShip(user, shipId) {
        if (!user || !user.id) return false;

        try {
            const response = await fetch(`/api/data/fleets/${shipId}?userId=${user.id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            return data.success || false;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async getFleet(user) {
        if (!user) return [];

        try {
            const response = await fetch(`/api/data/fleets?userId=${user.id}&role=${user.role}`);
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error('Failed to fetch fleet', e);
            return [];
        }
    }

    getReports(user) {
        // Static mock for now
        return MOCK_REPORTS;
    }

    async updateShipData(user, shipId, updateData) {
        if (!user || !user.id) return { success: false };

        try {
            const response = await fetch(`/api/data/fleets/${shipId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, updateData })
            });
            const data = await response.json();
            return data;
        } catch (e) {
            console.error('Failed to update ship', e);
            return { success: false };
        }
    }

    async saveCiiConstants(constants) {
        try {
            const response = await fetch('/api/data/cii-constants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ constants })
            });
            const data = await response.json();
            return data.success;
        } catch (e) {
            console.error('Failed to save CII constants', e);
            return false;
        }
    }

    async getOverviewStats(user) {
        const fleet = await this.getFleet(user);
        const totalShips = fleet.length;
        const totalCo2 = fleet.reduce((sum, ship) => sum + ship.co2_ytd, 0);

        const ciiScores = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
        const totalScore = fleet.reduce((sum, ship) => sum + (ciiScores[ship.cii_rating] || 0), 0);
        const avgScore = totalShips ? totalScore / totalShips : 0;

        let avgCii = 'N/A';
        if (avgScore >= 4.5) avgCii = 'A';
        else if (avgScore >= 3.5) avgCii = 'B';
        else if (avgScore >= 2.5) avgCii = 'C';
        else if (avgScore >= 1.5) avgCii = 'D';
        else avgCii = 'E';

        return {
            totalShips,
            totalCo2,
            avgCii
        };
    }

    // --- Calculator History Storage (Server Persisted) ---
    async saveCalculation(user, calculationData) {
        if (!user || !user.id) return;

        try {
            await fetch('/api/user/calculations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, calculation: calculationData })
            });
        } catch (e) {
            console.error("Failed to save calculation to server", e);
        }
    }

    async getCalculations(user) {
        if (!user || !user.id) return [];

        try {
            const res = await fetch(`/api/user/calculations?userId=${user.id}`);
            const data = await res.json();
            return data.success ? data.calculations : [];
        } catch (e) {
            console.error("Failed to fetch calculations", e);
            return [];
        }
    }

    /**
     * Aggregates the latest compliance status for the user
     * Returns { euaShortage: number, fuelEuPenalty: number, fuelEuBalance: number }
     */
    async getComplianceStatus(user) {
        if (!user) return { euaShortage: 0, fuelEuBalance: 0, fuelEuPenalty: 0 };

        // 1. Get Real Fleet
        const fleet = await this.getFleet(user);

        // 2. Get All Calculations
        const history = await this.getCalculations(user);

        let euaShortage = 0;
        let fuelEuBalance = 0; // MJ
        let fuelEuPenalty = 0; // EUR

        // 3. For each ship in fleet, find latest relevant calculation
        for (const ship of fleet) {
            // Find latest EU-ETS calculation for this ship
            const shipEtsCalcs = history.filter(h =>
                h.type === 'EU-ETS' &&
                h.input &&
                (h.input.imoNumber === ship.id || h.input.vesselName === ship.name)
            ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            if (shipEtsCalcs.length > 0) {
                const latest = shipEtsCalcs[0];
                euaShortage += parseFloat(latest.result.payableCO2 || 0);
            }

            // Find latest FuelEU calculation for this ship
            const shipFuelEuCalcs = history.filter(h =>
                h.type === 'FuelEU' &&
                h.input &&
                (h.input.imoNumber === ship.id || h.input.vesselName === ship.name)
            ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            if (shipFuelEuCalcs.length > 0) {
                const latest = shipFuelEuCalcs[0];
                const bal = parseFloat(latest.result.balance || 0);
                fuelEuBalance += bal;

                if (bal < 0) {
                    // Calculate penalty for this specific ship's deficit
                    // Mock penalty calculation: 2400 EUR / tonne VLSFO eq
                    // 1 tonne VLSFO = 41000 MJ
                    fuelEuPenalty += (Math.abs(bal) / 41000) * 2400;
                }
            }
        }

        return {
            euaShortage: Math.round(euaShortage),
            fuelEuBalance: Math.round(fuelEuBalance),
            fuelEuPenalty: Math.round(fuelEuPenalty)
        };
    }
}

const dataService = new DataService();
