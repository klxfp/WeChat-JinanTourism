/*
 *  小程序联合登陆组件
 */
var API = require('./api.js')();
var COOKIE = require('./cookie.js');
var SERVICE = require('../service/login.js');

var RETRYTIMES = 3;
var SESSIONTOKENKEY = "SessionToken";
var OPENIDKEY = "OpenId";
var AUTOLOGINKEY = "autoLogin";
var NETWORKERROR = 'network error';

var log = __wxConfig.debug ? console.log : function() {};

//检测sessiontoken是否过期
function checkSessionToken(callback, retryTimes) {
    retryTimes = retryTimes || 0;
    if (retryTimes >= RETRYTIMES) {
        log('checkSessionToken retry ' + retryTimes + ' fail.');
        callback(false);
        return
    }
    var sessionToken = COOKIE.get(SESSIONTOKENKEY);
    if (!sessionToken) {
        log('checkSessionToken sessionToken is empty.');
        callback(false)
        return
    }
    SERVICE.checkSessionToken(sessionToken)
        .then(function(res) {
            log('checkSessionToken response ' + JSON.stringify(res));
            if (res.errorCode == '0' || res.errorCode == null) {
                if (!res.expire) {
                    log('checkSessionToken ok.');
                    callback(true)
                } else {
                    log('checkSessionToken is expired.');
                    callback(false)
                }
            } else {
                log('checkSessionToken fail retryTimes ' + retryTimes);
                checkSessionToken(callback, ++retryTimes)
            }
        }, function(err) {
            log('checkSessionToken fail retryTimes ' + retryTimes);
            checkSessionToken(callback, ++retryTimes)
        })
}

//处理登陆逻辑
function doLogin(data, callback, retryTimes, errorCode) {
    __wxConfig.debug && console.log("doLogin data = ", data)
    __wxConfig.debug && console.log("doLogin"," retryTimes = " + retryTimes + ", errorCode = " + errorCode)
    retryTimes = retryTimes || 0;
    if (retryTimes >= RETRYTIMES) {
        log('doLogin retry ' + retryTimes + ' fail.');
        callback(null, errorCode);
        return
    }
    // 酒店小程序APPID: wx5146b2922b7e6d93  小程序只能用自己的APPID去登录,支付, 故不能用酒店的
    // 门票小程序APPID: wxb23ddca01442acf6   
    // 门票小程序秘钥  : 2ce176c9d23acc306750b5fce28608fc
    SERVICE.login(data.code, data.encryptData,'wxb23ddca01442acf6')
        .then(function(res) {
            log('doLogin response ' + JSON.stringify(res));
            if (res.errorCode && res.errorCode == "0") {
                //后端返回的expire单位是秒
                var expire = new Date().getTime() + res.expire * 1000;
                COOKIE.set(SESSIONTOKENKEY, res.sessionToken, expire);
                //openid 不设置过期时间，默认2年
                COOKIE.set(OPENIDKEY, res.openid);
                callback({
                    openId: res.openid,
                    sessionToken: res.sessionToken
                }, null)
            } else {
                log('doLogin fail retryTimes ' + retryTimes);
                doLogin(data, callback, ++retryTimes, res.errorCode)
            }
        }, function(err) {
            log('doLogin fail retryTimes ' + retryTimes);
            doLogin(data, callback, ++retryTimes, (err && err.errorCode) || NETWORKERROR)
        })
}

//登陆
var login_networking = 0;
var callback_stack = [];
var auto_login = 0;

function login(callback) {
    if (login_networking == 1) {
        (typeof callback === 'function') && callback_stack.push(callback);
        return;
    }
    (typeof callback === 'function') && callback_stack.push(callback);
    login_networking = 1;

    API.login({
        success: function(loginRes) {
            log("weixin login loginRes = ", loginRes)
            API.getUserInfo({
                success: function(getUserInfoRes) {
                    if (auto_login) {
                        login_networking = 0;
                        return;
                    }
                    log('login start.');
                    doLogin({
                        code: loginRes.code,
                        encryptData: getUserInfoRes.encryptData
                    }, function(tokenRes, errorCode) {
                        for (var i = 0; i < callback_stack.length; i++) {
                            callback_stack[i](tokenRes, errorCode);
                        }
                        callback_stack.length = 0;
                        login_networking = 0;
                    })
                },
                fail: function(err) {
                    log('login getUserInfo fail.', err);
                    loginError(err)
                },
                complete: function() {}
            })
        },
        fail: function(err) {
            log('login fail.', err);
            loginError(err)
        },
        complete: function() {}
    })
}

function loginError(err) {
    login_networking = 0;
    for (var i = 0; i < callback_stack.length; i++) {
        callback_stack[i](null, NETWORKERROR);
    }
    callback_stack.length = 0;
}

//注销
function logout() {
    COOKIE.clear(SESSIONTOKENKEY)
}

//获取sessiontoken
function getSessionToken(callback) {
    var sessionToken = COOKIE.get(SESSIONTOKENKEY);
    log('getSessionToken: ' + sessionToken);
    callback && callback(sessionToken);
    return sessionToken;
}

//获取openid
function getOpenId(callback) {
    var openId = COOKIE.get(OPENIDKEY);
    log('getOpenId: ' + openId);
    callback && callback(openId);
    return openId;
}

//自动登录
function autoLogin(onConfirm, autoLoginCallback) {
    onConfirm = onConfirm || function() {};
    autoLoginCallback = autoLoginCallback || function() {};
    var openId = COOKIE.get(OPENIDKEY);
    var sessionToken = COOKIE.get(SESSIONTOKENKEY);
    //用户未登录或用户已登录并且sessiontoken失效
    if (openId === null || sessionToken !== null) {
        login(autoLoginCallback);
        return
    }
    var autoLoginFlag = COOKIE.get(AUTOLOGINKEY);
    //首次弹窗或者用户上次弹窗选择了确认且已退出
    if (autoLoginFlag === null || (autoLoginFlag && openId !== null && sessionToken === null)) {
        auto_login = 1;
        onConfirm();
        return
    }
    //用户之前点击过取消
    autoLoginCallback()
}

//用户选择确认授权登录
function autoLoginConfirm(callback) {
    COOKIE.set(AUTOLOGINKEY, true);
    auto_login = 0;
    login(callback)
}

//用户选择取消授权登录
function autoLoginCancel() {
    COOKIE.set(AUTOLOGINKEY, false);
    auto_login = 0;
    for (var i = 0; i < callback_stack.length; i++) {
        callback_stack[i](null);
    }
    callback_stack.length = 0;
}
module.exports = {
    getSessionToken: getSessionToken,
    checkSessionToken: checkSessionToken,
    getOpenId: getOpenId,
    autoLogin: autoLogin,
    autoLoginConfirm: autoLoginConfirm,
    autoLoginCancel: autoLoginCancel,
    login: login,
    logout: logout
};
