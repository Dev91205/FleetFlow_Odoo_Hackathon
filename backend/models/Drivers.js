const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
  },

  license: {
    type: String,
    required: true,
    unique: true,
  },

  license_expiry: {
    type: Date,
    required: true,
  },

  type: {
    type: String,
  },

  completion_rate: {
    type: Number,
    default: 0,
  },

  safety_score: {
    type: Number,
    default: 100,
  },

  complaints: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    enum: ["On Duty", "Off Duty", "Suspended"],
    default: "On Duty",
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

});


driverSchema.set("toJSON", {
  transform: (doc, ret) => {

    ret.id = ret._id.toString();

    delete ret._id;
    delete ret.__v;

  },
});

module.exports = mongoose.model("Driver", driverSchema);