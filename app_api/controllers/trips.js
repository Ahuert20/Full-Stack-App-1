const mongoose = require('mongoose');
const Trip = require('../models/travlr'); 

// GET: /api/trips - lists all the trips
const tripsList = async (req, res) => {
    try {
        // Use an empty find({}) to get ALL trips
        const q = await Trip.find({}).exec();

        if (!q || q.length === 0) { 
            return res.status(404).json({ "message": "No trips found" });
        } else { 
            return res.status(200).json(q);
        }
    } catch (err) {
        return res.status(500).json(err);
    }
};

// GET: /api/trips/:tripCode - find a single trip by code
const tripsFindByCode = async (req, res) => {
    try {
        // Use req.params.tripCode to find the specific one
        const q = await Trip
            .find({'code' : req.params.tripCode}) 
            .exec();

        if (!q || q.length === 0) { 
            return res.status(404).json({ "message": "Trip not found with code " + req.params.tripCode });
        } else { 
            return res.status(200).json(q);
        }
    } catch (err) {
        return res.status(500).json(err);
    }
};

// Now both functions are defined and can be exported
module.exports = {
    tripsList,
    tripsFindByCode
};