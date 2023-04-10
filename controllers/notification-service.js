const FCM = require("fcm-node");
const serverKey =
    "AAAAPPS_nng:APA91bGeB36TTW1NsM3N-32aHuyL1V5nKMBCnkr7MLWkOGegJxBPBtwAQYUUrQmZFXSonuG3idSkEy4joogaNpZmN-kOsK4VDTYuIQEAJiWP0urFWBusD9Calkc2q4JWonO81wKTy4Uk";
const fcm = new FCM(serverKey);
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();

function Notification() {}

Notification.prototype.sendNotification = (req,source, type, callback) => {
    const image = source.thumbnail[0]?.url || null ;
    const userId=common.getUserId(req);
    console.log(image);
    // console.log("inside the notification");
    const message = {
        // to: "/topics/test",
        notification: {
            body: source.name,
            title: source.cName,
            image: image,
            icon: "ic_notification",
            color: "#ffe550",
        },
        data: { _id: source._id, source: type },
        android_channel_id: "BoundlessApp",
        // "android": {
        //   "notification": {"image": image},
        // },
        condition: "('all' in topics) && !('"+userId+"' in topics) ",
    };
    //  console.log(type);

    fcm.send(message, callback);
};
module.exports = Notification;
