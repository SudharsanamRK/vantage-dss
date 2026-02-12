require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/pond", require("./src/routes/pondRoutes"));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
