const otpGenerator = require("otp-generator");
const db = require("../config/db");
const transporter = require("../services/emailService");

/* SEND OTP */

exports.sendOTP = (req, res) => {
  const { email } = req.body;

  db.query(
    "SELECT id FROM users WHERE email=?",
    [email],
    (err, userResults) => {

      if (err) return res.status(500).json({ message: "Database error" });

      if (userResults.length === 0)
        return res.status(400).json({ message: "User not found" });

      const userId = userResults[0].id;

      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
      });

      const expires = new Date(Date.now() + 5 * 60 * 1000);

      db.query(
        "DELETE FROM otps WHERE user_id=?",
        [userId],
        () => {

          db.query(
            "INSERT INTO otps (user_id, otp_code, expires_at) VALUES (?, ?, ?)",
            [userId, otp, expires],
            async (err) => {

              if (err) return res.status(500).json({ message: "Database error" });

              const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "CareConnect OTP Verification",
                text: `Your OTP is ${otp}`
              };

              try {
                await transporter.sendMail(mailOptions);
                res.json({ message: "OTP sent successfully" });
              } catch (error) {
                res.status(500).json({ message: "Email failed" });
              }

            }
          );

        }
      );

    }
  );
};

/* VERIFY OTP */

exports.verifyOTP = (req, res) => {

  const { email, otp } = req.body;

  db.query(
    "SELECT id FROM users WHERE email=?",
    [email],
    (err, userResults) => {

      if (err) return res.status(500).json({ message: "Database error" });

      if (userResults.length === 0)
        return res.status(400).json({ message: "User not found" });

      const userId = userResults[0].id;

      db.query(
        "SELECT * FROM otps WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
        [userId],
        (err, results) => {

          if (err) return res.status(500).json({ message: "Database error" });

          if (results.length === 0)
            return res.status(400).json({ message: "OTP not found" });

          const record = results[0];

          if (record.otp_code !== otp)
            return res.status(400).json({ message: "Invalid OTP" });

          if (new Date() > record.expires_at)
            return res.status(400).json({ message: "OTP expired" });

          db.query(
            "UPDATE users SET is_verified=1 WHERE id=?",
            [userId]
          );

          db.query(
            "UPDATE otps SET verified=1 WHERE id=?",
            [record.id]
          );

          res.json({
            success: true,
            message: "OTP verified"
          });

        }
      );

    }
  );

};