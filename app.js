require("dotenv").config();
const express = require("express");
const app = express();
// const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dbUrl = process.env.MONGODB_CONNECTION_PATH;
const cors = require("cors");

const JobRoutes = require("./routes/JobRoutes");
const WorkerRoutes = require("./routes/WorkerRoutes");
const TargetRoutes = require("./routes/TargetRoutes");
const OrderRoutes = require("./routes/OrderRoutes");

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to database.");
  })
  .catch(() => {
    console.log("Could not connect to database.");
  });

app.use(express.json());
app.use(cors());
app.use("/", JobRoutes);
app.use("/worker", WorkerRoutes);
app.use("/targets", TargetRoutes);
app.use("/orders", OrderRoutes);

app.listen(process.env.PORT, () => {
  console.log("app is listening on port: " + process.env.PORT);
});
