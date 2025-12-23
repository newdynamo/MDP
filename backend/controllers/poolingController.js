const { db, save } = require('../models/store');

exports.getPools = (req, res) => {
    // Filter out closed pools unless admin? Or just show all active?
    // Let's show all active (OPEN) pools by default.
    const pools = db.pools.filter(p => p.status === 'OPEN').sort((a, b) => b.timestamp - a.timestamp);
    res.json({ success: true, pools });
};

exports.createPool = (req, res) => {
    const { ownerId, poolData } = req.body;

    const user = db.users.find(u => u.id === ownerId);
    if (!user) return res.status(400).json({ success: false, message: 'Invalid User' });

    // poolData: { name, quantity, price, type, description }
    if (!poolData.name || !poolData.quantity || !poolData.type) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newPool = {
        id: 'pool_' + Date.now(),
        owner: user.name, // Display Name
        ownerCompany: user.company,
        ownerId: user.id, // Internal Reference
        status: 'OPEN',
        timestamp: Date.now(),
        ...poolData
    };

    db.pools.unshift(newPool);
    save.pools();

    res.json({ success: true, pool: newPool });
};

exports.joinPool = (req, res) => {
    // This is essentially a "Contact Request" or "Tentative Match"
    // For MVP, likely just toggles status or sends email, but we'll mock it as "Joined/Closed" for now.
    const { poolId, userId } = req.body;

    const pool = db.pools.find(p => p.id === poolId);
    if (!pool) return res.status(404).json({ success: false, message: 'Pool not found' });

    if (pool.status !== 'OPEN') return res.status(400).json({ success: false, message: 'Pool is not open' });

    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    // Update Status
    pool.status = 'CLOSED'; // Or 'FILLED'
    pool.filledBy = user.name;
    pool.filledById = user.id;
    pool.filledDate = Date.now();

    save.pools();
    res.json({ success: true, pool });
};

exports.deletePool = (req, res) => {
    const { id } = req.params;
    const { userId } = req.query; // Auth check ideally needed

    const index = db.pools.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ success: false });

    // Permission check: Owner or Admin
    const pool = db.pools[index];
    const user = db.users.find(u => u.id === userId);
    if (!user || (user.role !== 'ADMIN' && user.id !== pool.ownerId)) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    db.pools.splice(index, 1);
    save.pools();
    res.json({ success: true });
};
