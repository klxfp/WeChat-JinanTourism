var Cookie = require("./utils/cookie.js");
var deviceId = require("./utils/device-id.js");
var api = require("./utils/api.js")();
var util = require('./utils/util.js');
// 引入SDK核心类
var QQMapWX = require('./utils/qqmap/qqmap-wx-jssdk.js');
var CITY_DATA = "wxxcx-ticket-city-data-key";
var systemInfo = {}
App({
    onLaunch: function() {
        api.getSystemInfo({
          success: function(data) {
              __wxConfig.debug && console.log("App onLaunch data = ", data)
              systemInfo = data
        }});
        //兼容Object.assign
        if (typeof Object.assign != 'function') {
            (function() {
                Object.assign = function(target) {
                    'use strict';
                    if (target === undefined || target === null) {
                        throw new TypeError('Cannot convert undefined or null to object');
                    }

                    var output = Object(target);
                    for (var index = 1; index < arguments.length; index++) {
                        var source = arguments[index];
                        if (source !== undefined && source !== null) {
                            for (var nextKey in source) {
                                if (source.hasOwnProperty(nextKey)) {
                                    output[nextKey] = source[nextKey];
                                }
                            }
                        }
                    }
                    return output;
                };
            })();
        }
        require("utils/dateformat.js");
        require("utils/array.js");
        require('utils/serverTime.js').run(this);
        
        __wxConfig.debug && console.info("Object.assign ", typeof Object.assign, typeof Object.defineProperty);

        Cookie.set("H5CookieId", deviceId());
        Cookie.set("innerFrom", this.globalData.if || "");
        Cookie.set("ch", "ticket");
        Cookie.set("H5Channel", "wxxcxh5,Normal");
    },
    getAppSystemInfo:function(){
        if (util.isEmptyObject(systemInfo)) {
            api.getSystemInfo({
                success: function(data) {
                    __wxConfig.debug && console.log("App getAppSystemInfo data = ", data)
                    systemInfo = data
            }});
        }
        return systemInfo
    },
    getServerTime: function() {
        return this.globalData.now || new Date()
    },
    getUserInfo: function(cb) {
        __wxConfig.debug && console.log("getUserInfo cb", cb)
        var that = this
        if (this.globalData.userInfo) {
            typeof cb == "function" && cb(this.globalData.userInfo)
        } else {
            //调用登录接口
            api.login({
                success: function() {
                    api.getUserInfo({
                        success: function(res) {
                            that.globalData.userInfo = res.userInfo
                            typeof cb == "function" && cb(that.globalData.userInfo)
                        }
                    })
                }
            })
        }
    },
    globalData: {
        version: "10.12(10)",
        indate: '',
        outdate: '',
        deepNightFlag: "",
        today: "",
        tomorrow: "",
        yesterday: ""
    },
    getQQMap:function(){
        // 实例划API核心类
        var qqMap = new QQMapWX({
            key: 'KHRBZ-O4PC2-JKPUF-CN6JB-GKL3O-J6FHO' // 必填
        });
        return qqMap;
    },
    saveCityData:function(data){
        api.Storage.set({
            key: CITY_DATA,
            data: data,
            // success: callback
        });
    },
    getSavedCityData:function(callback){
        api.Storage.get({
            key: CITY_DATA,
            success: function(result) {
                callback(result);
            },
            fail: function(e) {
                callback([]);
            }
        });
    }
})
