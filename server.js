const express = require("express");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

/* ================= USER STORAGE ================= */
const USERS_FILE = path.join(__dirname, "users.json");

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return {};
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

/* ================= MESSAGE STORAGE ================= */
const MSG_FILE = path.join(__dirname, "messages.json");

function loadMessages() {
  if (!fs.existsSync(MSG_FILE)) return [];
  return JSON.parse(fs.readFileSync(MSG_FILE, "utf-8"));
}

function saveMessages(messages) {
  fs.writeFileSync(MSG_FILE, JSON.stringify(messages, null, 2));
}

/* ================= EMAIL CONFIG ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "diyu301009@gmail.com",
    pass: "ytodwutyvzvmtmmq"
  }
});

/* ================= ROUTES ================= */

/* ===== LOGIN ===== */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();

  if (users[email] && users[email].password === password) {
    return res.send("ACCESS_GRANTED");
  }

  res.send("ACCESS_DENIED");
});

/* ===== UPDATE USER ===== */
app.post("/update-user", (req, res) => {
  const { email, username, password } = req.body;
  const users = loadUsers();

  if (!users[email]) {
    return res.status(400).send("User not found");
  }

  if (username && username.trim() !== "") {
    users[email].username = username;
  }

  if (password && password.trim() !== "") {
    users[email].password = password;
  }

  saveUsers(users);
  res.send("UPDATED");
});

/* ===== FORGOT PASSWORD ===== */
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const users = loadUsers();

  if (!users[email]) {
    return res.send("If registered, a new password has been sent.");
  }

  const newPassword = Math.random().toString(36).slice(-8);
  users[email].password = newPassword;
  saveUsers(users);

  try {
    await transporter.sendMail({
      from: "MY CHAT <diyu301009@gmail.com>",
      to: email,
      subject: "Your New Password",
      text: `Your new password is: ${newPassword}`
    });

    res.send("If registered, a new password has been sent.");
  } catch (err) {
    console.log("Email error:", err);
    res.status(500).send("Email error");
  }
});

/* ===== SEND MESSAGE (Supports BOTH Old + Private Chat) ===== */
app.post("/send", (req, res) => {
  const { email, sender, receiver, message, time } = req.body;

  const users = loadUsers();
  const messages = loadMessages();

  /* ===== OLD SYSTEM SUPPORT ===== */
  if (email && message) {
    if (!users[email]) {
      return res.status(400).send("User not found");
    }

    const username = users[email].username || "Unknown";

    messages.push({
      type: "global",
      email,
      username,
      message,
      time
    });

    saveMessages(messages);
    return res.sendStatus(200);
  }

  /* ===== PRIVATE CHAT SYSTEM ===== */
  if (sender && receiver && message) {
    if (!users[sender] || !users[receiver]) {
      return res.status(400).send("User not found");
    }

    messages.push({
      type: "private",
      sender,
      receiver,
      senderUsername: users[sender].username || "Unknown",
      receiverUsername: users[receiver].username || "Unknown",
      message,
      time
    });

    saveMessages(messages);
    return res.sendStatus(200);
  }

  res.status(400).send("Invalid message format");
});

/* ===== GET ALL MESSAGES (Old System) ===== */
app.get("/messages", (req, res) => {
  try {
    const messages = loadMessages();
    res.json(messages);
  } catch (error) {
    console.log("Error loading messages:", error);
    res.json([]);
  }
});

/* ===== GET PRIVATE CHAT BETWEEN TWO USERS ===== */
app.get("/messages/:user1/:user2", (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const messages = loadMessages();

    const filtered = messages.filter(msg =>
      msg.type === "private" &&
      (
        (msg.sender === user1 && msg.receiver === user2) ||
        (msg.sender === user2 && msg.receiver === user1)
      )
    );

    res.json(filtered);
  } catch (error) {
    console.log("Error loading private messages:", error);
    res.json([]);
  }
});

/* GET ALL USERS */
app.get("/all-users", (req, res) => {
  const users = JSON.parse(fs.readFileSync("users.json"));
  const userArray = Object.keys(users).map(email => ({
    email,
    username: users[email].username
  }));
  res.json(userArray);
});

/* GET USER INFO */
app.get("/user-info/:email", (req, res) => {
  const users = JSON.parse(fs.readFileSync("users.json"));
  res.json(users[req.params.email]);
});

/* ================= START SERVER ================= */ 
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on network at port ${PORT}`);
});
