const express = require("express");
const appError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const app = express();
app.use(express.json({ limit: "10kb" }));
app.use("/api/v1/users", require("./router/userRouter"));
app.use("/api/v1/requests", require("./router/requestRouter"));
app.all("*", (req, res, next) => {
  next(new appError(`${req.originalUrl} not found`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
