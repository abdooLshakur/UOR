const  express = require("express");
const  { registerUser, loginUser, getUserProfile, getDonorProfile, logoutUser, getAllDonors, updateDonorProfile, contactUs, registerAdmin } = require( "../controllers/UserController.js");
const  { protect, isAdmin } = require( "../middleware/Auth.js");
const AdminStats = require("../controllers/Adimstats.js");

const router = express.Router();

router.post("/register", registerUser);
router.post("/Adminregister", registerAdmin);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/contactus", contactUs);
router.put("/update-profile", protect, updateDonorProfile);
router.get("/donor", protect, getDonorProfile);
router.get("/me", protect, getUserProfile);
router.get("/stats", AdminStats)
router.get("/", protect, isAdmin, getAllDonors);

module.exports = router;
