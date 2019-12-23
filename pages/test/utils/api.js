/**
 * 支持绝对路径
 * 路径中pages可以省略
 */
var PageEvents = require("./page-events.js");
var path = require("./path.js");

function transPageUrl(url, __dirname, pagedir) {
    url = url.split("?");
    var params = url.length > 1 ? "?" + url[1] : "";
    url = url[0];

    // if(!/\/index$/.test(url)){
    //  url += "/index";
    // }

    if (/^\.{1,2}\//.test(url)) {
        url = path.join(__dirname, url);
    }

    url = (pagedir ? pagedir.split("/").map(function(item) {
        return "..";
    }).join("/") : ".") + "/" + (/^(components|pages)\//.test(url) ? "" : "pages/") + url;

    return url + params;
}

var Undefined = (function() {})();

var API = {
    request: wx.request,
    File: {
        upload: wx.uploadFile,
        download: wx.downloadFile
    },
    Socket: {
        connect: wx.connectSocket,
        onOpen: wx.onSocketOpen,
        onError: wx.onSocketError,
        sendMessage: wx.sendSocketMessage,
        onMessage: wx.onSocketMessage,
        close: wx.closeSocket,
        onClose: wx.closeSocket
    },
    Image: {
        choose: wx.chooseImage,
        preview: wx.previewImage
    },
    Record: {
        start: wx.startRecord,
        stop: wx.stopRecord,
    },
    Voice: {
        play: wx.playVoice,
        pause: wx.pauseVoice,
        stop: wx.stopVoice
    },
    BackgroundAudio: {
        getPlayerState: wx.getBackgroundAudioPlayerState,
        play: wx.playBackgroundAudio,
        pause: wx.pauseBackgroundAudio,
        seek: wx.seekBackgroundAudio,
        stop: wx.stopBackgroundAudio,
        onPlay: wx.onBackgroundAudioPlay,
        onPause: wx.onBackgroundAudioPause,
        onStop: wx.onBackgroundAudioStop
    },
    saveFile: wx.saveFile,
    Video: {
        choose: wx.chooseVideo
    },
    // 持久存储
    Storage: {
        set: wx.setStorage,
        setSync: wx.setStorageSync,
        get: wx.getStorage,
        getSync: wx.getStorageSync,
        remove: function(opts) {
            opts.data = Undefined;
            this.set(opts);
        },
        removeSync: function(key) {
            this.setSync(key, Undefined);
        },
        clear: wx.clearStorage,
        clearSync: wx.clearStorageSync
    },
    // 临时存储
    Cache: {
        _caches: {},
        set: function(key, data) {
            this._caches[key] = data;
        },
        get: function(key) {
            return this._caches[key];
        },
        clear: function() {
            this._caches = {};
        }
    },
    Location: {
        get: wx.getLocation,
        open: wx.openLocation
    },
    getNetworkType: wx.getNetworkType,
    getSystemInfo: wx.getSystemInfo,
    onAccelerometerChange: wx.onAccelerometerChange,
    onCompassChange: wx.onCompassChange,
    makePhoneCall: wx.makePhoneCall,
    NavigationBar: {
        setTitle: wx.setNavigationBarTitle,
        showLoading: wx.showNavigationBarLoading,
        hideLoading: wx.hideNavigationBarLoading
    },
    Navigate: {
        go: wx.navigateTo,
        back: wx.navigateBack,
        redirectTo: wx.redirectTo
    },
    createAnimation: wx.createAnimation,
    createContext: wx.createContext,
    drawCanvas: wx.drawCanvas,
    hideKeyboard: wx.hideKeyboard,
    stopPullDownRefresh: wx.stopPullDownRefresh,
    login: wx.login,
    getUserInfo: wx.getUserInfo,
    requestPayment: wx.requestPayment,
    showActionSheet: wx.showActionSheet,
    showToast: wx.showToast,
    hideToast: wx.hideToast,
    showModal: function(opts) {
        var config = {
            title: '提示',
            showCancel: false
        }
        if (Object.prototype.toString.call(opts) === '[object Object]') {
            config = Object.assign(config, opts);
            config.title = config.title || '提示';
            config.showCancel = !!config.showCancel || !!opts.cancelText;
            for (var n in config) {
                if (typeof config[n] !== 'function' && typeof config[n] !== 'boolean') {
                    config[n] += '';
                }
            }
            if (typeof opts.confirm == 'function' || typeof opts.cancel == 'function') {
                config.success = function(res) {
                    var pages = getCurrentPages();
                    opts.success && opts.success.apply(pages[pages.length - 1], arguments);
                    if (res.confirm) {
                        opts.confirm && opts.confirm.apply(pages[pages.length - 1], arguments);
                    } else {
                        opts.cancel && opts.cancel.apply(pages[pages.length - 1], arguments);
                    }
                }
            }

        } else {
            config.content = opts + '';
        }
        wx.showModal(config);
    },
    getPage: function() {
        return getCurrentPages()[getCurrentPages().length - 1];
    }
};
wx.elong_api = API;
module.exports = function(__dirname) {
    var api = {};
    for (var key in API) {
        api[key] = API[key];
    }

    // 扩展路由路径规则
    api.Navigate = {
        back: api.Navigate.back,
        go: function(opts) {
            var pages = getCurrentPages();
            opts.url = transPageUrl(opts.url, __dirname, path.dirname(pages[pages.length - 1].__route__));

            var event = PageEvents.register(null, opts.params);

            delete opts.params;

            opts.url += (opts.url.indexOf("?") === -1 ? "?" : "&") + "_eventId=" + event.eventId;

            wx.navigateTo(opts);

            return event;
        },
        redirectTo: function(opts) {
            var pages = getCurrentPages();
            opts.url = transPageUrl(opts.url, __dirname, path.dirname(pages[pages.length - 1].__route__));

            var event = PageEvents.register(null, opts.params);

            delete opts.params;

            opts.url += (opts.url.indexOf("?") === -1 ? "?" : "&") + "_eventId=" + event.eventId;

            // 页面重定向后，针对当前页面的所有事件监听全部转移到新跳转的页面
            var events = PageEvents.events;
            var currentEvent = events[pages[pages.length - 1]._eventId];
            if (currentEvent) {
                events[event.eventId].listeners = currentEvent.listeners;
            }

            wx.redirectTo(opts);

            return event;
        }
    };

    /**
     * 简化api.makePhoneCall的参数
     * @param {Object | String | Number} opts 配置项, 可以是: 1. 小程序的事件对象e, 此时触发对象上必须包含data-phone-number字段, 内容为待拨打的电话号码; 2. String或Number格式的电话号码;
     */
    api.makePhoneCall = function(opts) {
        var _num = Object.prototype.toString.call(opts) === '[object Object]' ? opts.currentTarget.dataset.phoneNumber : opts;
        this.showModal({
            content: '拨打 ' + _num + '?',
            showCancel: true,
            confirm: function() {
                wx.makePhoneCall({
                    phoneNumber: _num + ''
                })
            }
        });
    }
    return api;
};
