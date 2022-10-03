/**
 * Module dependencies.
 */
const express = require("express");
const compression = require("compression");
const session = require("express-session");
const bodyParser = require("body-parser");
const logger = require("morgan");
const chalk = require("chalk");
const errorHandler = require("errorhandler");
// const lusca = require('lusca');
const dotenv = require("dotenv");
const MongoStore = require("connect-mongo")(session);
const flash = require("express-flash");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
// const sass = require('node-sass-middleware');
const multer = require("multer");
const upload = multer({ dest: path.join(__dirname, "uploads") }).any();

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env.example" });

/**
 * Controllers (route handlers).
 */
const login = require("./routes/login");
const activityLogs = require("./routes/activityLogs");
const files = require("./routes/files");
const superadmin = require("./routes/superadmin");
const events=require('./routes/events')
const posts=require('./routes/posts')
const community= require("./routes/community")
/**
 * API keys and Passport configuration.
 */
const passportConfig = require("./config/passport");

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(process.env.MONGODB_URI);
// mongoose.connect(
//   "mongodb://workspaceAdmin:vcxz7890@localhost:27017/oasis?authSource=admin"
// );
mongoose.connection.on("error", (err) => {
  console.error(err);
  console.log(
    "%s MongoDB connection error. Please make sure MongoDB is running.",
    chalk.red("✗")
  );
  process.exit();
});

const allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
};

/**
 * Express configuration.
 */
app.set("host", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
app.set("port", process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload);
app.use(allowCrossDomain);
app.use(flash());

app.disable("x-powered-by");

app.use("/", login);
app.use("/", activityLogs);
app.use("/", files);
app.use("/", superadmin);
app.use('/',events);
app.use('/',posts);
app.use('/',community);
app.use(express.static(path.join(__dirname, "downloads")));

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === "development") {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Server Error");
  });
}

/**
 * Start Express server.
 */
app.listen(app.get("port"), "0.0.0.0", () => {
  console.log(
    "%s App is running at http://localhost:%d in %s mode",
    chalk.green("✓"),
    app.get("port"),
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});

module.exports = app;
