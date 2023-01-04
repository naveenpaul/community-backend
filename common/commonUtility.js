const jwt = require("jwt-simple");
const validator = require("validator");
const mongoose = require("mongoose");

const JWT_TOKEN_SECRET = "const-@-oasis-@";

function CommonUtility() {}

CommonUtility.prototype.authorizeUser = (req, res, next) => {
  const common = new CommonUtility();

  if (req.headers.authorization) {
    const userId = decodeToken(extractToken(req), JWT_TOKEN_SECRET);
    if (validator.isAlphanumeric(userId)) {
      return next();
    } else {
      return common.sendErrorResponse(res, "Invalid token");
    }
  } else {
    return common.sendErrorResponse(
      res,
      "Token is absent in header. Please login"
    );
  }
};

CommonUtility.prototype.generateToken = function (userId) {
  return jwt.encode({ id: userId }, JWT_TOKEN_SECRET);
};

CommonUtility.prototype.getUserId = function (req) {
  return decodeToken(extractToken(req));
};

CommonUtility.prototype.sendErrorResponse = function (res, msg) {
  res.status(400);
  return res.send({ msg: msg });
};

CommonUtility.prototype.composeUserLoginCredentials = function (user) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    emailId: user.emailId,
    token: new CommonUtility().generateToken(user._id),
  };
};

CommonUtility.prototype.castToObjectId = (id) => {
  return mongoose.Types.ObjectId(id);
};

CommonUtility.prototype.castToObjectIdList = (ids) => {
  return ids.map((id) => {
    mongoose.Types.ObjectId(String(id));
  });
};

CommonUtility.prototype.isObjectId = (id) => {
  if (!new CommonUtility().validateString(id)) {
    return false;
  }

  return mongoose.isValidObjectId(id);
};

CommonUtility.prototype.validateString = (data) => {
  if (data == "" || data == null || data == undefined || data == "undefined") {
    return false;
  }

  return true;
};

CommonUtility.prototype.generateImg = (name, len) => {
  hsl = stringToHslColor(name, 69, 61);
  len = len ? len : 1;
  if (len > 1) {
    name = name;
  } else {
    name = name.charAt(0);
  }
  let hexColor = hslToHex(hsl[0], hsl[1], hsl[2]);
  return (
    "https://ui-avatars.com/api/?name=" +
    name +
    "&length=" +
    len +
    "&color=fff" +
    "&font-size=.5" +
    "&background=" +
    hexColor
  );
};
function stringToHslColor(str, s, l) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  a = [];
  var h = hash % 360;
  a[0] = h;
  a[1] = s;
  a[2] = l;
  return a;
}
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  return `${f(0)}${f(8)}${f(4)}`;
}
CommonUtility.prototype.getUserDetailsFields = () => {
  return {
    _id: 1,
    firstName: 1,
    lastName: 1,
    designation: 1,
    city: 1,
    fullName: 1,
    emailId: 1,
    mobileNumber: 1,
    profilePicUrl: 1,
    updatedAt: 1,
  };
};

function decodeToken(token) {
  try {
    return jwt.decode(token, JWT_TOKEN_SECRET).id;
  } catch (e) {
    return null;
  }
}

function extractToken(req) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
}

module.exports = CommonUtility;
