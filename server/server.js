// const express = require("express");
// const cors = require("cors");

// // Import your new routes file
// const scanRoutes = require("./routes/scanRoutes");

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Tell Express to use your routes file for anything starting with '/api/scan'
// app.use("/api/scan", scanRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



//NEw

const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

// Middleware to allow your server to read JSON data from AJAX requests
app.use(express.json());

// 1. Import your route files
const authRoutes = require("./routes/authRoute");
const requestRoutes = require("./routes/requestRoute");
const scanRoutes = require("./routes/scanRoutes");



// 2. Connect the routes to base URLs
// This means all routes in authRoutes.js will start with '/api/auth'
app.use("/api/auth", authRoutes);

// All routes in requestRoutes.js will start with '/api/requests'
app.use("/api/requests", requestRoutes);

// All routes in scanRoutes.js will start with '/api/scan'
app.use("/api/scan", scanRoutes);


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});