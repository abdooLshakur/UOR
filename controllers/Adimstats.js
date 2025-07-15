// routes/adminRoutes.js
const express = require("express");
const Donation = require("../models/DonationModal");
const Cause = require("../models/CauseModal");
const User = require("../models/UserModel");

// GET Admin Stats
const AdminStats = async (req, res) => {
  try {
    const totalDonations = await Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    const totalDonors = await User.countDocuments();
    const totalCauses = await Cause.countDocuments();
    const verifiedDonations = await Donation.countDocuments({ status: "verified" });
    const pendingDonations = await Donation.countDocuments({ status: "pending" });

    res.json({
      totalDonations: totalDonations[0]?.total || 0,
      totalDonors,
      totalCauses,
      verifiedDonations,
      pendingDonations
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};

module.exports = AdminStats;
