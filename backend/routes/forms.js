// GET all forms created by a specific user
const express = require("express");
const router = express.Router();
const Form = require("../models/Form"); // adjust path if needed
router.get("/my-forms/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const forms = await Form.find({ ownerId: uid }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: "Error fetching forms" });
  }
});
router.post("/create", async (req, res) => {
  try {
    const { uid, formData } = req.body;

    const newForm = new Form({
      ...formData,
      ownerId: uid,
      createdAt: new Date(),
    });

    await newForm.save();
    res.status(201).json(newForm);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving form" });
  }
});
module.exports = router;