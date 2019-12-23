// pages/detail/detail.js
var __dirname = "pages/detail";
var __overwrite = require("../../utils/overwrite.js");
(function(require, Page) {
   var api = require("utils/api")(__dirname),
    token = require('utils/token'),
    Util = require('utils/util'),
    DetailService = require('service/detail'),
    CalendarPlugin = require('components/calendar/index'),
    SpotClick = require('utils/spot-click'),
    CalendarServer= require('service/calendar'),
    specialSaleSelected = false,
    mRefreshData = false,
    app = getApp();
  Page({
    data: {
      sceneryId:"",//景点id
      title:"",//景点名
      address:{
        addressDesc:"",
        baiduLat:"",
        baiduLon:"",
        googleLat:"",
        googleLon:""
      },//位置信息
      bookingRules:[{content:"", title:""},],//预订规则
      commentCount:"",//评论数量
      commentList:[],//评论列表
      commentScore:"0",//评分
      countryId:"",//国家id : 中国id=1
      coverImage:"",//默认图片,封面图
      imageList: [],//景区所有图片的url列表
      level:"",//景点级别
      surroundingScenery:[],//周边景点推荐
      ticketList:[],//门票列表数据:返回所有门票[{"key":"A","value":[{},{}]},{"key":"A","value":[{},{}]},{"key":"A","value":[{},{}]}]
      ticketTagList:[],//该景区下的门票标签
      ticketTagItemList:[],// 该景区下的门票标签item，包含显示的字符串及当前选中状态
      commentHeaderNumberCategory:"",
      commentHeaderScoreCategory:"此景点暂无评论",
      //图片索引
      imgIndex: 0,
      swiperLoop:false,
      orderSelected:true,
      commentSelected:false,
      noticeSelected:false,
      showSwitchTabSimulate:false,

      showpircePullmenu:false,
      pullMenudata:[],
      pullmenutitle:"",
      pullmenutip:"",
      priceData:[],
      selectedticket:null,
      //特价筛选
      isSpecialSaleSelected:0,
      //热门资源点击
      hotTicketId:"",
      scrollHeight:667,
      screenWidth:0,
      tabIndex:0,//默认选择预订门票
      isShowMoreHotTicket:false,//热卖推荐是否展示查看更多5>count>2
      toView:'',
      startNumbers:[1,2,3,4,5],
      isShowDateChoose:false,
      disablebookcontent:["今日不可订","明日不可订"],
      time:["今天","明天"],
      showBuyRules:false,
      buyrulestitle:"",
      purchaseRules:[],
      rulePopHeight:667,
      buyrulesprice:0,
      buyrulesticket:{},
      calendarData:{},
      scrollTop:0,
      tabMenusEnableState:[],//tab菜单是否可点击状态
      callback:{},//回调函数
      callbackOptions:{},
    },
    onLoad: function (options) {
      // 页面初始化 options为页面跳转所带来的参数
      this.data.isSpecialSaleSelected = options.isSpecialSaleSelected || 0
      this.data.sceneryId = options.sceneryId
      //设置各种高度
      var systemInfo = getApp().getAppSystemInfo()
      this.data.rulePopHeight = systemInfo.windowHeight -80
      this.data.scrollHeight = systemInfo.windowHeight
      this.data.dataviewHeight = systemInfo.windowHeight
      this.data.screenWidth = systemInfo.windowWidth
      this.loadData();
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
    loadData:function() {
      var _this = this;
      var _api = api;
      DetailService.GetDetail(this.data.sceneryId, 1).then(function(data) {
          let bookingrules = [];//取得前两个预订规则
          if (data && data.bookingRules && data.bookingRules.length>0) {
            bookingrules = data.bookingRules.slice(0,2)
          }
          _this.setData({
            sceneryId:_this.data.sceneryId,
            title:data.title,
            address:data.address,
            bookingRules:data.bookingRules,
            showBookingRules:bookingrules,
            commentCount:data.commentCount,
            commentList:_this.formateCommentList(data.commentList),
            commentScore:data.commentScore,
            commentStarValue:_this.getStarValue(data.commentScore),
            countryId:data.countryId,
            coverImage:Util.formateImgUrl(data.coverImage),
            imageList:data.imageList,
            level:data.level,
            surroundingScenery:_this.formatSurroundingSceneryData(data.surroundingScenery),
            ticketList:_this.formateTicketList(data.ticketList),
            ticketTagList:data.ticketTagList,
            isSpecialSaleSelected:_this.data.isSpecialSaleSelected,
            ticketTagItemList:_this.formateFilterList(data.ticketTagList,_this.data.isSpecialSaleSelected),
            scrollHeight:_this.data.scrollHeight,
            dataviewHeight:_this.data.dataviewHeight,
            screenWidth:_this.data.screenWidth,
            rulePopHeight:_this.data.rulePopHeight,
            tabMenusEnableState:[data.ticketList && data.ticketList.length>0, data.commentList && data.commentList.length>0, bookingrules.length>0]
          });
          _this.stopRefresh()
          _this.updateTicketGroup()
          if(_this.data.isSpecialSaleSelected == 1) {
            _api.showToast({
              title: '已选中特价票',
              duration: 2000
            })
          }
          __wxConfig.debug && console.log("detail data = ", _this.data);
      }.bind(this));
    },
    formateCommentList:function(commentList){
      //评论最多展示两条
      var _this = this
      if(commentList && commentList.length>0) {
        var tempcommentList = commentList.slice(0,2);
        tempcommentList.map(function(commentItem){
          return _this.dealCommentItemData(commentItem);
        })
        return tempcommentList;
      }
      return [];
    },
    /*
    * 映射图片url
    */
    dealCommentItemData:function(item){
      var _this = this
      var num = item && Number(item.score);
      item.score = num && num.toFixed(1);
      item.originImageUrlList = item.imageUrlList && item.imageUrlList.map(function(url){
        url = Util.formateImgUrl(url)
        return url
      });
      item.imageUrlList = item.imageUrlList && item.imageUrlList.slice(0,4);
      item.imageUrlList = item.imageUrlList && item.imageUrlList.map(function(url){
        url = Util.formateImgUrl(url)
        return url
      })
      item.commentTime = this.formatDate(item.commentTime);
      item.userName = item.userName && this.encodeUserName(item.userName);
      return item;
    },
    formatDate:function(oriTimestamp){
      var nowTimestamp=new Date().getTime();
      var deltaTimestamp = nowTimestamp - oriTimestamp;
      if(deltaTimestamp< 60){
        return "刚刚";
      }else if(deltaTimestamp < 3600){
        var minute = deltaTimestamp/60;
        return Math.ceil(minute)+"分钟前";
      }else if(deltaTimestamp<86400){
        var hours = deltaTimestamp/3600;
        return Math.ceil(hours)+"小时前";
      }else if(deltaTimestamp<86400 * 2){
        return "昨天";
      }else{
        var oriDate = new Date(oriTimestamp);
        var   year=oriDate.getFullYear();
        var   month=oriDate.getMonth()+1;
        var   date=oriDate.getDate();
        return  year+"/"+month+"/"+date;
      }
    },
    encodeUserName:function(userName){
      if(userName.length>6){
        var prefix = userName.slice(0,3);
        var suffix = userName.slice(userName.length - 3);
        var middle = userName.slice(3,userName.length - 3);
        var userName = prefix;
        for(var i = 0;i<middle.length;i++){
          userName = userName + '*';
        }
        return userName + suffix;
      }
      return userName;
    },
    formateFilterList:function(ticketTagList,isSpecialSaleSelected){
      var newFilterList = [];
      if(ticketTagList && ticketTagList.length>0) {
        ticketTagList.map(function(title){
          if(title && title.length>0) {
            var item = {title:title,isSelected:false};
            if(title == "特价" && Number(isSpecialSaleSelected) == 1) {
              item.isSelected = true;
              specialSaleSelected = true;
            }
            newFilterList.push(item);
          }
        });
      }
      return newFilterList;
    },
    checkLoginState: function () {
      // 检测登陆是否失效，并尝试登陆
      var _this = this
      token.checkSessionToken(function (isok) {
        __wxConfig.debug && console.log("detail checkLoginState checkSessionToken isok =  ", isok)
        if (isok) {
          _this.data.callback(_this, _this.data.callbackOptions)
        } else {
          token.autoLogin(function () {
            api.showModal({
              title: '授权登录',
              content: '登录后艺龙将获得您的昵称、头像等公开信息。',
              showCancel: false,
              confirm: function () {
                token.autoLoginConfirm(_this.loginCallback.bind(_this))
              }.bind(_this)
            })
          }.bind(_this), _this.loginCallback.bind(_this))
        }
      }.bind(_this))
    },
    // 登录回调
    loginCallback: function (loginRes, errorCode) {
      // 失败弹框
      var _this = this
      __wxConfig.debug && console.log("detail loginCallback loginRes = ", loginRes)
      __wxConfig.debug && console.log("detail loginCallback errorCode = ", errorCode)
      if (loginRes === null || loginRes === undefined) {
        var content = '登录系统出了点小问题，请重新尝试登录。'
        if (errorCode != '') content += '[' + errorCode + ']'
        api.showModal({
          title: '登录失败',
          content: content,
          confirmText: '登录',
          showCancel:false,
          confirm: function () {
            token.login(_this.loginCallback.bind(_this))
          }.bind(_this)
        })
      } else {
        //登录成功
        _this.data.callback(_this.data.callbackOptions)
      }
    },
    onScroll:function(options) {
    },
    onCoverClick:function(){
      if(this.data.imageList && this.data.imageList.length>0) {
        var _this = this;
        api.Image.preview({
          urls:_this.data.imageList.map(function(item){
            item = Util.formateImgUrl(item)
            return item
          })
        })
      }
    },
    formateTicketList:function(ticketList) {
      if (!ticketList || ticketList.length == 0) {
        return
      }
      var _this = this
      var hotGroupIndex = -1;
      var otherTicketGroupIndex = -1;//是否有园内其他票
      var allTicketCount = 0;
      var newArr = [];
      let hotDetailsTicketItem;
      for(let i = 0 ; i<ticketList.length;i++){
        if (ticketList[i] && ticketList[i].key && ticketList[i].value && ticketList[i].value.length>0){
          //只添加有效的ticket到分组,并且把热门推荐放在第一组
          var dataItem = Util.objectClone(ticketList[i]);
          dataItem.value = dataItem.value.map(function(ticket){
            ticket.showOriginalPrice = Util.formatePrice(ticket.originalPrice);
            ticket.showCurrentPrice = Util.formatePrice(ticket.currentPrice);
            return ticket;
          });
          dataItem.isExpanded = true;
          if (dataItem.key === "热卖推荐") {
            hotGroupIndex = i;
            hotDetailsTicketItem = dataItem;
          }else{
            if(dataItem.key === "园内其他票") {
              otherTicketGroupIndex = i;//是否有园内其他票
            }
            allTicketCount += dataItem.value.length;
            newArr.push(dataItem);
          }
        }
      }
      if (allTicketCount >=6 && hotGroupIndex >= 0 && hotDetailsTicketItem.value.length>0) { // 总票数大于等于6，才展示热卖模块
        //把热门推荐放在第一组
        //热卖推荐最多展示5个,默认展示两个.
        var hotCommandMaxShowCount = 5;
        var len = hotDetailsTicketItem.value.length>=hotCommandMaxShowCount ? hotCommandMaxShowCount : hotDetailsTicketItem.value.length;
        hotDetailsTicketItem.value = hotDetailsTicketItem.value.splice(0,len);
        for (var i = 0; i < len; i++) {
          let ticketShowTags = [];
          if (Util.isTxtNotEmpty(hotDetailsTicketItem.value[i].ticketTypeDesc)) {
            ticketShowTags.push(hotDetailsTicketItem.value[i].ticketTypeDesc);
          }
          if (hotDetailsTicketItem.value[i].showTags && hotDetailsTicketItem.value[i].showTags.length>0) {
            for (var k = 0; k < hotDetailsTicketItem.value[i].showTags.length; k++) {
              if (Util.isTxtNotEmpty(hotDetailsTicketItem.value[i].showTags[k])) {
                if (k == 0 && ticketShowTags.length>0) {
                  //已经添加了ticketTypeDesc
                  if (ticketShowTags[0] !=  hotDetailsTicketItem.value[i].showTags[0]) {
                    ticketShowTags.push(hotDetailsTicketItem.value[i].showTags[k]);
                  }
                } else {
                  ticketShowTags.push(hotDetailsTicketItem.value[i].showTags[k]);
                }
              }
            }
          }
          hotDetailsTicketItem.value[i].showTags = ticketShowTags;
        }
        // 把热卖推荐插入到最前面
        newArr.splice(otherTicketGroupIndex>0?otherTicketGroupIndex:newArr.length,0,hotDetailsTicketItem);
        this.data.isShowMoreHotTicket = len > 2?true:false;
      }
      return newArr;
    },
    /*
    * 把周边景点的一维数组转换为二维数组
    */
    formatSurroundingSceneryData:function(arr){
      if (!arr || arr.length==0) {
        return [];
      }
      var _this = this
      let newArr = [];
      let len = parseInt((arr.length-1)/2) + 1;
      for(let i = 0 ; i<len;i++){
        let index = i * 2;
        let a = [], ticket;
        ticket = arr[index++];
        a.push(this.formatSurroundSceneryData(ticket));
        if(index < arr.length){
          ticket = arr[index];
          a.push(this.formatSurroundSceneryData(ticket));
        }
        newArr.push(a);
      }
      return newArr;
    },
    formatSurroundSceneryData:function(ticket){
        ticket.showOriginalPrice = Util.formatePrice(ticket.originalPrice);
        ticket.showCurrentPrice = Util.formatePrice(ticket.currentPrice);
        ticket.imageUrl = Util.formateImgUrl(ticket.imageUrl);
        if(Util.isTxtNotEmpty(ticket.scenicDesc)) {
            ticket.scenicDesc = ticket.scenicDesc.replace(/[\r\n]/g, "");
        }
        return ticket;
    },
    getStarValue:function(value){
      var fix = value%0.5;
      var value = !fix?value:Math.round(value);
      var intValue = parseInt(value);
      var fixValue = value - intValue;
      var result = {value:value,intValue:intValue,fixValue:fixValue};
      return result;
    },
    updateTicketGroup:function(){
      var _this = this
      var tempArray = Util.copyArrayDeep(this.data.ticketList);
      // 筛选 filterTags
      var currentFilterList = []
      this.data.ticketTagItemList && this.data.ticketTagItemList.map(function(filterItem){
        if(filterItem.isSelected) {
          currentFilterList.push(filterItem.title)
        }
      })
      if(currentFilterList.length>0){
        var deleteKeyItemNum = 0;
        for(var i = 0;i<this.data.ticketList.length;i++){
          var ticketGroup = this.data.ticketList[i];
          if (ticketGroup && ticketGroup.key && ticketGroup.value && ticketGroup.value.length>0){
            var deleteValueItemNum = 0;
            for(var j = 0;j<ticketGroup.value.length;j++){
              var ticket = ticketGroup.value[j];
              // 如果不符合筛选条件，则从tempArray中删除该资源
              if(!Util.arrayHasSubArray(ticket.filterTags,currentFilterList)){
                tempArray[i - deleteKeyItemNum].value.splice(j - deleteValueItemNum,1);
                deleteValueItemNum++;
              }
            }
            // 若删除票后该组为空，则将该组也删除
            if(tempArray[i - deleteKeyItemNum].value.length == 0){
              tempArray.splice(i - deleteKeyItemNum,1);
              deleteKeyItemNum++;
            }
          }
        }
      }
      this.setData({
        showTicketList:tempArray && tempArray.map(function(group){
          if(group.key == "热卖推荐") {
            group.showValue = group.value.splice(0, _this.data.isShowMoreHotTicket?2:5)
          }
          return group
        }),
        isShowMoreHotTicket:this.data.isShowMoreHotTicket
      })
    },
    filterClick:function(options){
      var clickItem = options.currentTarget.dataset.item,
      _this = this;
      this.setData({
        ticketTagItemList:this.data.ticketTagItemList && this.data.ticketTagItemList.map(function(item){
          if(item.title == clickItem.title) {
            item.isSelected = !item.isSelected;
          }
          if(_this.isHuChi(clickItem)) {
            if(_this.isHuChi(item) && item.title!=clickItem.title && item.isSelected == true) {
              item.isSelected = false;
            }
          }
          return item;
        })
      },_this.updateTicketGroup());
    },
    isHuChi:function(item) {
      return item.title == "周末" ||item.title == "平日";
    },
    onTabClick:function(options){
      var _this = this;
      if(options.currentTarget.dataset.enable) {
        switch(options.currentTarget.dataset.tabtxt){
          case "预订门票":
            this.setData({
              // tabIndex:0,
              toView:'ticketList'
            })
            break;
          case "查看评价":
            this.setData({
              // tabIndex:1,
              toView:'comment'
            })
            break;
          case "购买须知":
            this.setData({
              // tabIndex:2,
              toView:'bookingRules'
            })
            break;
          default:
            break;
        }
      }
    },
    onTicketGroupClick:function(options){
      var _this = this;
      this.setData({
        showTicketList:this.data.showTicketList && this.data.showTicketList.map(function(item){
          if(item.key == options.currentTarget.dataset.key) {
            item.isExpanded = !item.isExpanded
          }
          return item
        })
      })
    },
    onRightTicketClick:function(options){
      this.data.callbackOptions = options
      this.data.callback = function (that, options){
        if(options.currentTarget.dataset.ticketitem){
          that.openDateView(options.currentTarget.dataset.ticketitem);
        }
      }
      this.checkLoginState();
    },
    openDateView:function(ticket){
      var date = this.getStartAndEndDate();
      var startDate = date.s;
      var endDate = date.e;
      var ticketidlist = [];
      var that = this;
      var _api = api;
      ticketidlist.push(ticket.ticketId);
      CalendarServer.GetPriceCalendar(startDate,endDate,ticketidlist).then(function(data){
        __wxConfig.debug && console.log("detail openDateView CalendarServer response data = ", data)
        if (!data || !data.ticketList || data.ticketList.length == 0 || 
        that.isResourceOrderDisable(data.ticketList[0].ticketCalendar)) {
          _api.showModal({
              title: '',
              content: ticket.title+'已暂停售卖，请选择其他门票',
              showCancel: false,
            })
          return
        }
        let datePricelist = data.ticketList[0].ticketCalendar;
        if(datePricelist[0].isBookable || datePricelist[1].isBookable){
            var twoDate = datePricelist.slice(0,2);
            __wxConfig.debug && console.log("detail twoDate = ", twoDate)
            twoDate && twoDate.map(function(item){
              item.showCostPrice = Util.formatePrice(item.costPrice);
              item.showPrice = Util.formatePrice(item.price);
              return item
            })
            that.setData({
              isShowDateChoose:true,
              priceViewData:{
                ticketId:ticket.ticketId,
                date:twoDate
                },
              priceViewTitle:ticket.title,
              priceViewTip:ticket.boobkingNotice,
              calendarData:{
                ticketList:data.ticketList
              }
            });
        }else{
          var calendarData = {};
          if(data && !data.IsError){
            calendarData = {
                ticketList:data.ticketList
              };
          }
          CalendarPlugin({
            sceneryId:that.data.sceneryId,
            ticketId:ticket.ticketId,
            sceneryTitle:that.data.title,
            fromdetail:true,
            fromOrderFillIn:false,
            checkTravelDate:"",
            calendarData:JSON.stringify(calendarData)
          }, function (res) {
          })
        }
      });
    },
    seeMore:function(options){
      switch(options.currentTarget.dataset.type){
        case "comment":
          this.goToCommentListPage();
          break;
        case "purchaseRules":
          this.goToBookingRulesMorePage();
        default:
          break;
      }
    },
    seeMoreHotTicket:function(){
      this.setData({
        isShowMoreHotTicket:!this.data.isShowMoreHotTicket
      })
      this.updateTicketGroup()
    },
    onCommentItemImgClick:function(options){
        api.Image.preview({
          current:options.currentTarget.dataset.url,
          urls:options.currentTarget.dataset.imageurllist||[]
        })
    },
    goToCalendarPage:function(options){
      //价格日历
      __wxConfig.debug && console.log("detail goToCalendarPage options = ", options);
      var  _this = this, _api=api;
      CalendarPlugin({
        sceneryId:this.data.sceneryId,
        ticketId:this.data.priceViewData.ticketId,
        sceneryTitle:this.data.title,
        fromdetail:true,
        fromOrderFillIn:false,
        checkTravelDate:"",
        calendarData:JSON.stringify(this.data.calendarData)
      }, function (res) {
      })
    },
    onSurroundingSceneryItemClick:function(options){
      //周边景点点击
      __wxConfig.debug && console.log("detail onSurroundingSceneryItemClick options = ", options);
      api.Navigate.redirectTo({
        url: '../detail/detail?sceneryId='+options.currentTarget.dataset.sceneryid
      });
    },
    goToCommentListPage:function(){
      //跳转评论列表页
      if(this.data.commentCount > 0) {
        api.Navigate.go({
          url: '../commentlist/commentlist?sceneryid='+this.data.sceneryId+"&sceneryTitle="+this.data.title
        });
      }
    },
    goToMapPage:function(){
      //跳转地图页
      Util.goToMapPage(this.data.title, api, this.data.address)
    },
    goToScenerySpecialPage:function(){
      //跳转景点特色页
      api.Navigate.go({
        url: '../sceneryspecial/sceneryspecial?sceneryid='+this.data.sceneryId+'&scenerytitle='+this.data.title
      });
    },
    goToBookingRulesMorePage:function(){
      //跳转购买须知页 todo
      var param = JSON.stringify(this.data.bookingRules);
      api.Navigate.go({
        url: '../bookingRulesMore/bookingRulesMore?data='+param
      });
    },
    selectTravelDate:function(options){
      var item = options.currentTarget.dataset.item
      if(item) {
        //选择了今天明天
        var param = "sceneryId="+this.data.sceneryId+"&sceneryTitle="+this.data.title+"&ticketId="+this.data.priceViewData.ticketId+"&travelDate="+item.calendarDate+"&ticketPayPrice="+item.price+"&ticketCostPrice="+item.costPrice+"&calendarData="+JSON.stringify(this.data.calendarData);
        api.Navigate.go({
          url:"../fillinorder/fillinorder?"+param
        });
        
      } else {
        //价格日历页
        this.goToCalendarPage(options)
      }
      this.setData({
          isShowDateChoose:false,
        });
    },
    onClickDateback:function(){
      this.setData({
          isShowDateChoose:false,
        });
    },
    getStartAndEndDate:function(){
    var start = Date.now();
    var end = start + 60 * 24 * 60 * 60 * 1000;
    return {s:this.getDate(start),e:this.getDate(end)};
    },
    getDate:function(time){
    var date = new Date(time);
    return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
    },
    openBuyrules:function(options){
      this.data.callbackOptions = options
      this.data.callback = function (that, options) {
        var item = options.currentTarget.dataset.item;
        if(item){
          that.setData({
            showBuyRules:true,
            buyrulestitle:item.title,
            purchaseRules:item.bookingRules,
            buyrulesprice:item.currentPrice,
            buyrulesticket:item,
          });
        }
      }
      this.checkLoginState();
    },
    setBuyRulesShowState:function(options){
      this.setData({
        showBuyRules:false,
      })
    },
    payOnline:function(){
      // this.setData({
      //   showBuyRules:false,
      // });
      //无操作
    },
    booking:function(){
      //TODO 缺少登陆逻辑的判断
      this.setData({
        showBuyRules:false,
      });
      this.openDateView(this.data.buyrulesticket);
    },
    /*
  *判断资源是否已经下线或者不可订
    */
    isResourceOrderDisable:function(calendarItemDataList){
      //判断是否为下线资源
      var isResourceDisabled = true;
      if (!calendarItemDataList || calendarItemDataList.length==0) {
          return isResourceDisabled;
      }
      for(var i = 0; i< calendarItemDataList.length; i++) {
        var item = calendarItemDataList[i];
        if(item.isBookable == 1) {
          isResourceDisabled = false;
          break;
        }
      }
      return isResourceDisabled;
    }
  })
})(__overwrite.require(require, __dirname), __overwrite.Page);