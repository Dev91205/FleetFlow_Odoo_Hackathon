const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({

  trip_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },

  fuel_expense: {
    type: Number,
    default: 0,
  },

  misc_expense: {
    type: Number,
    default: 0,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

});


expenseSchema.set("toJSON", {
  transform: (doc, ret) => {

    ret.id = ret._id.toString();

    if (ret.trip_id)
      ret.tripId = ret.trip_id;

    delete ret._id;
    delete ret.__v;
    delete ret.trip_id;

  },
});

module.exports = mongoose.model("Expense", expenseSchema);