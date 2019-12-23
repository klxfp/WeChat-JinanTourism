var guid = require("./guid.js");
var Storage = require("./api.js")().Storage;

var DEVICE_ID_STORAGE_KEY = "device-id";
var deviceId = null;
module.exports = function(){
    if(deviceId){
        return deviceId;
    }

    deviceId = Storage.getSync(DEVICE_ID_STORAGE_KEY);

    if(!deviceId){
        deviceId = guid();
        Storage.setSync(DEVICE_ID_STORAGE_KEY, deviceId);
    }
    
    return deviceId;
};