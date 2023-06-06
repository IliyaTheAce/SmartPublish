const mongoose = require("mongoose");
const targetSchema = new mongoose.Schema({
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "Target",
  },
  failed: { type: Boolean },
  sent: { type: Boolean },
});
const JobSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "Worker",
  },
  // targets: [targetSchema],
  targets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Target" }],
  completed: { type: Boolean, require: true, default: false },
  startedTime: { type: Date, require: true, default: Date.now() },
  endDate: { type: Date, require: false },
});

module.exports = mongoose.model("Job", JobSchema);
