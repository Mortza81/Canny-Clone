const express = require("express");
const appError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const app = express();
app.use(express.json({ limit: "10kb" }));
app.use("/api/v1/users", require("./router/userRouter"));
app.all("*", (req, res, next) => {
console.log('fdafafas')
  next(new appError(`${req.originalUrl} not found`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
