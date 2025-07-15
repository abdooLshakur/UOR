const express = require("express");
const {
  createCause,
  getAllCauses,
  getCauseById,
  updateCause,
  deleteCause,
} = require("../controllers/CauseController.js");
const { protect, isAdmin } = require("../middleware/auth.js");
const upload = require("../middleware/Fileuploads.js")
const router = express.Router();

// Public Routes
router.get("/", getAllCauses);
router.get("/:id", getCauseById);

// Admin Routes
router.post("/add", protect, isAdmin, upload.array('images', 10), createCause);
router.patch("/:id", protect, isAdmin, upload.array('images', 10), updateCause);
router.delete("/:id", protect, isAdmin, deleteCause);

module.exports = router;
