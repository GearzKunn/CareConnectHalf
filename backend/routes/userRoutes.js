const express = require("express");
const router = express.Router();

const {
  register,
  login
} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const {
  getPendingUsers,
  approveUser
} = require("../models/userModel");

router.post("/register", register);
router.post("/login", login);

router.get(
  "/users/pending",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    const users = await getPendingUsers();
    res.json(users);
  }
);

router.put(
  "/users/approve/:id",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    await approveUser(req.params.id);
    res.json({ message: "User approved successfully" });
  }
);

module.exports = router;