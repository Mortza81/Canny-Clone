const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const AppError = require("./utils/AppError");

const app = express();
const globalErrorHandler = require("./controllers/errorController");

dotenv.config();
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
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
