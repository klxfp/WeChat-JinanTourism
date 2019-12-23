var SERVICE = require('../service/spot-click.js');
var API = require('./api.js')();
var PageEvents = require("./page-events.js");
var _tjobjectKey = 'tjobjectcache';
var _pageName;
var pageNameMap = {
    "pages/homepage/homepage": "H5-hticket-homepage",
};
var event = PageEvents.register();
//JSON转换为url键值对
var JSONtoParamsStr = function(_json) {
    var paramsstr = '';
    if (_json) {
        for (var k in _json) {
            paramsstr += k + "=" + _json[k] + "&";
        }
    }
    return paramsstr;
}

//数据整理及发送
var _cleanData_SendData = function(tJObject, otherJSON) {
    //整理前端参数
    var _h5Params = _getH5Params();
    //合并参数为JSON的形式
    var tJObjects = Object.assign(tJObject, otherJSON);
    var megerParams = Object.assign(_h5Params, tJObjects);
    __wxConfig.debug && console.log("megerParams : " + JSON.stringify(megerParams));
    //整理成url键值对的形式
    // var urlParams = JSONtoParamsStr(megerParams);
    // var sendUrl = getSendDaDianUrl() + urlParams;
    //console.log("打点链接：" + sendUrl);
    //发送
    _sendDaDian(megerParams);
    return true;
}

var _sendDaDian = function(tjobject) {
    SERVICE.sendDaDian(tjobject)
        .then(function(res) {
            //console.log('sendDadian success response :' + JSON.stringify(res));
            return true;
        }, function(err) {
            //console.log('sendDadian error response :' + err);
            return false;
        })

}

//获取TJObject
var _getTJObject = function(pageurl, otherJSON) {
    if (!API.Cache.get(_tjobjectKey)) {
        SERVICE.getTJObject(pageurl)
            .then(function(res) {
                //console.log('page success response :' + JSON.stringify(res));
                API.Cache.set(_tjobjectKey, res);
                getApp().globalData.now = new Date(res.timestamp || Date.now());
                if (res) {
                    //数据整理发送
                    return _cleanData_SendData(res, otherJSON);
                } else {
                    return false;
                }
            }, function(err) {
                console.log('page error response :' + err);
                return false;
            })
    } else {
        //数据整理发送
        return _cleanData_SendData(API.Cache.get(_tjobjectKey), otherJSON);
    }
}

//获取页面数据
var _getH5Params = function() {
    var test = {};
    test['et'] = 'show';
    //test['pt'] = _pageName || '';
    test['biz'] = 'h5_xcx';
    test['st'] = new Date().getTime();
    return test;
}

//获取elong打点数据目的地
var getSendDaDianUrl = function() {
    return "https://m.elong.com/tj/t.gif";
}

//数据打点入口
function DADIAN(pageurlKey, otherJSON) {
    try {
        var pageurl = pageNameMap[pageurlKey];
        if (pageurl) {
            otherJSON = otherJSON || {};
            var pageName = {};
            pageName["pageName"] = pageurl;
            otherJSON["pt"] = pageurl;
            var dadianflag = _getTJObject(pageName, otherJSON);
        }
    } catch (e) {

    }
}

function reg(eventName) {

}
//暴露两个不同发起方式
module.exports = {
    DADIAN: DADIAN,
    on: event.on.bind(event),
    fire: function(eventName, params) {
        PageEvents.fire(event.eventId, eventName, params);
    },
    destroy: function() {
        delete events[event.eventId];
    }
}
