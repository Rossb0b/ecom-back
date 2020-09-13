const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payement');
const productRoutes = require('./routes/product');
const bucketRoutes = require('./routes/bucket');
const commandRoutes = require('./routes/command');

const app = express();

mongoose
  .set('useCreateIndex', true)
  .set('useFindAndModify', false)
  .set('useUnifiedTopology', true)
  .connect("mongodb+srv://rossb0b:" + "X2B5oprvsRy94iwm" + "@cluster0.gqy07.mongodb.net/E-com?retryWrites=true&w=majority", { useNewUrlParser: true })
  .then(() => {
    console.log('connected to database');

  })
  .catch(() => {
    console.log('connection failed');
  });

app.use(bodyParser.json({limit: "100mb", parameterLimit: 100000000}));
app.use(bodyParser.urlencoded({ parameterLimit: 100000000, limit: '100mb', extended: false }));
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/product", productRoutes);
app.use("/api/bucket", bucketRoutes);
app.use("/api/command", commandRoutes);

module.exports = app;