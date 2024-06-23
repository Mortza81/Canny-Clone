const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();
const server = app.listen(process.env.PORT, () => {
  console.log("app is running.");
});
