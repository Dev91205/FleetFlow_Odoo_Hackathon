const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({

  model: {
    type: String,
    required: true,
  },

  plate: {
    type: String,
    required: true,
    unique: true,
  },

  type: {
    type: String,
    required: true,
  },

  capacity: {
    type: Number,
    required: true,
  },

  odometer: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    enum: ["Available", "On Trip", "In Shop", "Idle"],
    default: "Available",
  },

  acquired_cost: {
    type: Number,
    default: 0,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

});


// FIX: MongoDB → frontend id mapping
vehicleSchema.set("toJSON", {
  transform: (doc, ret) => {

    ret.id = ret._id.toString();

    delete ret._id;
    delete ret.__v;

  },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);