// mongodb://127.0.0.1:27017/Auth
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://userinfo:userinfo1234@map.z5zhafs.mongodb.net/?retryWrites=true&w=majority&appName=map');

const user = mongoose.Schema({
  name: String,
  email: String,
  mobileNo: String,
  dob: Date,
  address: String,
  profileImage: String, // Store the URL or file path of the image
  password: String,
});

module.exports = mongoose.model("user", user);