const db = require("../config/db");
const md5 = require("md5");

// REGISTER
exports.register = (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = md5(password);

  const sql = "INSERT INTO users (username, password, role_id) VALUES (?, ?, 2)";
  db.query(sql, [username, hashedPassword], (err, result) => {
    if (err) {
      return res.json({ message: "Error" });
    }
    res.json({ message: "Register success" });
  });
};

// LOGIN
exports.login = (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = md5(password);

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, hashedPassword], (err, result) => {
    if (err) {
      return res.json({ message: "Error" });
    }

    if (result.length > 0) {
      res.json({ message: "Login success", user: result[0] });
    } else {
      res.json({ message: "Login failed" });
    }
  });
};