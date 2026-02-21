const express = require("express");

const Driver = require("../models/Drivers");

const { auth } = require("../middleware/auth");

const router = express.Router();


router.get("/", auth, async (req, res) => {

  const drivers = await Driver.find();

  res.json(drivers);

});


router.post("/", auth, async (req, res) => {

  const driver = new Driver(req.body);

  await driver.save();

  res.json(driver);

});


router.put("/:id", auth, async (req, res) => {

  const driver = await Driver.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(driver);

});


router.delete("/:id", auth, async (req, res) => {

  await Driver.findByIdAndDelete(req.params.id);

  res.json({ message: "Deleted" });

});

module.exports = router;