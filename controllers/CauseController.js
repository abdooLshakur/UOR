const Cause = require("../models/CauseModal.js");

const createCause = async (req, res) => {
  try {
    const { title, description, goalAmount, location } = req.body;
    const image = req.file?.filename;

    if (!title || !location) {
      return res.status(400).json({ message: "Title and location are required." });
    }

    const newCause = new Cause({
      title,
      description,
      goalAmount,
      location,
      image
    });

    await newCause.save();
    res.status(201).json(newCause);
  } catch (err) {
    console.error("Error creating cause:", err);
    res.status(500).json({ message: "Error creating cause" });
  }
};

const getAllCauses = async (req, res) => {
  try {
    const { showCompleted, type, search } = req.query;
    let query = {};

    if (showCompleted === "false") query.isCompleted = false;
    if (type) query.type = type;
    if (search) query.title = { $regex: search, $options: "i" };

    const causes = await Cause.find(query).sort({ createdAt: -1 });
    res.status(200).json(causes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch causes", error: err.message });
  }
};

const getCauseById = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid cause ID" });
    }
    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ message: "Cause not found" });
    res.status(200).json(cause);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cause", error: err.message });
  }
};

const updateCause = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, goalAmount, status, location } = req.body;
    const image = req.file?.filename;

    const updated = await Cause.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(goalAmount && { goalAmount }),
        ...(status && { status }),
        ...(location && { location }), // ✅ Add this
        ...(image && { image }),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Cause not found" });

    res.json(updated);
  } catch (err) {
    console.error("Error updating cause:", err);
    res.status(500).json({ message: "Error updating cause" });
  }
};


const deleteCause = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid cause ID" });
    }
    const cause = await Cause.findByIdAndDelete(req.params.id);
    if (!cause) return res.status(404).json({ message: "Cause not found" });
    res.status(200).json({ message: "Cause deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete cause", error: err.message });
  }
};

module.exports = {
  createCause,
  getAllCauses,
  getCauseById,
  updateCause,
  deleteCause,
};
