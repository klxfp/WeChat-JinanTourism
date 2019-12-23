var __dirname = "pages/passengerList";
var __overwrite = require("../../utils/overwrite.js");

(function (require, Page) {
  var api = require("../../utils/api.js")(__dirname),
    util = require("../../utils/util.js"),
    passengerDao = require("./dao.js");

  Page({
    data: {
      passengers:[],
      info1:"info1",
			info2:"info2",
			info3:"",
      selectable:false,
      isCurrSelected:false,
			isAlreadySelected:false,
      itemList:[],
      idCardTypeList:[], 
      currPassenger:{}, 
      selectedPassengerList:[],
      scrollHeight:667,
    },
    onLoad: function (options) {
      this.setLoading(true)
      __wxConfig.debug && console.log("passengerList onLoad options = ", options)
      this.data.scrollHeight = getApp().getAppSystemInfo().windowHeight
      this.setData({
        itemList:options.itemList && JSON.parse(decodeURIComponent(options.itemList)),
        idCardTypeList: options.idCardTypeList && JSON.parse(decodeURIComponent(options.idCardTypeList)),
        currPassenger: options.currPassenger && JSON.parse(decodeURIComponent(options.currPassenger)),
        selectedPassengerList: options.selectedPassengerList && JSON.parse(decodeURIComponent(options.selectedPassengerList)),
        scrollHeight:this.data.scrollHeight,
      });
      this.loadAllPassengers();
    },
    isAlreadySelected: function (passenger) {
      return this.data.selectedPassengerList && this.data.selectedPassengerList.length > 0 && this.data.selectedPassengerList.some(e => e.timeStamp === passenger.timeStamp);
    },
    isCurrSelected: function (passenger) {
      return this.data.currPassenger && this.data.currPassenger.timeStamp === passenger.timeStamp;
    },
    loadAllPassengers: function(currentPage){
      var _this = this
      setTimeout(function(){
        passengerDao.findAll(function(passengers){
          _this.setData({
            passengers: passengers && passengers.map(function(passenger){
              passenger.isAlreadySelected = _this.isAlreadySelected(passenger);
              passenger.isCurrSelected = _this.isCurrSelected(passenger);
              passenger.viewModel = _this.convertToViewModel(_this.data.itemList, _this.data.idCardTypeList, passenger);
              return passenger
            })
          });
          _this.setLoading(false)
          __wxConfig.debug && console.log("passengerList loadAllPassengers passengers = ", passengers)
        });
      }, 1000)
    },
    getIdCardTypeNameBy:function(type){
      var name = this.data.idCardTypeList.find(item => item.type === type).name;
    },
    convertToViewModel:function(itemList,idCardTypeList,passenger){
      var viewModel = {};
      var requestFields = itemList.map(item => item.type);//模版中要求的常旅字段
      var usableIdCardTypes = idCardTypeList.map(item => item.type); //模版要求的可选的证件类型
      var keyInPassenger = this.getSavedIdCardTypes(passenger);
      var savedIdCardTypes = keyInPassenger[0];//passenger中已经保存的证件类型
      var savedFields = keyInPassenger[1];//passenger中已经保存的常旅字段

      viewModel.info1 = passenger['cName'] + " " + passenger['firstName'] + " " + passenger['lastName'];
      viewModel.info1 = viewModel.info1.replace(/undefined/g,"");
      viewModel.info2 = passenger["mobile"] ? "+86 " + passenger['mobile'] : undefined;//展示需求，手机号 ＋86
      if (this.isMatch(requestFields,savedFields)) {
        if (requestFields.findIndex(e => e === 'address') !== -1) {//这种情况说明是填写收件人信息，收件地址
          viewModel.info3 = passenger['address'];
        }
        if (usableIdCardTypes.length) {//需要证件证件
          let type = this.canUseSavedIdCardType(usableIdCardTypes,savedIdCardTypes);
          if (type) {//证件匹配
            viewModel.isMatch = true;
            viewModel.info3 = idCardTypeList.find(item => item.type === type).name + ": " +passenger[type];//展示需求，证件名
          }else{//证件不匹配
            viewModel.isMatch = false;
            viewModel.info3 = "证件信息不匹配";
          }
        }else{ //无需证件，已经匹配
          viewModel.isMatch = true;
        }
      }else{//不匹配,信息不全
        viewModel.isMatch = false;
        viewModel.info3 = "信息不全,请补充";
      }
      return viewModel;
    },
    isMatch:function(requestFields,savedFields){
      for(let field of requestFields){
        if (field === 'name') {
          if(!savedFields.some(e => 'cName' === e || 'firstName' === e)){
            return false;
          }
        }else if(field === 'eName'){
          if(!savedFields.some(e => 'firstName' === e)){
            return false;
          }
        }else{
          if(!savedFields.some(e => field === e)){
            return false;
          }
        }
      }
      return true;
    },
    canUseSavedIdCardType:function(usableIdCardTypes,savedIdCardTypes){
      for(let savedType of savedIdCardTypes){
        if(usableIdCardTypes.some(e => savedType === e)){
          return savedType;
        }
      }
    },
    getSavedIdCardTypes:function(passenger){
      var savedIdCardTypes = [];
      var savedFields = [];
      for(let key in passenger){
              if ((/^[0-9]*$/).test(key)) {
                  savedIdCardTypes.push(key);
              }else{
                savedFields.push(key);
              }
          }
          return [savedIdCardTypes,savedFields];
    },
    onItemClick:function(options){
      var passenger = options.currentTarget.dataset.item
      if (passenger && passenger.viewModel.isMatch && !passenger.isAlreadySelected) {
        var currentPages = getCurrentPages(),
            lastPage = currentPages[currentPages.length-2];
            lastPage.setData({
              selectedPassenger:passenger
            })
        api.Navigate.back();
      }
    },
    onAddClick: function(){
      var params = "itemList=" + encodeURIComponent(JSON.stringify(this.data.itemList)) + "&idCardTypeList=" + encodeURIComponent(JSON.stringify(this.data.idCardTypeList)) + "&frompassengerlist=1";
      if (this.data.selectedPassengerList && this.data.selectedPassengerList.length>0) {
        params = params + '&selectedPassengerList='+encodeURIComponent(JSON.stringify(this.data.selectedPassengerList));
      }
      if (!util.isEmptyObject(this.data.currPassenger)) {
        params = params + '&currPassenger='+encodeURIComponent(JSON.stringify(this.data.currPassenger));
      }
      api.Navigate.redirectTo({
        url: '../editPassenger/editPassenger?'+params
      });
    },
    onModifyClick:function(options){
      var param = "itemList=" + encodeURIComponent(JSON.stringify(this.data.itemList)) + "&idCardTypeList=" + encodeURIComponent(JSON.stringify(this.data.idCardTypeList)) + "&passenger=" + encodeURIComponent(JSON.stringify(options.currentTarget.dataset.passenger||{})) + "&frompassengerlist=1";
      if (this.data.selectedPassengerList && this.data.selectedPassengerList.length>0) {
        param = param + '&selectedPassengerList='+encodeURIComponent(JSON.stringify(this.data.selectedPassengerList));
      }
      if (!util.isEmptyObject(this.data.currPassenger)) {
        param = param + '&currPassenger='+encodeURIComponent(JSON.stringify(this.data.currPassenger));
      }
      api.Navigate.redirectTo({
        url:'../editPassenger/editPassenger?'+param
      })
    }
  });
})(__overwrite.require(require, __dirname), __overwrite.Page);