/* register API */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  createUser,
  findUserByEmail,
  getPendingUsers,
  approveUser
} = require("../models/userModel");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser(name, email, hashedPassword, role);

    res.status(201).json({
      message: "Registered successfully. Waiting for admin approval."
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* login API */

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (user.status !== "approved") {
      return res.status(403).json({
        message: "Account not approved yet"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({
  token,
  user: {
    id: user.id,
    email: user.email,
    role: user.role
  }
});

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};