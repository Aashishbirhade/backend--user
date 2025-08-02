const express = require("express");
const app = express();
const usermodel = require("./models/user");
const cookieParser = require("cookie-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");


app.use(cors({ origin: "http://localhost:5173", credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'] })); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, "Aashish", (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};
app.get("/", (req, res) => {
    res.send("Hello Buddy");
});


app.post("/register", async (req, res) => {
  try {
    const { name, email, mobileNo, dob, address, profileImage, password } = req.body;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create user with additional fields
    const user = await usermodel.create({
      name,
      email,
      mobileNo,
      dob,
      address,
      profileImage,
      password: hash,
    });

    // Generate JWT token
    const token = jwt.sign({ email }, "Aashish", { expiresIn: "1h" });
   res.cookie("token", token, {
  httpOnly: true,
  secure: true, // 🔴 Required for HTTPS (Render uses HTTPS)
  sameSite: "none", // 🔴 Required for cross-site cookies
  maxAge: 3600000, // 1 hour expiry
});
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await usermodel.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ email: user.email }, "Aashish", { expiresIn: "1h" });
   res.cookie("token", token, {
  httpOnly: true,
  secure: true, // 🔴 Required for HTTPS (Render uses HTTPS)
  sameSite: "none", // 🔴 Required for cross-site cookies
  maxAge: 3600000, // 1 hour expiry
});

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: "Login error" });
  }
});


app.get("/profile", authMiddleware, async (req, res) => {
   console.log("Token received:", token); 
  try {
    const user = await usermodel.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Error fetching profile" });
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "", { expires: new Date(0) });
  res.status(200).json({ message: "Logged out successfully" });
});

app.listen(3000, () => console.log("Server running on port 3000"));


