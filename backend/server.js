require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "http://localhost:8080",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use("/api", require("./routes/userRoutes"));
app.use("/api", require("./routes/otpRoutes"));

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});