const express = require("express");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


// LOGIN
router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email"
      });
    }

    const valid = await user.comparePassword(password);

    if (!valid) {
      return res.status(401).json({
        error: "Invalid password"
      });
    }

    const token = jwt.sign(

      {
        id: user._id,
        email: user.email
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "24h"
      }

    );

    res.json({
      token,
      user: user.toJSON()
    });

  }
  catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });

  }

});


// REGISTER
router.post("/register", async (req, res) => {

  try {

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields required"
      });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        error: "Email already exists"
      });
    }

    const user = new User({

      name,
      email,
      password,
      role: role || "dispatcher"

    });

    await user.save();

    const token = jwt.sign(

      {
        id: user._id,
        email: user.email
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "24h"
      }

    );

    res.json({
      token,
      user: user.toJSON()
    });

  }
  catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });

  }

});


module.exports = router;