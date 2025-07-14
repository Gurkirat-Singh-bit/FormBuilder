const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/save-user", async (req, res) => {
  const { uid, email, name } = req.body;

  try {
    let user = await User.findOne({ uid });
    if (!user) {
      user = new User({ uid, email, name });
      await user.save();
    }
    res.status(200).json({ message: "User saved", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
