require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./db");

// Connect MongoDB BEFORE anything else
connectDB();

const authRoutes        = require("./routes/auth");
const vehicleRoutes     = require("./routes/vehicles");
const driverRoutes      = require("./routes/drivers");
const tripRoutes        = require("./routes/trips");
const maintenanceRoutes = require("./routes/maintenance");
const expenseRoutes     = require("./routes/expenses");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("FleetFlow API running");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/expenses", expenseRoutes);

// Start server
app.listen(PORT, () => {

  console.log("=================================");
  console.log(`Server running on port ${PORT}`);
  console.log("=================================");

});