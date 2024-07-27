/* eslint-disable import/no-extraneous-dependencies */
const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const AppError = require("./utils/appError");
const logger = require("./logger");
const app = express();
const globalErrorHandler = require("./controllers/errorController");

dotenv.config();

app.use((req, res, next) => {
  logger.info(`Request received: ${req.method} ${req.url}`);
  next();
});
app.use(compression());
// preventing nosql injection
app.use(mongoSanitize());
// set security http headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
// limit requests from one IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  // 1 hour
  message: "too many request by your IP, you are banned for 1 hour",
});
app.use("/api", limiter);
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res, next) => {
  res.json({
    status: "success",
    message:
      "Welcome to Canny's Clone, See the documentation on: https://documenter.getpostman.com/view/34412693/2sA3XY6dap",
  });
});
app.use("/api/v1/users", require("./router/userRouter"));
app.use("/api/v1/requests", require("./router/requestRouter"));
app.use("/api/v1/comments", require("./router/commentRouter"));
app.use("/api/v1/interactions", require("./router/interactionsRouter"));

app.all("*", (req, res, next) => {
  next(new AppError(`${req.originalUrl} not found`, 404));
});
app.use((err, req, res, next) => {
  logger.error(`${err.statusCode} ${req.method} ${req.originalUrl} ${err.message} - ${err.stack}`);
  next(err);
});
app.use(globalErrorHandler);
module.exports = app;
