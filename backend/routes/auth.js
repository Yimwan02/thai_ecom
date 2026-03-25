const express = require("express");
const router = express.Router();
const db = require("../config/db");
const md5 = require("md5");
const authController = require("../controllers/authController");

router.post("/register", authController.register);
// ================= LOGIN =================
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, md5(password)],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length > 0) {
        res.json({
          message: "Login success",
          user: result[0]
        });
      } else {
        res.status(401).json({ message: "Invalid login" });
      }
    }
  );
});


// ================= GET USERS =================
router.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) {
      console.log("GET ERROR:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});


// ================= CREATE USER =================
router.post("/users", (req, res) => {
  const { username, password, role_id } = req.body;

  db.query(
    "INSERT INTO users (username, password, role_id) VALUES (?, ?, ?)",
    [username, md5(password), Number(role_id)],
    (err) => {
      if (err) {
        console.log("CREATE ERROR:", err);
        return res.status(500).json(err);
      }
      res.json({ message: "Create success" });
    }
  );
});


// ================= UPDATE ROLE =================
router.put("/users/:id", (req, res) => {
  const id = req.params.id;
  const role_id = Number(req.body.role_id);

  db.query(
    "UPDATE users SET role_id = ? WHERE user_id = ?",
    [role_id, id],
    (err) => {
      if (err) {
        console.log("UPDATE ERROR:", err);
        return res.status(500).json(err);
      }
      res.json({ message: "Update success" });
    }
  );
});


// ================= DELETE USER =================
router.delete("/users/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "DELETE FROM users WHERE user_id = ?",
    [id],
    (err) => {
      if (err) {
        console.log("DELETE ERROR:", err);
        return res.status(500).json(err);
      }
      res.json({ message: "Delete success" });
    }
  );
});

module.exports = router;