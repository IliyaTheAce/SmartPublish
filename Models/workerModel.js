const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
  username: { type: String, require: true },
  password: { type: String, require: true },
  allowedDirectCount: { type: Number, require: true },
  createdTime: { type: Date, default: Date.now() },
  lastUsed: { type: Date },
  nextShift: { type: Date },
  allowedToSend: { type: Boolean, require: true, default: true },
});

module.exports = mongoose.model("Worker", workerSchema);
