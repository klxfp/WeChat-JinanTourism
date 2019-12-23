function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 对象拷贝
function objectClone(obj) {
        var newObj = null;
        if(!obj) {
            newObj = obj;
        } else if (typeof obj != 'object') {
            newObj = obj;
        } else {
            newObj = obj.constructor == Array ? [] : {};
            for (var i in obj) {
                newObj[i] = this.objectClone(obj[i]);
            }
        }
        return newObj;
}

// 打印调试
function debug(name,item){
      __wxConfig.debug && console.log(name);
      __wxConfig.debug && console.log(item);
  }

// 判断数据类型，准确分辨，可区分出array、object、date、string、number、bool等
function getType(v){
    return Object.prototype.toString.call(v);
}

// 数组拷贝(浅拷贝)
function copyArray(oriArray){
    var newArray = [];
    for(var i = 0;i<oriArray.length;i++){
        newArray.push(oriArray[i]);
    }
    return newArray;
}

// 数组拷贝(深拷贝)
function copyArrayDeep(oriArray){
    var newArray = [];
    for(var i = 0;i<oriArray.length;i++){
        var item = oriArray[i];
        if(typeof(item) == 'object'){ // 包括对象，数组，date
            newArray.push(this.objectClone(item));
        }else{
            newArray.push(item);
        }
    }
    return newArray;
}

// 字符串是否有效,有效返回true，无效返回false,空格、多个空格、空字符串为无效
function stringHasValue(str){
    if(typeof(str) === 'undefined' || str == null || str == "" || str.length == 0) return false;

    var regu = "^[ ]+$";
    var re = new RegExp(regu);
    return !re.test(str);
}

// 数组是否有效
function arrayHasValue(array){
    if(typeof(array) === 'undefined' || array == null || array == [] || array.length == 0) return false;
    return array && array.length > 0;
}

  /*
  * 判断对象是否为空
  */
  function isEmptyObject(e) {
      var t;
      if (!e) {
        return true;
      }
      for (t in e)
          return false;
      return true;
  }
	
  /*
  * 判断txt是否为空
  */
  function isTxtNotEmpty(txt){
    return txt && ("" != txt) && ("" != txt.replace(/\s+/g,""));
  }

// 一个数组（array）是否包含另一个数组（subArray）中的所有元素（仅与数组中元素有关，与元素次序无关）
function arrayHasSubArray(array,subArray){
    if(!this.arrayHasValue(array) || !this.arrayHasValue(subArray)){
        return false;
    }
    if(array.length < subArray.length) return false;

    if(array == subArray) return true;

    // 遍历逐个验证
    var hasSubArray = true;
    for(var i = 0;i<subArray.length;i++){
        var item = subArray[i];
        if(array.indexOf(item)<0){
            hasSubArray = false;
            break;
        }
    }
    return hasSubArray;
}

function isSameObject(x, y) {
    // If both x and y are null or undefined and exactly the same
    if ( x === y ) {
     return true;
    }
    // If they are not strictly equal, they both need to be Objects
    if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) {
     return false;
    }
    //They must have the exact same prototype chain,the closest we can do is
    //test the constructor.
    if ( x.constructor !== y.constructor ) {
     return false;
    }
    for ( var p in x ) {
     //Inherited properties were tested using x.constructor === y.constructor
     if ( x.hasOwnProperty( p ) ) {
       // Allows comparing x[ p ] and y[ p ] when set to undefined
       if ( ! y.hasOwnProperty( p ) ) {
        return false;
       }
       // If they have the same strict value or identity then they are equal
       if ( x[ p ] === y[ p ] ) {
        continue;
       }
       // Numbers, Strings, Functions, Booleans must be strictly equal
       if ( typeof( x[ p ] ) !== "object" ) {
        return false;
       }
       // Objects and Arrays must be tested recursively
       if ( ! Object.equals( x[ p ], y[ p ] ) ) {
        return false;
       }
     }
    }

    for ( p in y ) {
     // allows x[ p ] to be set to undefined
     if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) {
       return false;
     }
    }
    return true;
}

/** 
 * 验证邮箱 
 * @param emailValue 要验证的邮箱 
 * @returns 匹配返回true 不匹配返回false 
 */
function validateEmail(emailValue){ 
  var reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/; 
  return reg.test(emailValue); 
} 

/** 
 * 验证电话号码 
 * @param phoneValue 要验证的电话号码 
 * @returns 匹配返回true 不匹配返回false 
 */
function validatePhone(phoneValue) { 
  phoneValue = valueTrim(phoneValue); 
  var reg = /^[1][0-9]{10}$/; 
  return reg.test(phoneValue); 
}

/** 
 * 判断是否全是汉字 
 * @param charValue 要验证的数据 
 * @returns 匹配返回true 不匹配返回false 
 */
function isHanZi(charValue){ 
  var reg = /^[\u2E80-\u9FFF]+$/;
  return reg.test(charValue); 
}

/*
*判断是否包含空格
*/
function hasKongGe(charValue) {
    return /\s/.test(charValue);
}

/*
* 判断是否全为英文
*/
function isEnChar(charValue) {
    var reg = /^[A-Za-z]+$/;
    return reg.test(charValue);
}

/** 
 * 判断是否是数字 
 * @param numberValue 要验证的数据 
 * @returns 匹配返回true 不匹配返回false 
 */
function isNumber(numberValue){ 
  //定义正则表达式部分   
  var reg1 = /^[0-9]{0,}$/; 
  var reg2 = /^[1-9]{1}[0-9]{0,}$/; 
  //alert(numberValue); 
  if(numberValue ==null || numberValue.length==0){ 
    return false; 
  } 
  numberValue = valueTrim(numberValue); 
  //判断当数字只有1位时 
  if(numberValue.length<2){ 
    return reg1.test(numberValue); 
  } 
  return reg2.test(numberValue);; 
}
    
/** 
 * 验证身份证 
 * @param idCard 需要验证的身份证号 
 * @returns 匹配返回true 不匹配返回false 
 */
function IdCardValidate(idCardValue) { 
  //去掉字符串头尾空格 
  idCardValue = valueTrim(idCardValue.replace(/ /g, ""));            
  if (idCardValue.length == 15) { 
    //进行15位身份证的验证  
    return isValidityBrithBy15IdCard(idCardValue);   
  } else if (idCardValue.length == 18) { 
    // 得到身份证数组  
    var a_idCard = idCardValue.split("");  
    //进行18位身份证的基本验证和第18位的验证 
    if(isValidityBrithBy18IdCard(idCardValue)&&isTrueValidateCodeBy18IdCard(a_idCard)){ 
      return true;   
    }else {   
      return false; 
    }   
  } else { 
    return false;   
  }   
}   
/**  
 * 判断身份证号码为18位时最后的验证位是否正确  
 * @param a_idCard 身份证号码数组  
 * @return  
 */ 
function isTrueValidateCodeBy18IdCard(a_idCard) {
  var Wi = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1 ];  // 加权因子
  var ValideCode = [ 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ];      // 身份证验证位值.10代表X 
  var sum = 0; // 声明加权求和变量   
  if (a_idCard[17].toLowerCase() == 'x') {   
    a_idCard[17] = 10;// 将最后位为x的验证码替换为10方便后续操作   
  }   
  for ( var i = 0; i < 17; i++) {   
    sum += Wi[i] * a_idCard[i];// 加权求和   
  }   
  var valCodePosition = sum % 11; // 得到验证码所位置
  return a_idCard[17] == ValideCode[valCodePosition];
}   
/**  
 * 验证18位数身份证号码中的生日是否是有效生日  
 * @param idCard 18位书身份证字符串  
 * @return  
 */ 
function isValidityBrithBy18IdCard(idCard18){   
  var year = idCard18.substring(6,10);   
  var month = idCard18.substring(10,12);   
  var day = idCard18.substring(12,14);   
  var temp_date = new Date(year,parseFloat(month)-1,parseFloat(day));   
  // 这里用getFullYear()获取年份，避免千年虫问题   
  if(temp_date.getFullYear()!=parseFloat(year)   
     ||temp_date.getMonth()!=parseFloat(month)-1   
     ||temp_date.getDate()!=parseFloat(day)){   
      return false;   
  }else{   
    return true;   
  }   
}   
/**  
 * 验证15位数身份证号码中的生日是否是有效生日  
 * @param idCard15 15位书身份证字符串  
 * @return  
 */ 
function isValidityBrithBy15IdCard(idCard15){   
  var year = idCard15.substring(6,8);   
  var month = idCard15.substring(8,10);   
  var day = idCard15.substring(10,12);   
  var temp_date = new Date(year,parseFloat(month)-1,parseFloat(day));   
  // 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法   
  if(temp_date.getYear()!=parseFloat(year)   
      ||temp_date.getMonth()!=parseFloat(month)-1   
      ||temp_date.getDate()!=parseFloat(day)){   
    return false;   
  }else{   
    return true;   
  }   
}   
//去掉字符串头尾空格   
function valueTrim(str) {   
  return str.replace(/(^\s*)|(\s*$)/g, "");   
} 

function delAllTrim(str) {
    return str.replace(/\s+/g,"");
}
  
/** 
 * 检验18位身份证号码（15位号码可以只检测生日是否正确即可，自行解决） 
 * @param idCardValue 18位身份证号 
 * @returns 匹配返回true 不匹配返回false 
 */
function idCardVildate(cid){ 
  var arrExp = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];//加权因子 
  var arrValid = [1, 0, "X", 9, 8, 7, 6, 5, 4, 3, 2];//校验码 
  var reg = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/; 
  if(reg.test(cid)){ 
    var sum = 0, idx; 
    for(var i = 0; i < cid.length - 1; i++){ 
      // 对前17位数字与权值乘积求和 
      sum += parseInt(cid.substr(i, 1), 10) * arrExp[i]; 
    } 
    // 计算模（固定算法） 
    idx = sum % 11; 
    // 检验第18为是否与校验码相等 
    return arrValid[idx] == cid.substr(17, 1).toUpperCase(); 
  }else{ 
    return false; 
  } 
}

/*
*精确乘法
*/
function accMul(arg1,arg2) {  
    var m=0,s1=arg1.toString(),s2=arg2.toString();  
    try{m+=s1.split(".")[1].length}catch(e){}  
    try{m+=s2.split(".")[1].length}catch(e){}  
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)  
}

/*
*精确加法
*/
function accAdd(arg1,arg2){  
    var r1,r2,m;  
    try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}  
    try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}  
    m=Math.pow(10,Math.max(r1,r2))  
    return (arg1*m+arg2*m)/m  
} 

function isStrInArray(array, str) {
    var result = false;
    if (array && array.length>0) {
        for (var i = 0; i < array.length; i++) {
        var tempStr = array[i];
        if (tempStr == str) {
            result = true;
            break
        }
        }
    }
    return result;
}

/*
* 价格如果是浮点四舍五入,反之取整.
*/
function formatePrice(price){
    return !price ? "" : Math.round(price*100)/100;
}

function formateImgUrl(item){
    if(item && item.length>0 && null==item.match("https:")&& null==item.match("http:")) {
    item = "https:"+item
    }
    return item;
}

function goToMapPage(title,api, address){
      //跳转地图页
      var that = this;
      if (address && address.googleLat && address.googleLon) {
          api.Location.open({
              latitude: address.googleLat,
              longitude: address.googleLon,
              name: title,
              address: address.addressDesc||'',
              success: function() {},
              fail: function() {},
              complete: function() {}
          })
      }
  }

    function saveCurrentSelectCity(api, city){
        api.Storage.set({
            key: "wxxcx-ticket-current_select_city",
            data: city,
        });
    }
    function getCurrentSelectCity(api, callback){
        api.Storage.get({
            key: "wxxcx-ticket-current_select_city",
            success: function(result) {
                callback(result);
            },
            fail: function(e) {
                callback(null);
            }
        });
    }
    function saveLocationChooseCity(api, city, isChinaCity){
        var _api = api;
        var CHINA_CITY_SELECT_HISTORY_STORAGE_KEY = "wxxcx-ticket-china-city-select-history-storage-key";
        var OVERSEAS_CITY_SELECT_HISTORY_STORAGE_KEY = "wxxcx-ticket-overseas-city-select-history-storage-key";
        let cityKey = isChinaCity?CHINA_CITY_SELECT_HISTORY_STORAGE_KEY:OVERSEAS_CITY_SELECT_HISTORY_STORAGE_KEY;
        addHistory(_api, city,cityKey , function() {
                saveCurrentSelectCity(_api, city)
            });
    }
    function getHistory(api,saveKey,callback) {
        var _api = api;
        _api.Storage.get({
            key: saveKey,
            success: function(result) {
                callback(result.data.slice(0, 3) || []);
            },
            fail: function(e) {
                callback([]);
            }
        });
    }

    function addHistory(api, item, saveKey, callback) {
        var _api = api;
        getHistory(_api, saveKey, function(list) {
            list = list.filter(function(_item) {
                return _item.cityId !== item.cityId;
            });
            list.unshift(item);
            _api.Storage.set({
                key: saveKey,
                data: list.slice(0,3),
                success: callback
            });
        });
    }

    function wxRequestPayment(api, orderId, gorderId, sceneryId) {
        var _api = api;
        var fromFillinOrder = false;
        var pages = getCurrentPages();
        var currentPage = pages[pages.length - 1];
        if(currentPage && currentPage.__route__ && currentPage.__route__.indexOf('fillinorder')>=0) {
            fromFillinOrder = true
        }
        var FillInOrderService = require("../service/fillinorder.js");
        try {
            FillInOrderService.GetWxPayUrl(orderId, gorderId).then(function(data){
                __wxConfig.debug && console.log("wxRequestPayment GetWxPayUrl",data);
                if (data.IsError||data.errMsg == 'request:fail'){
                    _api.showModal({
                            title: '提示',
                            content: data.ErrorMessage||"支付失败, 请重试",
                            showCancel: false
                            })
                    return
                }
                try{
                    var wxPayUrl = {
                        'timeStamp': data.wxPayUrl.timeStamp.toString(),
                        'nonceStr': data.wxPayUrl.nonceStr,
                        'package': data.wxPayUrl.package,
                        'signType': data.wxPayUrl.signType,
                        'paySign': data.wxPayUrl.paySign,
                        'success':function(res){
                            //支付成功, 跳转支付成功页
                            __wxConfig.debug && console.log("fillInOrder requestPayment success res = ", res)
                            var jumpUrl = "pages/paySuccess/paySuccess?sceneryId="+sceneryId+"&orderId="+orderId;
                            if (isTxtNotEmpty(data.mobile)) {
                                jumpUrl = jumpUrl + "&mobile=" + data.mobile
                            }
                            if (isTxtNotEmpty(data.email)) {
                                jumpUrl = jumpUrl + "&email=" + data.email
                            }
                            _api.Navigate.redirectTo({
                                url:jumpUrl
                            })
                        },
                        'fail':function(res) {
                            //用户取消支付或者支付失败, 跳转订单列表页
                            __wxConfig.debug && console.log("fillInOrder requestPayment fail res = ", res)
                            if(fromFillinOrder) {
                                var cancelPay = res.errMsg == 'requestPayment:fail cancel';//用户取消支付
                                var jumpUrl = cancelPay ? "pages/orderlist/orderlist" : "pages/orderdetail/orderdetail?orderId="+orderId;
                                _api.Navigate.redirectTo({
                                    url:jumpUrl
                                })
                            }
                        }
                    };
                    _api.requestPayment(wxPayUrl)

                } catch(payErr){
                    _api.showToast({
                        title: fromFillinOrder ? '订单支付失败' :'订单支付失败, 请重试'
                    })
                    if(fromFillinOrder) {
                        setTimeout(function(){
                            _api.Navigate.redirectTo({
                                url: "pages/orderdetail/orderdetail?orderId="+orderId
                            })
                        }, 1500)
                    }
                }
            });
        } catch (err1) {
            _api.showToast({
                title:err1
            });
            __wxConfig.debug && console.log("err1",err1);
        }
    }
    
    function confuseString(str,prefixLength,suffixLength) {
        if (str.indexOf('*')>=0) {
          return str
        }
        var stringLength = str.length;
        if (stringLength < (prefixLength + suffixLength)) {
            return str;
        }
        var prefixString = str.substr(0,prefixLength);
        var suffixString = str.substr(-suffixLength,suffixLength);
        var middleString = str.substr(prefixLength,stringLength - prefixLength - suffixLength);
        var confuse = "";
        for (var i = 0; i < middleString.length; i ++) {
            confuse = confuse + "*";
        }
        return prefixString + confuse + suffixString;   
    }

module.exports = {
  formatTime: formatTime,
  formatNumber:formatNumber,
  objectClone:objectClone,
  debug:debug,
  getType:getType,
  copyArray:copyArray,
  copyArrayDeep:copyArrayDeep,
  stringHasValue:stringHasValue,
  arrayHasValue:arrayHasValue,
  isEmptyObject:isEmptyObject,
  isTxtNotEmpty:isTxtNotEmpty,
  arrayHasSubArray:arrayHasSubArray,
  isSameObject:isSameObject,
  validateEmail:validateEmail,
  validatePhone:validatePhone,
  isHanZi:isHanZi,
  hasKongGe:hasKongGe,
  isEnChar:isEnChar,
  isNumber:isNumber,
  IdCardValidate:IdCardValidate,
  valueTrim:valueTrim,
  delAllTrim:delAllTrim,
  accMul:accMul,
  accAdd:accAdd,
  isStrInArray:isStrInArray,
  formatePrice:formatePrice,
  formateImgUrl:formateImgUrl,
  goToMapPage:goToMapPage,
  saveCurrentSelectCity:saveCurrentSelectCity,
  getCurrentSelectCity:getCurrentSelectCity,
  saveLocationChooseCity:saveLocationChooseCity,
  getHistory:getHistory,
  addHistory:addHistory,
  wxRequestPayment:wxRequestPayment,
  confuseString:confuseString
}
