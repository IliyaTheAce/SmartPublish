const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema({
  username: { type: String, require: true },
  order: { type: mongoose.Schema.Types.ObjectId },
  reserved: { type: Boolean, default: false },
  sent: { type: Boolean, default: false },
  sendDate: { type: Date, require: false },
  isPrivate: { type: Boolean, default: false },
});

module.exports = mongoose.model("Target", targetSchema);
