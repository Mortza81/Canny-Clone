const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();
mongoose.connect(process.env.DB_URL).then((con) => {
  console.log("let's go");
});
const server = app.listen(process.env.PORT, () => {
  console.log("app is running.");
});
