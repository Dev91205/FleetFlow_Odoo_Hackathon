const express = require("express");

const Trip = require("../models/Trip");

const { auth } = require("../middleware/auth");

const router = express.Router();


router.get("/", auth, async (req, res) => {

  const trips = await Trip.find()
    .populate("vehicle_id")
    .populate("driver_id");

  res.json(trips);

});


router.post("/", auth, async (req, res) => {

  const trip = new Trip(req.body);

  await trip.save();

  res.json(trip);

});


router.put("/:id", auth, async (req, res) => {

  const trip = await Trip.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(trip);

});


module.exports = router;