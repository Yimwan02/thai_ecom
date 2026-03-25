const express = require("express");
const cors = require("cors");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// // เรียก routes
const authRoutes = require("./routes/auth");
const productTypeRoutes = require("./routes/productType"); 

app.use("/api", authRoutes);
app.use("/api/product-types", productTypeRoutes); 

// test
app.get("/", (req, res) => {
  res.send("API running...");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});