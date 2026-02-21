const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["manager", "dispatcher", "safety", "analyst"],
    default: "dispatcher",
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

});


// HASH PASSWORD BEFORE SAVE
userSchema.pre("save", async function(next) {

  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);

  next();

});


// PASSWORD COMPARE FUNCTION
userSchema.methods.comparePassword = async function(password) {

  return await bcrypt.compare(password, this.password);

};


// CRITICAL FIX: convert _id → id for frontend
userSchema.set("toJSON", {
  transform: (doc, ret) => {

    ret.id = ret._id.toString();

    delete ret._id;
    delete ret.__v;
    delete ret.password;

  },
});

module.exports = mongoose.model("User", userSchema);