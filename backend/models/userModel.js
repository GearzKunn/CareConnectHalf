const db = require("../config/db");

exports.createUser = (name, email, hashedPassword, role) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

exports.findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      }
    );
  });
};

exports.getPendingUsers = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, name, email, role FROM users WHERE status = 'pending'",
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
};

exports.approveUser = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE users SET status = 'approved' WHERE id = ?",
      [id],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};