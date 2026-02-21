const express = require("express");

const Vehicle = require("../models/Vehicle");

const { auth, roleGuard } = require("../middleware/auth");

const router = express.Router();


// GET ALL
router.get("/", auth, async (req, res) => {

  const vehicles = await Vehicle.find();

  res.json(vehicles);

});


// GET AVAILABLE
router.get("/available", auth, async (req, res) => {

  const vehicles = await Vehicle.find({
    status: "Available",
  });

  res.json(vehicles);

});


// GET ONE
router.get("/:id", auth, async (req, res) => {

  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle)
    return res.status(404).json({ error: "Vehicle not found" });

  res.json(vehicle);

});


// CREATE
router.post("/", auth, roleGuard(["manager","dispatcher"]), async (req, res) => {

  const vehicle = new Vehicle(req.body);

  await vehicle.save();

  res.status(201).json(vehicle);

});


// UPDATE
router.put("/:id", auth, roleGuard(["manager","dispatcher"]), async (req, res) => {

  const vehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(vehicle);

});


// DELETE
router.delete("/:id", auth, roleGuard(["manager"]), async (req, res) => {

  await Vehicle.findByIdAndDelete(req.params.id);

  res.json({ message: "Deleted" });

});

module.exports = router;