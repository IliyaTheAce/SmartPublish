const express = require("express");
const router = express.Router();
const Order = require("../Models/orderModel");

router.get("/", async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        res.status(400);
        // res.send("Internal server error! please check the server");
        res.send(err.message);
    }
});

router.post("/", async (req, res) => {
    try {
        const {employer , messages , highPriority} = req.body;
        const newOrder = await Order.create({employer,messages,highPriority});
        res.json(newOrder);
    } catch (err) {
        res.status(400);
        // res.send("Internal server error! please check the server");
        res.send(err.message);
    }
});

module.exports = router;
