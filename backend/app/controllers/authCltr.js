const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const Poll = require("../models/Poll");

const userCltr = {};

// Generate token func
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Register User
userCltr.registerUser = async (req, res) => {
  const body = _.pick(req.body, [
    "username",
    "fullName",
    "email",
    "password",
    "profileImageUrl",
  ]);

  // Validation check for missing fields
  if (!body.fullName || !body.username || !body.email || !body.password) {
    console.log("ee");
    return res.status(400).json({ message: "All feilds are required" });
  }

  // Validations : Check username format
  // Allow alpha numeric characters and hyphens only
  const usernameRegex = /^[a-zA-Z0-9-]+$/;
  if (!usernameRegex.test(body.username)) {
    return res.status(400).json({
      message:
        "Invalid username. Only aplhanumeric and hyphens are allowed. No spaces are permitted,",
    });
  }

  if (body.password.length < 8 || body.password.length > 128) {
    return res
      .status(400)
      .json({ message: "Password should be between 8 to 128 Character" });
  }

  try {
    // check email & username if already exist
    const existEmail = await User.findOne({ email: body.email });
    if (existEmail) {
      return res.status(400).json({ message: "Email already exist" });
    }

    const existUser = await User.findOne({ username: body.username });
    if (existUser)
      return res.status(400).json({ message: "Username alreadfy exist" });

    const user = await User.create({
      fullName: body.fullName,
      username: body.username,
      email: body.email,
      password: body.password,
      profileImageUrl: body.profileImageUrl,
    });

    res.json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Error registering user", error: e.message });
  }
};

userCltr.loginUser = async (req, res) => {
  const { email, password } = _.pick(req.body, ["email", "password"]);

  if (!email || !password)
    return res.status(400).json({ message: "All fiels are required" });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid UserName/Password" });
    }

    // Count polls created by user
    const totalPollsCreated = await Poll.countDocuments({ creator: user._id });

    //Count Polls the user has voted in
    const totalPollsVotes = await Poll.countDocuments({ voters: user._id });

    //Get the count of Bookmarked polls
    const totalPollsBookmarked = user.bookmarkedPolls.length;

    // const isMatch = await user.comparePassword(password)
    // const resultPass = await user.comparePassword(password)
    // console.log({passEnt : password, passStored : user.password, isMatch})

    // const myRes = await bcrypt.compare(password,user.password)
    // console.log('myres',myRes)

    res.json({
      id: user._id,
      user: {
        ...user.toObject(),
        totalPollsCreated,
        totalPollsVotes,
        totalPollsBookmarked,
      },
      token: generateToken(user._id),
    });
  } catch (e) {
    res.status(500).json({ message: "Error login", error: e.message });
  }
};

userCltr.getUserInfo = async (req, res) => {

  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // Count polls created by user
    const totalPollsCreated = await Poll.countDocuments({ creator: user._id });

    //Count Polls the user has voted in
    const totalPollsVotes = await Poll.countDocuments({ voters: user._id });

    //Get the count of Bookmarked polls
    const totalPollsBookmarked = user.bookmarkedPolls.length;

    //  Add additional attributes
    const userInfo = {
      ...user.toObject(),
      totalPollsCreated,
      totalPollsVotes,
      totalPollsBookmarked,
    };
    res.json(userInfo);
  } catch (e) {
    res
      .status(500)
      .json({ message: " Error while fetching account", error: e.message });
  }
};

module.exports = userCltr;
