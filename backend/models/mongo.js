const mongoose = require('mongoose');

// --- Schemas ---
const UserSchema = new mongoose.Schema({}, { strict: false }); // Store user objects freely
const FleetSchema = new mongoose.Schema({ userId: String, ships: Array });
const GlobalDataSchema = new mongoose.Schema({ key: String, data: mongoose.Schema.Types.Mixed }); // Generic store for single objects like fuelData

// --- Models ---
const User = mongoose.model('User', UserSchema);
const Fleet = mongoose.model('Fleet', FleetSchema);
const GlobalData = mongoose.model('GlobalData', GlobalDataSchema);

// --- Connection ---
const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log("MongoDB Connected Successfully");
        return true;
    } catch (e) {
        console.error("MongoDB Connection Error:", e.message);
        return false;
    }
};

module.exports = {
    connectDB,
    User,
    Fleet,
    GlobalData
};
