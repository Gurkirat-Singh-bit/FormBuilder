const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const formsRouter = require("./routes/forms");
const Response = require("./models/Response");
const Template = require("./models/Template");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/forms", formsRouter);

app.get("/", (req, res) => {
  res.send("API is running");
});

// Save responses
app.post("/api/responses/save", async (req, res) => {
  try {
    const { uid, responses } = req.body;
    await Response.findOneAndUpdate(
      { uid },
      { responses },
      { upsert: true, new: true }
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("Error saving responses", err);
    res.sendStatus(500);
  }
});

// Save templates
app.post("/api/templates/save", async (req, res) => {
  try {
    const { uid, templates } = req.body;
    await Template.findOneAndUpdate(
      { uid },
      { templates },
      { upsert: true, new: true }
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("Error saving templates", err);
    res.sendStatus(500);
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));
