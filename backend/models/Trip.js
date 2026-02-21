const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({

  vehicle_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },

  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },

  origin: {
    type: String,
    required: true,
  },

  destination: {
    type: String,
    required: true,
  },

  cargo_weight: {
    type: Number,
    required: true,
  },

  fuel_cost: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    enum: ["Draft", "Dispatched", "On Trip", "Completed", "Cancelled"],
    default: "Draft",
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

});


tripSchema.set("toJSON", {
  transform: (doc, ret) => {

    ret.id = ret._id.toString();

    // Convert references to frontend friendly fields
    if (ret.vehicle_id) ret.vehicleId = ret.vehicle_id;
    if (ret.driver_id) ret.driverId = ret.driver_id;

    delete ret._id;
    delete ret.__v;
    delete ret.vehicle_id;
    delete ret.driver_id;

  },
});

module.exports = mongoose.model("Trip", tripSchema);