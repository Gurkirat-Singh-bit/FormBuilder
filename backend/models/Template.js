const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  uid: String,
  templates: Array,
});

module.exports = mongoose.model("Template", templateSchema);
