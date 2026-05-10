const { db, save } = require('../models/store');

exports.getResources = (req, res) => {
    const sorted = [...db.resources].sort((a, b) => {
        if (a.category === b.category) return (a.createdAt || 0) - (b.createdAt || 0);
        return a.category.localeCompare(b.category);
    });
    res.json({ success: true, resources: sorted });
};

exports.addResource = (req, res) => {
    const { category, code, description, url } = req.body || {};

    if (!category || !code || !url) {
        return res.status(400).json({ success: false, message: 'category, code, and url are required.' });
    }

    try {
        new URL(url);
    } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid URL.' });
    }

    const resource = {
        id: 'res_' + Date.now() + Math.random().toString(36).substr(2, 5),
        category: String(category).trim(),
        code: String(code).trim(),
        description: description ? String(description).trim() : '',
        url: String(url).trim(),
        createdAt: Date.now()
    };

    db.resources.push(resource);
    save.resources();
    res.json({ success: true, resource });
};

exports.deleteResource = (req, res) => {
    const { id } = req.params;
    const initial = db.resources.length;
    db.resources = db.resources.filter(r => r.id !== id);

    if (db.resources.length < initial) {
        save.resources();
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Resource not found.' });
    }
};
