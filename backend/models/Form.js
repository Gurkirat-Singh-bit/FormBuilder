const mongoose = require("mongoose");
const formSchema = new mongoose.Schema({
  title: String,
  description: String,
  fields: Array,
  ownerId: String,
  createdAt: { type: Date, default: Date.now },
  shareId: String, // optional but useful
});

const Form = mongoose.model("Form", formSchema);

module.exports = Form;
