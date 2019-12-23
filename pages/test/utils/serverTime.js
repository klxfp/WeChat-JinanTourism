var Service = require("../service/serverTime.js");
var app;

function tick() {
    app.globalData.now = new Date(app.globalData.now.getTime() + 1000);
    setTimeout(tick, 1000);
}

function syncTime() {
    Service.GetTime().then(function(data) {
        app.globalData.now = new Date(data);
    });
    setTimeout(syncTime, 600000);//10分钟同步一次服务器时间
}
module.exports = {
    run: function(ap) {
        app = ap;
        app.globalData.now = new Date();
        setTimeout(tick, 1000);
        setTimeout(syncTime, 600000);
    }
};
