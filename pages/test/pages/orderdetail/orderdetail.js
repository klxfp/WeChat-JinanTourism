// pages/orderdetail/orderdetail.js
var __dirname = "pages/orderdetail";
var __overwrite = require("../../utils/overwrite.js");
(function(require, Page) {
   var api = require("utils/api")(__dirname),
    token = require('utils/token'),
    Util = require('utils/util'),
    OrderDetailService = require('service/orderdetail'),
    SpotClick = require('utils/spot-click');
    var app = getApp(),
        mRefreshData = false;
    Page({
      data:{
        options:{},
        scrollViewHeight: '571',
        cancelPayState:"",
          contactInfo:{email: '',mobile: '',name: ''},
          countryId:1,
          isExistRefund:true,
          showCancelPop:false,
          showRefundRulePop:false,
          showOtherOrderInfoPop:false,
          showRefundLogPop:false,
          otherOrderInfos:[],
          showRefundRules:[],
          rulePopHeight:667,
          otherInfoScrollHeight:667,
          cancelReasonArr:[
            {title: '行程不确定',isSelected: true},
            {title: '价格原因',isSelected: false},
            {title: '需要更改出行日期',isSelected: false},
            {title: '评价不好',isSelected: false},
            {title: '其他原因',isSelected: false}
          ],
          itemList:[{
            "ticketTypeName":"",
            "productName":"",
            "refundCount":1,
            "usedCount":1,
            "refundType":1,
            "refundRules":[{"content": "","title": ""}],
            "useDate":"",
            "unitPrice":"",
            "buyCount":"",
            "exchangeDesc":"",
            "admissionCertificate":"",
            "qrCodeUrl":"",
            "qrCode":"",
            "passengerInfoList":[],
            "extendInfoList":[]
            },
          ],
          lastPayTime:-1,
          merchantOrderId:"",
          orderId:"",
          gorderId:"",
          orderRefundLogs:[{refundDate: "",refundDesc: "",refundTitle:""}],
          orderTime:"",
          payTime:"",
          playDate:"",
          sceneryInfo:{"sceneryId":"","sceneryName":"", "sceneryLevel":4,"openTimeDesc":"","address":{"addressDesc":""}},
          sendMsgCount:0,
          status:8,
          ticketCounts:1,
          ticketTypeName:"",
          totalPrice:"310",
          unCommentCount:0,
          statusModel:{"statusDesc" : "","priceViewShow" : true,"priceDesc1" : "","tipsShow" : true, "tipsDesc" : "","buttonCount" : 2,"confirmBtnDesc" : "","cancelBtnDesc" : "","extraBtnDesc" : ""}
      },
      /*秒级倒计时 */
      countdown: function() {
        //渲染倒计时时钟
        var that = this
        if (this.data.status != 1 || this.data.lastPayTime < 0) {
          return
        }
        this.data.statusModel.tipsDesc = "需在"+this.timeFormat(this.data.lastPayTime)+"分钟内完成支付,否则该订单将被自动取消";
        this.setData({
          statusModel:this.data.statusModel
        });
        if (this.data.lastPayTime == 0) {
          this.data.lastPayTime = -1;
          that.loadData();
          return ;
        } else {
          setTimeout(function(){
            // 放在最后--
            if (that.data.lastPayTime >= 1000) {
              that.data.lastPayTime -= 1000;
              that.countdown();
            }
          }, 1000)
        }
      },
      onPullDownRefresh: function(){
        mRefreshData = true
        this.loadData();
      },
      stopRefresh:function(){
          if(mRefreshData) {
              mRefreshData = false
              wx.stopPullDownRefresh()
          }
      },
      loadData:function(){
        var _this = this;
        if(!this.data.orderId){
          _this.stopRefresh()
          wx.showToast({
            title:'订单号为空',
            duration:2000
          });
          api.Navigate.back();
          return;
        }
        OrderDetailService.memberOrderDetail(this.data.orderId).then(function(data) {
          __wxConfig.debug && console.log("orderdetail response data = ", data)
          data = _this.transformData(data);
          //鉴于后端更新订单状态的定时任务时间差, 前端主动更新订单状态
          if (data.status == 1 && data.lastPayTime == 0) {
            data.status = 3
            data.cancelPayState = "支付超时，订单自动取消"
          }
          _this.setData({
              cancelPayState:data.cancelPayState||"",
              contactInfo:data.contactInfo,
              countryId:data.countryId,
              isExistRefund:data.isExistRefund,
              itemList:data.itemList,
              lastPayTime:data.status == 1 ? data.lastPayTime : -1,
              merchantOrderId:data.merchantOrderId,
              orderId:data.orderId,
              gorderId:data.gorderId,
              orderRefundLogs:data.orderRefundLogs,
              orderTime:data.orderTime,
              payTime:data.payTime,
              playDate:data.playDate,
              sceneryInfo:data.sceneryInfo,
              sendMsgCount:data.sendMsgCount,
              status:data.status,
              ticketCounts:data.ticketCounts,
              ticketTypeName:data.ticketTypeName,
              totalPrice:data.totalPrice,
              unCommentCount:data.unCommentCount,
              otherInfoScrollHeight:_this.data.otherInfoScrollHeight,
              rulePopHeight:_this.data.rulePopHeight,
            });
            _this.data.status = data.status;
            _this.data.lastPayTime = data.status == 1 ? data.lastPayTime : -1;
            _this.configureStatusModel(data);
            _this.stopRefresh()
        });
      },
      // 数据处理：
      configureStatusModel:function(data){
        var statusModel = {};
        var that = this
        switch(data.status){
          case 1:
            statusModel.statusDesc = "等待支付";
            statusModel.priceViewShow = true;
            statusModel.priceDesc1 = "需在线支付";
            statusModel.tipsShow = true;
            statusModel.tipsDesc = "需在"+this.timeFormat(data.lastPayTime)+"分钟内完成支付,否则该订单将被自动取消";
            statusModel.buttonCount = 2;
            statusModel.confirmBtnDesc = "去支付";
            statusModel.cancelBtnDesc = "取消订单";
            statusModel.extraBtnDesc = "";
            statusModel.refundLogBtnShow = false;
            that.countdown();
            break;
          case 2:
            statusModel.statusDesc = "已支付，资源待确认";
            statusModel.priceViewShow = true;
            statusModel.priceDesc1 = "已支付";
            statusModel.tipsShow = !data.isExistRefund;
            statusModel.tipsDesc = data.isExistRefund?"":"本单一经预订不可取消";
            statusModel.buttonCount = 1;
            statusModel.confirmBtnDesc = "再次预订";
            statusModel.cancelBtnDesc = "";
            statusModel.extraBtnDesc = "";
            statusModel.refundLogBtnShow = false;
            break;
          case 3:
            statusModel.statusDesc = "已取消";
            statusModel.priceViewShow = false;
            statusModel.priceDesc1 = "";
            statusModel.tipsShow = true;
            statusModel.tipsDesc = data.cancelPayState?data.cancelPayState:"订单已取消";
            statusModel.buttonCount = 1;
            statusModel.confirmBtnDesc = "再次预订";
            statusModel.cancelBtnDesc = "";
            statusModel.extraBtnDesc = "";
            statusModel.refundLogBtnShow = false;
            break;
          case 4:
            statusModel.statusDesc = "预订成功";
            statusModel.priceViewShow = true;
            statusModel.priceDesc1 = "已支付";
            statusModel.tipsShow = !data.isExistRefund;
            statusModel.tipsDesc = data.isExistRefund?"":"本单一经预订不可取消";;
            statusModel.buttonCount = data.isExistRefund?3:2;
            statusModel.confirmBtnDesc = "再次预订";
            statusModel.cancelBtnDesc = "重发凭证";
            statusModel.extraBtnDesc = "申请退款";
            statusModel.refundLogBtnShow = false;
            break;
          case 5:
            statusModel.statusDesc = "退款中";
            statusModel.priceViewShow = true;
            statusModel.priceDesc1 = "已支付";
            statusModel.tipsShow = false;
            statusModel.tipsDesc = "";
            statusModel.buttonCount = 2;
            statusModel.confirmBtnDesc = "再次预订";
            statusModel.cancelBtnDesc = "重发凭证";
            statusModel.extraBtnDesc = "";
            statusModel.refundLogBtnShow = true;
            break;
          case 6:
            statusModel.statusDesc = "部分退款成功";
            statusModel.priceViewShow = true;
            statusModel.priceDesc1 = "已支付";
            statusModel.tipsShow = false;
            statusModel.tipsDesc = "";
            statusModel.buttonCount = data.isExistRefund?3:2;
            statusModel.confirmBtnDesc = "再次预订";
            statusModel.cancelBtnDesc = "重发凭证";
            statusModel.extraBtnDesc = "申请退款";
            statusModel.refundLogBtnShow = true;
            break;
          case 7:
            statusModel.statusDesc = "全部退款成功";
            statusModel.priceViewShow = true;
            statusModel.priceDesc1 = "已支付";
            statusModel.tipsShow = false;
            statusModel.tipsDesc = "";
            statusModel.buttonCount = 1;
            statusModel.confirmBtnDesc = "再次预订";
            statusModel.cancelBtnDesc = "";
            statusModel.extraBtnDesc = "";
            statusModel.refundLogBtnShow = true;
            break;
          case 8:
            statusModel.statusDesc = "交易完成";
            statusModel.priceViewShow = true;
            statusModel.priceDesc1 = "已支付";
            statusModel.tipsShow = false;
            statusModel.tipsDesc = "";
            statusModel.buttonCount = 1;
            statusModel.confirmBtnDesc = "再次预订";
            statusModel.cancelBtnDesc = "";
            statusModel.extraBtnDesc = "";
            statusModel.refundLogBtnShow = false;
            break;
        }
        statusModel.priceDesc2 = "¥"+data.totalPrice;
        this.setData({
          statusModel:statusModel
        });    

        return statusModel;
      },
      transformData:function(data){
        var sceneryLevelDesc = "";
        if(data.sceneryInfo.sceneryLevel && data.sceneryInfo.sceneryLevel > 0){
          sceneryLevelDesc = data.sceneryInfo.sceneryLevel + "A级景区";
        }
        data.sceneryInfo.sceneryLevel = sceneryLevelDesc;
        data.itemList = this.ticketInfo_transformData(data.itemList);
        data.orderRefundLogs && data.orderRefundLogs.map(function(item){
          if(item && item.refundDate) {
            item.refundDate_yymmdd = item.refundDate.split(' ')[0];
            item.refundDate_hhmmss = item.refundDate.split(' ')[1];
          }
        })
        return data;
      },

      ticketInfo_transformData:function(data){
        var _this = this;
        return data.map((item)=>{
          item.ticketTypeNameDesc = item.ticketTypeName?("【"+item.ticketTypeName+"】"):"";
          item.refundType = _this.getRefundType(item);
          item.refundNumber = _this.getRefundNumber(item);
          item.bugcountStr = _this.getBuyCountString(item);

          // 处理出行人和附加信息
          var cardTypeDic = {"1":"身份证","2":"护照","3":"学生证","4":"军人证","6":"驾驶证","7":"回乡证","8":"台胞证","10":"港澳通行证","11":"国际海员证","20":"外国人永久居留证","22":"台湾通行证","99":"其他"};
          var extraList = [];
          item.passengerInfoList && item.passengerInfoList.length>0 && item.passengerInfoList.map((obj,idx)=>{
            if (obj.cname||obj.ename) {
                var model = {};
                model.title = "出行人"+(idx+1);
                model.content = obj.cname?obj.cname:obj.ename;
                extraList.push(model);
            }
            if (obj.contactInfo) {
                var model = {};
                model.title = "手机号";
                if (Util.isTxtNotEmpty(obj.contactInfo)) {
                  model.content = Util.confuseString(obj.contactInfo,3,4);
                }
                extraList.push(model);
            }
            if (obj.idCardType && obj.idCardNo) {
                var model = {};
                model.title = cardTypeDic[obj.idCardType];
                model.content = obj.idCardNo;
                extraList.push(model);
            }
            return obj;
          });

          item.extendInfoList && item.extendInfoList.length>0 && item.extendInfoList.map((obj,idx)=>{
            if (!obj.typeContent && obj.selectContents) {
                obj.selectContents.map((content)=>{
                  var model = {};
                  model.title = obj.typeName;                 
                  model.content = content;
                  extraList.push(model);      
                });
            } else {
              var model = {};
              model.title = obj.typeName;
              model.content = obj.typeContent;
              extraList.push(model);
            }
            return obj;
          });
          item.extraList = extraList;

          item.displayExtraList = [];

          if(item.exchangeDesc){
            var exchangeDescList= new Array();
            exchangeDescList= item.exchangeDesc && item.exchangeDesc.split("\n");
            if(exchangeDescList.length == 0){
              exchangeDescList.push(item.exchangeDesc);
            }
            item.exchangeDescList = exchangeDescList;
          }
          return item;
        });
      },
      getRefundType:function(item){
        var refundTypeStr = "";
        var refundType = item.refundType;
        if (refundType == 1) {
            refundTypeStr = "随时退";
            
        } else if (refundType == 2) {
            refundTypeStr = "非随时退";
        } else if (refundType == 3) {
            refundTypeStr = "不可退";
        }
        return refundTypeStr;
      },

      getRefundNumber:function(item){
        var refundString = "";
        var buyString = "";
        var refundCount = item.refundCount;
        var usedCount = item.usedCount;
        if (refundCount > 0) {
            refundString = "已使用"+refundCount+"张";
        }else {
            refundString = "";
        }
        if (usedCount > 0) {
            buyString = "已使用"+usedCount+"张";
        }else {
            buyString = "";
        }
        
        var string = "";
        if(refundString && buyString)
          string = refundString+" "+buyString;
        return string;
      },

      getBuyCountString:function(item){
        var price = "¥"+item.unitPrice+"×";
        if (item.buyCount>0) {
            return price+item.buyCount+'张';
        }else {
            return "";
        }
      },

      setScrollViewHeight: function() {
            var _this = this;
            _this.setData({
                scrollViewHeight: getApp().getAppSystemInfo().windowHeight
            });
        },

    // 退款日志:
      setRefundLogPopShowState:function(options){
        this.setData({
          showRefundLogPop:options.currentTarget.dataset.show == 1
        })
      },
      btnClick:function(event){
      var btnTitle = event.currentTarget.dataset.params;
        switch(btnTitle){
          case "去支付":
            Util.wxRequestPayment(api, this.data.orderId, this.data.gorderId, this.data.sceneryInfo.sceneryId);
            // this.trap.click(this.traps["detailtopay_click"].params);
            break;
          case "取消订单":
            // 1.弹出子页选择 TODO
            // 2.选择后回调发送取消订单接口
            // this.trap.click(this.traps["cancel_click"].params);
            this.setData({
              showCancelPop:true
            })
          break;
          case "重发凭证":
            // this.trap.click(this.traps["revoucher_click"].params);
            this.resendMessage();
            break;
          case "再次预订":
            // this.trap.click(this.traps["reorder_click"].params);
            this.goToProductDetailPage();
            break;
          case "申请退款":
            // this.trap.click(this.traps["applyrefund_click"].params);
            if(this.data.status == 6){ // 部分退款
              api.showModal({
                  title: '',
                  content: "本订单请联系艺龙客服：400-6160-303处理",
                  showCancel: false,
                  confirm: function () {
                  }.bind(this)
              })
            }else{
              //跳转申请退款页
              api.Navigate.go({
                url:"../orderrefund/orderrefund?orderId="+this.data.orderId
              })
            }
            break;
          case "去点评":
            break;
        }
      },
      timeFormat:function(totalSeconds){
        // 秒数
        var second = Math.floor(totalSeconds / 1000);
        // 小时位
        var hr = Math.floor(second / 3600);
        // 分钟位
        var min = Math.floor((second - hr * 3600) / 60);
        // 秒位
        var sec = (second - hr * 3600 - min * 60);
        return (hr<10?'0'+hr:hr) + ':' + (min<10?'0'+min:min) + ':'+ (sec<10?'0'+sec:sec)
    },

    arrowClick:function(event){
      var item = event.currentTarget.dataset.item;
      var index = event.currentTarget.dataset.index;
        if(!(item.extraList && item.extraList.length)) return;
        // this.trap.click(this.traps["ticketdetailspread"].params);
        var displayExtraList = this.data.itemList[index].displayExtraList;
        var isOpened = displayExtraList.length>0;
        this.data.itemList[index].displayExtraList = isOpened?[]:item.extraList;
        var _this = this;
        this.setData({
          itemList:_this.data.itemList
        });
      },
      // 退改规则弹框
      setBuyRulesShowState:function(options){
        // this.trap.click(this.traps["rules_click"].params);
        this.setData({
          showRefundRulePop:options.currentTarget.dataset.show == 1,
          showRefundRules:options.currentTarget.dataset.refundrules||[]
        })
      },
      // 其他预定信息
      closeOtherOrderInfo:function(){
        this.setData({
          showOtherOrderInfoPop:false
        })
      },
      otherMessageClick:function(){
        // this.trap.click(this.traps["otherinfo_click"].params);
        this.data.otherOrderInfos = [];
        if (Util.isTxtNotEmpty(this.data.contactInfo.name)) {
          this.data.otherOrderInfos.push({
            title:"联系人:",
            content:this.data.contactInfo.name
          })
        }
        if (Util.isTxtNotEmpty(this.data.contactInfo.mobile)) {
          this.data.otherOrderInfos.push({
            title:"手机号:",
            content:this.data.contactInfo.mobile
          })
        }
        if (Util.isTxtNotEmpty(this.data.contactInfo.email)) {
          this.data.otherOrderInfos.push({
            title:"邮箱:",
            content:this.data.contactInfo.email
          })
        }
        if (Util.isTxtNotEmpty(this.data.orderTime)) {
          this.data.otherOrderInfos.push({
            title:"下单时间:",
            content:this.data.orderTime
          })
        }
        this.data.otherOrderInfos.push({
          title:"下单方式:",
          content:"在线支付"
        })
        if (Util.isTxtNotEmpty(this.data.payTime)) {
          this.data.otherOrderInfos.push({
            title:"支付时间:",
            content:this.data.payTime
          })
        }
        this.setData({
          otherOrderInfos:this.data.otherOrderInfos,
          showOtherOrderInfoPop:true
        })
      },
      // 取消订单
      selectCancelItem:function(options){
        for(var i=0; i<this.data.cancelReasonArr.length;i++){
          this.data.cancelReasonArr[i].isSelected = options.currentTarget.dataset.index == i
        }
        this.setData({
          cancelReasonArr:this.data.cancelReasonArr
        })
      },
      cancelPopClose:function(options){
        if(isNaN(options.target.dataset.index)||!options.target.dataset.index) {
          this.setData({
            showCancelPop:false
          })
        }
      },
      cancelOrder:function(options){
        var _this = this;
        OrderDetailService.memberCancelOrder(this.data.orderId, '').then(function(data) {
          wx.showToast({
            title:'订单已取消',
            duration:2000
          });
          _this.loadData();
        });
      },
      // 重发凭证
      resendMessage:function(){
        OrderDetailService.sendMessage(this.data.orderId).then(function(data) {
          wx.showToast({
            title:'短信已重发',
            duration:2000
          });
        });
      },
      // 跳转详情页
      goToProductDetailPage:function(){
        var _this = this;
        api.Navigate.redirectTo({
              url: '../detail/detail?sceneryId='+_this.data.sceneryInfo.sceneryId
            });
      },
      // 跳转地图页
      goToMapPage:function(){
          //跳转地图页
          Util.goToMapPage(this.data.sceneryInfo.sceneryName, api, this.data.sceneryInfo.address)
      },
      onLoad:function(options){
        // 页面初始化 options为页面跳转所带来的参数
        mRefreshData = false
        this.data.otherInfoScrollHeight = getApp().getAppSystemInfo().windowHeight-230;
        this.data.rulePopHeight = getApp().getAppSystemInfo().windowHeight -80;
        this.data.options = options;
        this.data.orderId = options.orderId;
      },
      onReady:function(){
        // 页面渲染完成
        this.setScrollViewHeight();
      },
      onShow:function(){
        // 页面显示
        this.loadData();
      },
      onHide:function(){
        // 页面隐藏
      },
      onUnload:function(){
        // 页面关闭
      }
    })
})(__overwrite.require(require, __dirname), __overwrite.Page);