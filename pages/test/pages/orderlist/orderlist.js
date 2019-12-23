// pages/orderlist/orderlist.js
var __dirname = "pages/orderlist";
var __overwrite = require("../../utils/overwrite.js");
(function(require, Page) {
   var api = require("utils/api")(__dirname),
    token = require('utils/token'),
    Util = require('utils/util'),
    OrderListService = require('service/orderlist'),
    SpotClick = require('utils/spot-click');
    var app = getApp();
    var mPullDownRefresh = false
  Page({
    data:{
        scrollViewHeight:'571',
        isMoreLoading:false,
        orderList:[],
        showAll:false,
        cardNo:"",
        stateType:1,
        totalCount:0,
        currentPageIndex:1,
        toView:"",
        scrollTop:0,//控制是否展示"回到顶部"
    },
    loadData:function(refreshType){
      __wxConfig.debug && console.log("loadData refreshType = ", refreshType)
      var _this = this;
      OrderListService.orderList("",4,{'pageIndex':this.data.currentPageIndex,'pageSize':20}).then(function(data) {
        data = _this.transformData(data);
        if(refreshType == 'getMore'){
          _this.data.orderList = _this.data.orderList.concat(data.orderList);
        }else{
          _this.data.orderList = data.orderList;
        }
        _this.isMoreLoading = false;
        _this.setData({
            orderList:_this.data.orderList,
            totalCount:data.totalCount,
            showAll:_this.data.orderList && _this.data.orderList.length>=data.totalCount,
            toView:refreshType == "getNew"?"top":""
          });
          _this.stopRefresh()
      });
    },
    transformData:function(data){
      var _this = this;
      data.orderList = data.orderList && data.orderList.map((item)=>{
        item.priceStr = _this.formatePrice(item.totalPrice);
        _this.setBtnVisibleState(item);
        item.orderStatusDesc = _this.getOderStatusDesc(item);
        return item;
      });
      return data;
    },
    getOderStatusDesc:function(item){
      var result;
      var orderStatusDesc = ["待支付","待确认","已取消","预订成功","退款中","部分退款","全部退款","交易完成"];
      if (item && item.status && item.status > 0) {
        result = orderStatusDesc[item.status-1];
      }
      return result;
    },
    setBtnVisibleState:function(item){
      if (item) {
        if (item.status == 1) {
          //展示"去支付"
          item.showBtn1 = false;
          item.showBtn2 = false;
          item.showBtn3 = true;
          item.btn1Txt = "";
          item.btn2Txt = "";
          item.btn3Txt = "去支付";
        } else if (item.status == 3 || item.status == 7 || item.status == 8) {
          if (item.status == 8 && item.unCommentCount > 0) {
          //展示"再次预订","去点评"
            item.showBtn1 = false;
            item.showBtn2 = true;
            item.showBtn3 = false;//去点评暂时不做
            item.btn1Txt = "";
            item.btn2Txt = "再次预订";
            item.btn3Txt = "";//去点评暂时不做
          } else{
          //展示"再次预订"
            item.showBtn1 = false;
            item.showBtn2 = false;
            item.showBtn3 = true;
            item.btn1Txt = "";
            item.btn2Txt = "";
            item.btn3Txt = "再次预订";
          }
        } else{
          //展示"去景点","再次预订"
            item.showBtn1 = false;
            item.showBtn2 = true;
            item.showBtn3 = true;
            item.btn1Txt = "";
            item.btn2Txt = "去景点";
            item.btn3Txt = "再次预订";
        }
      } else{
            item.showBtn1 = false;
            item.showBtn2 = false;
            item.showBtn3 = false;
            item.btn1Txt = "";
            item.btn2Txt = "";
            item.btn3Txt = "";
      }
    },
    formatePrice:function(price){
      return !price ? "" : '¥'+Math.round(price*100)/100;
    },
    onLoad:function(options){
      // 页面初始化 options为页面跳转所带来的参数
      mPullDownRefresh = false
    },
    onPullDownRefresh:function(){
      mPullDownRefresh = true
      this.data.currentPageIndex = 1;
      this.loadData('getNew');
    },
    stopRefresh:function(){
        if(mPullDownRefresh) {
            mPullDownRefresh = false
            wx.stopPullDownRefresh()
        }
    },
    upMore:function(){
      if(this.data.orderList.length >= this.data.totalCount || this.isMoreLoading) return;
      this.isMoreLoading = true;
      ++this.data.currentPageIndex;
      this.loadData('getMore');
    },
    // 点击item
    onOrderListItemClick:function(e){
      var item = e.currentTarget.dataset.item;
      api.Navigate.go({
            url: '../orderdetail/orderdetail?orderId='+item.orderId
          });
    },
    // 点击item上的按钮
    onBtnClick:function(e){
      var item = e.currentTarget.dataset.item;
      var title = e.currentTarget.dataset.title;
      if (title == "去支付") {
        // this.trap.click(this.traps["listtopay_click"].params);
        Util.wxRequestPayment(api, item.orderId, item.gorderId, item.sceneryId);
      } else if (title=="再次预订") {
        // this.trap.click(this.traps["listreorder_click"].params);
        api.Navigate.redirectTo({
            url: '../detail/detail?sceneryId='+item.sceneryId
          });
      } else if (title == "去点评") {
        //暂时不做
        // alert("去点评");
      } else if (title == "去景点") {
        // this.trap.click(this.traps["listgospot_click"].params);
        Util.goToMapPage(item.sceneryName, api, item.address)
      }
    },
    //滚动事件
    onScroll:function(e){
      this.setData({
        scrollTop:e.detail.scrollTop
      })
    },
    scrollToTop:function(){
      //回到顶部
      this.setData({
        toView:"top"
      })
    },
    setScrollViewHeight: function() {
          this.setData({
              scrollViewHeight: getApp().getAppSystemInfo().windowHeight
          });
      },
    onReady:function(){
      // 页面渲染完成
      this.setScrollViewHeight();
    },
    onShow: function() {
      //检测登陆是否失效，并尝试登陆
      var _this = this, _api = api;
      token.checkSessionToken(function(isok) {
          __wxConfig.debug && console.log("orderList checkSessionToken isok = ", isok)
          if (isok) {
            _this.data.currentPageIndex = 1;
            _this.loadData('getNew');
          } else {
            token.autoLogin(function() {
                _api.showModal({
                    title: '授权登录',
                    content: '登录后艺龙将获得您的昵称、头像等公开信息。',
                    showCancel:true,
                    confirm: function() {
                        token.autoLoginConfirm(_this.loginCallback.bind(_this))
                    }.bind(_this),
                    cancel: function() {
                        token.autoLoginCancel();
                    }.bind(_this)
                });
            }.bind(_this), _this.loginCallback.bind(_this));
        }
      }.bind(_this));
    },
    //登录回调
    loginCallback: function(loginRes, errorCode) {
        //失败弹框
        var _this = this, _api = api;
        __wxConfig.debug && console.log("orderList loginCallback loginRes = ", loginRes)
        __wxConfig.debug && console.log("orderList loginCallback errorCode = ", errorCode)
        if (loginRes === null ||loginRes === undefined) {
            var content = '登录系统出了点小问题，您可用游客身份下单，或重新尝试登录。';
            if (errorCode != '') content += '[' + errorCode + ']';
            _api.showModal({
                title: '登录失败',
                content: content,
                confirmText: '重新登录',
                cancelText: '游客浏览',
                confirm: function() {
                    token.login(_this.loginCallback.bind(_this))
                }.bind(_this),
                cancel: function() {
                    // _this.autoPrecision();
                }.bind(_this)
            });
        } else {
          _this.data.currentPageIndex = 1;
          _this.loadData('getNew');
        }
    },
    render: function(data) {
        this.setData(data || this.data);
    },
    onHide:function(){
      // 页面隐藏
    },
    onUnload:function(){
      // 页面关闭
    }
  })
})(__overwrite.require(require, __dirname), __overwrite.Page);