const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username cannot be left empty"],
  },
  password: {
    type: String,
    required: [true, "Password cannot be empty"],
  },
  email: {
    type: String,
    required: [true, "Username cannot be left empty"],
  },
  age: {
    type: String,
    required: [true, "Username cannot be left empty"],
  },
});

module.exports = mongoose.model("User", userSchema);
