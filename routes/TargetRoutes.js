const express = require("express");
const router = express.Router();
const Target = require("../Models/targetModel");

router.get("/get/:amount", async (req, res) => {
    try {
        const amount = req.params.amount;
        const targets = await Target.find(
            {isPrivate: false, sent: false, reserved: false},
            {username: 1}
        ).limit(amount);

        targets.forEach((target) => {
            target.reserved = true;
            target.save();
        });

        if (targets.length === 0) {
            res.status(400);
            res.send("No target available.");
        } else {
            res.send(targets);
        }
    } catch (err) {
        res.status(400);
        // res.send("Internal server error! please check the server");
        res.send(err.message);
    }
});

router.get("/getAllTargets", async (req, res) => {
    try {
        const targets = await Target.find().populate('order')
        res.json(targets)
    } catch (err) {
        res.status(400);
        // res.send("Internal server error! please check the server");
        res.send(err.message);
    }
});

router.post("/insert", async (req, res) => {
    try {
        const {usernames, order} = req.body;
        const docs = usernames.map((item) => {
            return {username: item, order: order}
        })
        console.log(docs)
        const result = Target.insertMany(docs);
        res.send("Targets successfully inserted.");
    } catch (err) {
        res.status(400);
        res.send("Internal server error! please check the server");
    }
});

router.patch("/send", async (req, res) => {
    try {
        const {username} = req.body;
        const target = await Target.findOne({username: username}).exec();
        if (target) {
            target.sent = true;
            target.sendDate = Date.now();
            await target.save();
            res.send("Targets successfully updated.");
        } else {
            res.send("No target");
        }
    } catch (err) {
        res.status(400);
        // res.send("Internal server error! please check the server");
        res.send(err.message);
    }
});

router.patch("/unreserveAllTargets", async (req, res) => {
    try {
        const result = await Target.updateMany(
            {},
            {
                reserved: false,
            }
        );
        console.log(result);
        res.send("All targets got updated");
    } catch (err) {
        res.status(400);
        // res.send("Internal server error! please check the server");
        res.send(err.message);
    }
});

module.exports = router;
