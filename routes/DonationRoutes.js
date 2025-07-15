const express = require ("express");
const {
  createDonation,
  verifyDonation,
  getAllDonations,
  getUserDonations,
} = require ("../controllers/DonationController.js");
const { protect, isAdmin } = require ("../middleware/Auth.js");

const router = express.Router();

router.post("/add", createDonation);
router.get("/my", protect, getUserDonations);
router.get("/", protect, isAdmin, getAllDonations);
router.patch("/:id/verify", protect, isAdmin, verifyDonation);

module.exports = router;
