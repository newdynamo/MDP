class PoolingService {
    constructor() {
        this.baseUrl = '/api/pooling';
    }

    async getPools() {
        try {
            const res = await fetch(this.baseUrl);
            const data = await res.json();
            return data.success ? data.pools : [];
        } catch (e) {
            console.error('Failed to fetch pools', e);
            return [];
        }
    }

    async createPool(user, poolData) {
        try {
            const res = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ownerId: user.id, poolData })
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to create pool', e);
            return { success: false, message: 'Network error' };
        }
    }

    async joinPool(user, poolId) {
        try {
            const res = await fetch(`${this.baseUrl}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, poolId })
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to join pool', e);
            return { success: false, message: 'Network error' };
        }
    }

    async deletePool(user, poolId) {
        try {
            const res = await fetch(`${this.baseUrl}/${poolId}?userId=${user.id}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (e) {
            console.error('Failed to delete pool', e);
            return { success: false, message: 'Network error' };
        }
    }
}

const poolingService = new PoolingService();
