const Donation = require("../models/DonationModal.js");
const Cause = require("../models/CauseModal.js");
const User = require("../models/UserModel.js");

// Submit a donation (guest or logged-in)
const createDonation = async (req, res) => {
  try {
    const { causeId, donorName, email, amount, note, reference } = req.body;
    const userId = req.user?.id || null;  

    const donation = new Donation({
      userId, 
      causeId,
      donorName,
      email,
      amount,
      note,
      reference,
    });

    await donation.save();
    res.status(201).json({ message: "Donation submitted and pending verification." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit donation" });
  }
};


// Admin verifies donation
const verifyDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await Donation.findById(id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    // Update status
    donation.status = "Verified";
    donation.verifiedBy = req.user.id;
    donation.verifiedAt = new Date();
    await donation.save();

    // Update cause raisedAmount
    const cause = await Cause.findById(donation.causeId);
    if (cause) {
      cause.raisedAmount += donation.amount;
      await cause.save();
    }

    res.status(200).json({ message: "Donation verified", donation });
  } catch (err) {
    res.status(500).json({ message: "Failed to verify donation", error: err.message });
  }
};

// Get all donations (admin view)
const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().populate("userId", "fullName email").populate("causeId", "title").sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (err) {
    res.status(500).json({ message: "Error fetching donations" });
  }
};

const getUserDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      userId: req.user.id,
      status: "Verified",  
    })
      .populate("causeId", "title")
      .sort({ createdAt: -1 });

    const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);
    const causesSupported = new Set(donations.map(d => d.causeId?._id?.toString())).size;
    const lastDonation = donations[0] || null;


    res.status(200).json({
      totalDonated,
      causesSupported,
      lastDonation,
      recentDonations: donations,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching your donations" });
  }
};


module.exports = {
  createDonation,
  verifyDonation,
  getAllDonations,
  getUserDonations,
};