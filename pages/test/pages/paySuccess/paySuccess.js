var __dirname = "pages/paySuccess";
var __overwrite = require("../../utils/overwrite.js");
(function (require, Page) {
  var api = require("utils/api")(__dirname);
  Page({
    data: {
      scrollViewHeight: 0,
      text:''
    },
    onLoad: function (options) {
      var email = options.email;
      var mobile = options.mobile;
      var text = "订单确认短信会发送至" + mobile;
      if (email) {
        text = text + "或" + email;
      }
      text = text + "。您也可以通过个人中心-门票订单关注订单处理进度。";
      this.setData({
        scrollViewHeight: getApp().getAppSystemInfo().windowHeight,
        sceneryId: options.sceneryId,
        orderId: options.orderId,
        text:text
      });  
    },
    gotoProductDetail: function () {
      var path = "../detail/detail?sceneryId=" + this.data.sceneryId;
      api.Navigate.redirectTo({
        url: path
      });
    },
    gotoOrderDetail: function () {
      var path = "../orderdetail/orderdetail?orderId=" + this.data.orderId;
      api.Navigate.redirectTo({
        url: path
      });
    }
  })
})(__overwrite.require(require, __dirname), __overwrite.Page);