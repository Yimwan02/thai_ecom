const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "thai_db"
});

db.connect((err) => {
  if (err) console.log("DB Error:", err);
  else console.log("Connected to MySQL");
});

module.exports = db;