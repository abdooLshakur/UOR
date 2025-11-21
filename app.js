require('dotenv').config(); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const UserRoutes = require("./routes/Userroutes");
const DonationRoutes = require("./routes/DonationRoutes");
const CauseRoutes = require("./routes/CauseRoute");

const app = express();
const port = process.env.PORT;
const SECRET_KEY = process.env.SECRET_KEY;
const dbUrl = process.env.DB_URL;

if (!dbUrl || !SECRET_KEY) {
  console.error("Missing critical environment variables!");
  process.exit(1);
}

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://ummaofrasulullahcharityfoundation.com"
  ],
  credentials: true,
}));



app.options('*', cors({
  origin: [
    "http://localhost:3000",
    "www.https://ummaofrasulullahcharityfoundation.com",
    "https://ummaofrasulullahcharityfoundation.com"
  ],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(dbUrl)
  .then(() => console.log("Database connection established"))
  .catch((err) => console.log(err.message));

// Routes
app.get("/", (req, res) => {
  res.send("WELCOME TO UOR CHARITY FOUNDATION");
});
app.use("/api/users", UserRoutes);
app.use("/api/donations", DonationRoutes);
app.use( "/api/causes",CauseRoutes);


// Start server
app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
