const express = require("express");
const appError = require("./utils/appError");
const path=require('path')
const dotenv = require("dotenv");
dotenv.config();
const globalErrorHandler = require("./controllers/errorController");
const app = express();
const morgan=require('morgan')
if(process.env.NODE_ENV=='development'){
  app.use(morgan('dev'))
}
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, 'public')))
app.use("/api/v1/users", require("./router/userRouter"));
app.use("/api/v1/requests", require("./router/requestRouter"));
app.use('/api/v1/comments',require('./router/commentRouter'))
app.use('/api/v1/interactions',require('./router/interactionsRouter'))
app.all("*", (req, res, next) => {
  next(new appError(`${req.originalUrl} not found`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
