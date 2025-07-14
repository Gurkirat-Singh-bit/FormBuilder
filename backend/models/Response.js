const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  uid: String,
  responses: Object,
});

module.exports = mongoose.model("Response", responseSchema);
