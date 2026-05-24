const mongoose = require('mongoose');
const Trip = require('../models/travlr'); 

// GET: /api/trips - lists all the trips
const tripsList = async (req, res) => {
  try {
    const { location, minPrice, maxPrice } = req.query;

    let filter = {};

    // Filter by location (case insensitive)
    if (location) {
      filter.resort = { $regex: location, $options: 'i' };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.perPerson = {};

      if (minPrice) {
        filter.perPerson.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.perPerson.$lte = Number(maxPrice);
      }
    }

    const trips = await Trip.find(filter).exec();

    res.status(200).json(trips);

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
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

    const tripsDeleteTrip = async (req, res) => {
  try {
    const tripCode = req.params.tripCode;

    const trip = await Trip.findOneAndDelete({ code: tripCode }).exec();

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json({ message: "Trip deleted successfully" });

  } catch (err) {
    res.status(500).json(err);
  }
};

// All functions exported at the end for clean scope
module.exports = {
  tripsList,
  tripsFindByCode,
  tripsAddTrip,
  tripsUpdateTrip,
  tripsDeleteTrip   // ADD THIS
};