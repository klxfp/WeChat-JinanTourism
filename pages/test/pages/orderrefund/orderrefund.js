// pages/orderrefund/orderrefund.js
var __dirname = "pages/orderrefund";
var __overwrite = require("../../utils/overwrite.js");
(function(require, Page) {
   var api = require("utils/api")(__dirname),
    OrderRefundService = require('service/orderrefund'),
    Util = require('utils/util'),
    SpotClick = require('utils/spot-click');
    var app = getApp();
    var currentReasonItem = {};
    var totalCount = 0,
        mRefreshData = false;
    Page({
      data:{
        comfirmEnabled:false,
        isWithoutMoney:false,
        canRefundMoney:"",
        cancelType:2,
        totalCutAmount:0,
        totalAmount:0,
        scrollHeight:667,
        rulePopHeight:667,
        showRefundRules:false,
        screenWidth:370,
        rulePageData:{},
        reasonItemList:[
          {
            "title":"行程取消",
            "reasonId":1,
            "content":"",
            "isSelected":false
          },
          {
            "title":"需要更改出行日期",
            "reasonId":2,
            "content":"",
            "isSelected":false
          },
          {
            "title":"换个景点看看",
            "reasonId":2,
            "content":"",
            "isSelected":false
          },
          {
            "title":"未收到取票确认信息",
            "reasonId":3,
            "content":"",
            "isSelected":false
          },
          {
            "title":"景区没我订票信息不让进",
            "reasonId":4,
            "content":"",
            "isSelected":false
          },
          {
            "title":"找到更低价的票了",
            "reasonId":5,
            "content":"",
            "isSelected":false
          },
          {
            "title":"景区爆满/闭园",
            "reasonId":6,
            "content":"",
            "isSelected":false
          },
          {
            "title":"其他原因",
            "reasonId":7,
            "content":"",
            "isSelected":false
          },
        ],
        orderRefundItemList:[]
      },
      onLoad:function(options){
        // 页面初始化 options为页面跳转所带来的参数
        mRefreshData = false
        currentReasonItem = {};
        totalCount = 0;
        this.data.scrollHeight = getApp().getAppSystemInfo().windowHeight;
        this.data.rulePopHeight = getApp().getAppSystemInfo().windowHeight -80;
        this.data.screenWidth = getApp().getAppSystemInfo().windowWidth;
        this.data.orderId = options.orderId || ''
        this.loadData()
      },
      loadData:function(){
        var _this = this, _api = api;
        try{
          OrderRefundService.orderRefundValidate(this.data.orderId).then(function(data){
            _this.transformDatas(data);
            _this.stopRefresh()
          });
        }catch(err){ //todo ,异常处理
          _this.transformDatas(null);
          _this.stopRefresh()
          _api.showModal({
            title:"提示",
            content:err||"抱歉,获取申请退款订单数据异常",
            confirm: function() {
              _api.Navigate.back()
            }.bind(_this),
            showCancel:false
          })
        }
      },
      onPullDownRefresh: function(){
        mRefreshData = true
        this.loadData()
      },
      stopRefresh:function(){
          if(mRefreshData) {
              mRefreshData = false
              wx.stopPullDownRefresh()
          }
      },
      transformDatas:function(data){
        if(Util.isEmptyObject(data)) {
          return
        }
        var _api = api
        if (data.cancelType != 2) {
          var errMsg = data.ErrorMessage
          if(!Util.isTxtNotEmpty(data.ErrorMessage)) {
            switch(data.cancelType){
              case 1:
                errMsg = "该订单已取消";
                break;
              case -1:
                errMsg = "该订单不能退订";
                break;
              default:
                errMsg = "抱歉, 该订单不能申请退款"
                break;
            }
          }
          _api.showModal({
            title:"提示",
            content:errMsg,
            confirm: function() {
              _api.Navigate.back()
            }.bind(this),
            showCancel:false
          })
          return
        }
        var isWithoutMoney = false,
            _this = this,
            count = 0;
        for(var i = 0;i< data.orderRefundItemList;i++){
          var item = data.orderRefundItemList[i];
          if(item.cancelType == 3){ // 可退订无详细金额
            isWithoutMoney = true;
          }
          if(item.cancelType == 2 || item.cancelType == 3){
            count++;
          }
        }
        totalCount = count;
        if(!data.canRefundMoney || data.canRefundMoney.length == 0 || data.canRefundMoney <=0){
          isWithoutMoney = true;
        }
        _this.setData({
          canRefundMoney:data.canRefundMoney,
          cancelType:data.cancelType,
          orderRefundItemList:data.orderRefundItemList,
          totalCutAmount:data.totalCutAmount,
          totalAmount:data.totalAmount,
          isWithoutMoney:isWithoutMoney,
          scrollHeight:this.data.scrollHeight,
          rulePopHeight:this.data.rulePopHeight,
          screenWidth:this.data.screenWidth
        });
        if (mRefreshData) {
          mRefreshData = false
          wx.stopPullDownRefresh()
        }
      },
      reasonSelected:function(options){
        var index = options.currentTarget.dataset.index;
        for(var i = 0;i<this.data.reasonItemList.length;i++){
          var item = this.data.reasonItemList[i];
          item.isSelected = i == index;
        }
        currentReasonItem = this.data.reasonItemList[index];
        var enabled = false;
        enabled = currentReasonItem.reasonId == 7?(currentReasonItem.content && currentReasonItem.content.length>0):true; 
        this.setData({
          comfirmEnabled:enabled && this.data.cancelType !=-1, 
          reasonItemList:this.data.reasonItemList
        });
      },
      orderRefundComfirm:function(){
        this.unsubscribeOrder();
      },
      //TODO 跳转退改规则
      goToRefundRulesPage:function(options){
        var item = options.currentTarget.dataset.item;
        if(Util.isEmptyObject(item)) {
          return
        }
        var ticketTypeDesc = item.resourceTypeName?'【'+item.resourceTypeName+'】':"";
        var ticketTitle = ticketTypeDesc + item.resourceName;
        this.data.rulePageData = {
          title:ticketTitle,
          refundRules:item.refundRules
        };
        this.setData({
          rulePageData:this.data.rulePageData,
          showRefundRules:true
        })
      },
      setBuyRulesShowState:function(){
        this.setData({
          showRefundRules:false
        })
      },
      unsubscribeOrder:function(){
        var _api = api,
            _this = this;
        var params = {
          amount: this.data.canRefundMoney,
          orderId: this.data.orderId||"",
          reason:currentReasonItem.title,
          reasonId:currentReasonItem.reasonId,
          remark:currentReasonItem.content,
          totalCount:totalCount
        };
        try{
          let newParams = Object.assign({}, params);
          OrderRefundService.unsubscribeOrder(newParams).then(function(data){
            if(data && !data.IsError) {
              _api.showToast({
                  title:"退款成功"
                });
              _this.backToForward();
            }
          });
        }catch(err){ //todo ,异常处理
          api.showToast({
              title:err+""
            });        
        }
      },
      backToForward:function(){
        api.Navigate.back()
      },
      onReasonInput:function(e){
        if(e.detail.value.length>100){
          e.detail.value = e.detail.value.slice(0,100);
        }
        var item = this.data.reasonItemList[e.currentTarget.dataset.index]
        item.content = e.detail.value;
        this.setData({
          reasonItemList:this.data.reasonItemList,
          comfirmEnabled:item.content && item.content.length>0 && this.data.cancelType !=-1
        });
      },
      onReady:function(){
        // 页面渲染完成
      },
      onShow:function(){
        // 页面显示
      },
      onHide:function(){
        // 页面隐藏
      },
      onUnload:function(){
        // 页面关闭
      }
    })
})(__overwrite.require(require, __dirname), __overwrite.Page);