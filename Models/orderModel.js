const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  employer: { type: String, require: true },
  messages: [{ type: String, default: "Hello __username__" }],
  highPriority: { type: Boolean, default: false },
});

module.exports = mongoose.model("Order", OrderSchema);
