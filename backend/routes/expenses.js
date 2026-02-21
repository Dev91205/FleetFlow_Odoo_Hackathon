const express = require("express");

const Expense = require("../models/Expense");

const router = express.Router();


router.get("/", async (req, res) => {

  const expenses = await Expense.find()
    .populate("trip_id");

  res.json(expenses);

});


router.post("/", async (req, res) => {

  const expense = new Expense(req.body);

  await expense.save();

  res.json(expense);

});


module.exports = router;