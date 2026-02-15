const mongoose = require('mongoose');
const Trip = require('../models/travlr'); 

// GET: /api/trips - lists all the trips
const tripsList = async (req, res) => {
    try {
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

// POST: /api/trips - Adds a new Trip
const tripsAddTrip = async (req, res) => {
    try {
        const newTrip = new Trip({
            code: req.body.code,
            name: req.body.name,
            length: req.body.length,
            start: req.body.start,
            resort: req.body.resort,
            perPerson: req.body.perPerson,
            image: req.body.image,
            description: req.body.description
        });

        const q = await newTrip.save();

        if (!q) {
            return res.status(400).json({ "message": "Database failed to save the trip" });
        } else {
            return res.status(201).json(q);
        }
    } catch (err) {
        return res.status(500).json(err);
    }
};

// PUT: /api/trips/:tripCode - Updates an existing Trip
const tripsUpdateTrip = async (req, res) => {
    try {
        const q = await Trip.findOneAndUpdate(
            { 'code': req.params.tripCode },
            {
                code: req.body.code,
                name: req.body.name,
                length: req.body.length,
                start: req.body.start,
                resort: req.body.resort,
                perPerson: req.body.perPerson,
                image: req.body.image,
                description: req.body.description
            },
            { new: true } // Returns the updated document instead of the old one
        ).exec();

        if (!q) {
            return res.status(404).json({ "message": "Trip not found with code " + req.params.tripCode });
        } else {
            return res.status(200).json(q);
        }
    } catch (err) {
        return res.status(500).json(err);
    }
};

// All functions exported at the end for clean scope
module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAddTrip,
    tripsUpdateTrip // Added to exports
};