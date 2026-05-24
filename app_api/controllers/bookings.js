const User = require('../models/user');
const Trip = require('../models/travlr');



const bookTrip = async (req, res) => {
  try {
    const userId = req.auth._id;
    const tripId = req.params.tripId;

    const user = await User.findById(userId).exec();
    const trip = await Trip.findById(tripId).exec();

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    user.bookings.push(trip._id);
    await user.save();

    res.status(200).json({ message: "Trip booked successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};


const getMyTrips = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id)
      .populate('bookings')
      .exec();

    res.status(200).json(user.bookings);

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};


module.exports = {
  bookTrip,
  getMyTrips
};