const express = require("express");

const Maintenance = require("../models/Maintenance");

const router = express.Router();


router.get("/", async (req, res) => {

  const logs = await Maintenance.find()
    .populate("vehicle_id");

  res.json(logs);

});


router.post("/", async (req, res) => {

  const log = new Maintenance(req.body);

  await log.save();

  res.json(log);

});

module.exports = router;