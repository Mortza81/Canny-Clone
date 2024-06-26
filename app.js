/* eslint-disable import/no-extraneous-dependencies */
const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const AppError = require("./utils/AppError");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" },
);
const app = express();
const globalErrorHandler = require("./controllers/errorController");

dotenv.config();
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", { stream: accessLogStream }));
}
app.use(compression());
// preventing nosql injection
app.use(mongoSanitize());
// preventing inserting html
app.use(xss());
// set security http headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
// app.use(express.static(''))
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
app.use("/api/v1/users", require("./router/userRouter"));
app.use("/api/v1/requests", require("./router/requestRouter"));
app.use("/api/v1/comments", require("./router/commentRouter"));
app.use("/api/v1/interactions", require("./router/interactionsRouter"));

app.all("*", (req, res, next) => {
  next(new AppError(`${req.originalUrl} not found`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
