const express = require("express");
const router = express.Router();
const Job = require("../Models/jobModel");
const Worker = require("../Models/workerModel");
const Target = require("../Models/targetModel");

router.get("/getNewJob", async (req, res) => {
  try {
    //Get worker
    const worker = await Worker.findOne({
      allowedToSend: true,
      $or: [{ nextShift: { $lte: Date.now() } }, { nextShift: undefined }],
    });

    if (worker) {
      //Get Targets
      const amount = worker.allowedDirectCount;
      const targets = await Target.find(
        { isPrivate: false, sent: false, reserved: false },
        { username: 1 }
      ).limit(amount);

      if (targets.length !== 0) {
        //Mark worker as Working
        worker.lastUsed = Date.now();
        const nextShiftDate = new Date(Date.now());
        nextShiftDate.setHours(nextShiftDate.getHours() + 24);
        worker.nextShift = nextShiftDate;
        await worker.save();
        //Mark targets as reserved
        targets.forEach((target) => {
          target.reserved = true;
          target.save();
        });

        const filteredTargets = [];
        await targets.forEach((tar) => {
          filteredTargets.push(tar._id);
        });
        //Create job
        const job = new Job({
          workerId: worker._id,
          targets: filteredTargets,
        });
        job.save();
        res.json({
          jobId: job._id,
          username: worker.username,
          password: worker.password,
          target: targets,
        });
      } else {
        res.status(400);
        res.send("No target available.");
      }
    } else {
      res.status(400);
      res.send("No worker available.");
    }
  } catch (err) {
    res.status(400);
    // res.send("Internal server error! please check the server");
    res.send(err.message);
  }
});

router.get("/getJob/:jobId", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId)
      .populate("targets")
      .populate("workerId");
    res.json(job);
  } catch (err) {
    res.status(400);
    // res.send("Internal server error! please check the server");
    res.send(err.message);
  }
});

router.get("/getJobs", async (req, res) => {
  try {
    const job = await Job.find().populate("workerId");
    res.json(job);
  } catch (err) {
    res.status(400);
    // res.send("Internal server error! please check the server");
    res.send(err.message);
  }
});

router.patch("/finished", async (req, res) => {
  try {
    const { jobId, failed, success } = req.body;
    const job = await Job.findById(jobId).populate().exec();
    if (job) {
      // if (job.completed === true) {
      //   res.send("Job is already completed");
      //   return;
      // }

      job.completed = true;
      job.endDate = Date.now();

      failed.forEach(async (target) => {
        const tar = await Target.findById(target._id);
        tar.isPrivate = true;
        tar.sent = false;
        await tar.save();
      });

      success.forEach(async (target) => {
        const tar = await Target.findById(target._id);
        tar.sent = true;
        tar.sendDate = Date.now();
        await tar.save();
      });

      await job.save();
      res.send("Job updated.");
    } else {
      res.send("No Job");
    }
  } catch (err) {
    res.status(400);
    res.send(err.message);
  }
});

module.exports = router;
