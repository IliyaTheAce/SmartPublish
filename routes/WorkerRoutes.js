const express = require("express");
const router = express.Router();
const Worker = require("../Models/workerModel");
const Target = require("../Models/targetModel");

router.get("/", async (req, res) => {
  try {
    const worker = await Worker.findOne({
      allowedToSend: true,
      $or: [{ nextShift: { $lte: Date.now() } }, { nextShift: undefined }],
    });
    if (worker) {
      worker.lastUsed = Date.now();
      const nextShiftDate = new Date(Date.now());
      nextShiftDate.setHours(nextShiftDate.getHours() + 24);
      worker.nextShift = nextShiftDate;
      await worker.save();

      res.send({
        username: worker.username,
        password: worker.password,
        allowedDirectCount: worker.allowedDirectCount,
      });
    } else {
      res.status(400);
      res.send("No worker available");
    }
  } catch (err) {
    res.status(400);
    res.send("Internal server error! please check the server");
  }
});

router.post("/create", async (req, res) => {
  try {
    const { username, password, allowedDirectCount } = req.body;
    const newWorker = new Worker({
      username: username,
      password: password,
      allowedDirectCount: allowedDirectCount,
    });
    await newWorker.save();
    res.send("User successfully created");
  } catch (err) {
    res.status(400);
    res.send("Internal server error! please check the server");
  }
});

router.patch("/freeAllWorkers", async (req, res) => {
  try {
    const result = await Worker.updateMany(
      {},
      {
        nextShift: Date.now(),
      }
    );
    res.send("All Workers got updated");
  } catch (err) {
    res.status(400);
    // res.send("Internal server error! please check the server");
    res.send(err.message);
  }
});

module.exports = router;
