const express = require("express");
const router = express.Router();
const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fileUpload = require("express-fileupload");
const {
  DefaultError,
  AuthenticationErrorHandler,
  NoImageErrorHandler,
  ImageMimeTypeErrorHandler,
} = require("../ErrorHandler");
router.post("/login", async (req, res, next) => {
  try {
    const { user, pass } = req.body;
    let isValidPass = false;
    const info = await User.findOne({ username: user }).exec();
    if (info) {
      isValidPass = await bcrypt.compare(pass, info.password);
      if (isValidPass) {
        let token;
        token = jwt.sign({ userId: info._id }, "superSecret");
        res.status(200);
        res.json({ status: true, token: token });
      }
    }
  } catch (err) {
    res.status(400);
    res.json("Error");
  }
});

router.post("/signUp", async (req, res, next) => {
  try {
    const { user, pass, role, viewName } = req.body;
    const hashed = await bcrypt.hash(pass, 12);
    const newUser = new User({
      username: user,
      password: hashed,
      role: role,
      viewName: viewName,
    });
    newUser.save();
    res.json(`User created with username: ${user}`);
  } catch (err) {
    DefaultError(err, res);
  }
});
router.get("/", async (req, res, next) => {
  try {
    if (AuthenticationErrorHandler(req, res)) return;
    const user = await User.findOne({ _id: req.userId });
    if (user) {
      res.json({
        // viewName: user.viewName,
        // role: user.role,
        // profilePic : user.profilePic,
        // username: user.username
        ...user,
        pass: "",
      });
    }
  } catch (err) {
    DefaultError(err, res);
  }
});
router.get("/Check", async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    if (user) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    DefaultError(err, res);
  }
});

router.patch("/", async (req, res, next) => {
  try {
    if (AuthenticationErrorHandler(req, res)) return;
    const user = await User.findOne({ _id: req.userId });
    if (user) {
      if (req.body.username !== user.username) {
        user.username = req.body.username;
      }
      if (req.body.password && req.body.password !== "") {
        const hashed = await bcrypt.hash(req.body.password, 12);
        user.password = hashed;
      }
      if (req.body.viewName !== user.viewName) {
        user.viewName = req.body.viewName;
      }

      user.save();
    }
    res.json("User info edited successfully.");
  } catch (err) {
    DefaultError(err, res);
  }
});

router.patch("/profilePic", fileUpload(), async (req, res, next) => {
  try {
    if (AuthenticationErrorHandler(req, res)) return;
    const user = await User.findOne({ _id: req.userId });
    const { image } = req.files;
    if (NoImageErrorHandler(image, res)) return;
    if (ImageMimeTypeErrorHandler(image, res)) return;
    const filename = new Date().getTime() + "_" + image.name;
    const path = "../public_html/uploads/" + filename;
    await image.mv(path);
    const imageUrlWebPath = "https://roojam.ir/uploads/" + filename;
    if (user) {
      user.profilePic = imageUrlWebPath;
      user.save();
    }
    res.json("Profile picture changed successfully.");
  } catch (err) {
    DefaultError(err, res);
  }
});

module.exports = router;
