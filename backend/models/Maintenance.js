const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({

  vehicle_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
  },

  issue: String,

  cost: Number,

  status: {
    type: String,
    default: "In Progress",
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model("Maintenance", maintenanceSchema);