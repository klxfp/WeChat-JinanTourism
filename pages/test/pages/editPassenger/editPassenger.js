var __dirname = "pages/editPassenger";
var __overwrite = require("../../utils/overwrite.js");
var DIALOG_TITLE_CARD = "请选择证件类型";
var DIALOG_TITLE_NAME = "请选择姓名类型";
var NAME_TYPES = [
  { 
    name: "姓名(中文)", 
    type: "cName", 
    canSwitch: true,
    hint:"需与证件上的姓名一致"
  }, 
  { 
    name: "名(英文)", 
    type: "firstName", 
    canSwitch: true,
    hint:"First Name,如MEIMEI"
  }, 
  { 
    name: "姓(英文)", 
    type: "lastName",
    hint:"Last Name,如HAN"
  }];
var HINT = {
  cName: "需与证件上的姓名一致",
  firstName: "First Name,如MEIMEI",
  lastName: "Last Name,如HAN",
  mobile: "接受确认短信"
};
var valueIpt = '';
var passenger = {};
var valueType = '';
var saveItem = {};

(function (require, Page) {
  var api = require("../../utils/api.js")(__dirname),
    util = require("../../utils/util.js"),
    passengerDao = require("../passengerList/dao.js"),
    checkId = require("../../utils/verifier.js");
  Page({
    data: {
      itemList: [],//转化之后的item list
      pickIndex:0,
      pickIndex1:0,
      frompassengerlist:0,
    },
    onLoad: function (options) {
      valueType = ''
      saveItem = {}
      __wxConfig.debug && console.log("editPassenger options = ", options)
      var itemList = options.itemList ? JSON.parse(decodeURIComponent(options.itemList)) : [],
          idCardTypeList =  options.idCardTypeList ? JSON.parse(decodeURIComponent(options.idCardTypeList)) : [];
          passenger = options.passenger ? JSON.parse(decodeURIComponent(options.passenger)) : {};//要更改的passenger
      this.setData({
        templateItemList:itemList,
        templateIdCardTypeList:idCardTypeList,
        frompassengerlist:options.frompassengerlist||0,
        itemList: this.convertToViewModel(itemList, idCardTypeList, passenger),
        selectedPassengerList: options.selectedPassengerList && JSON.parse(decodeURIComponent(options.selectedPassengerList)),
        currPassenger: options.currPassenger && JSON.parse(decodeURIComponent(options.currPassenger)),
      });
    },
    onLabelClick: function (options) {
      var type = options.currentTarget.dataset.type,//当前item 类型
          canSwitch = options.currentTarget.dataset.can, //是否可以切换
          index = options.detail.value;//选择的index
      __wxConfig.debug && console.log("switchType options = ", options)
      if (canSwitch && index>=0) {
        this.switchType(type, index);
      }
    },
    switchType: function (type, index) {
      if (type == 'cName' || type == 'firstName') {
        this.onNameTypeChange(index);
      } else {
        this.onIdCardTypeChange(index);
      }
    },
    onDeleteClick: function () {
      var result = passengerDao.delete(this.passenger);
      if (result) {
        api.Navigate.back();
      } else {
        api.showToast({
          title: '删除失败，请重试...'
        })
      }
    },
    onIdCardTypeChange: function (index) {
      var value = this.data.templateIdCardTypeList[index];
      __wxConfig.debug && console.log("onIdCardTypeChange index = ", index)
      __wxConfig.debug && console.log("onIdCardTypeChange value = ", value)
      value.canSwitch = true;
      if (this.passenger && this.passenger.hasOwnProperty(value.type)) {
        value.value = this.passenger[value.type] || "";
      }
      this.data.itemList.splice(this.data.itemList.length - 1, 1, value);
      this.setData({
        itemList: this.data.itemList//this.convertToViewModel(this.data.itemList, this.data.templateIdCardTypeList, passenger),
      });
    },
    onNameTypeChange: function (index, value) {
      __wxConfig.debug && console.log("editPassenger onNameTypeChange index = ", index)
      var newItemList = this.data.itemList.filter(item => !(/name$/).test(item.type.toLowerCase()));
      if (index == 0) { 
        //切换中文
        let item = NAME_TYPES[0];
        item.canSwitch = true;
        item.selectTitle = "姓名类型";
        item.selectIndex = 0;
        item.selectItemList = [];
        item.selectItemList.push("中文名");
        item.selectItemList.push("英文名");
        if (this.passenger && this.passenger.hasOwnProperty('cName')) {
          item.value = this.passenger["cName"] || "";
        }
        newItemList.unshift(item);
      } else {
        //切换英文
        let item1 = NAME_TYPES[1];
        let item2 = NAME_TYPES[2];
        item1.canSwitch = true;
        item1.selectTitle = "姓名类型";
        item1.selectIndex = 1;
        item1.selectItemList = [];
        item1.selectItemList.push("中文名");
        item1.selectItemList.push("英文名");
        if (this.passenger && this.passenger.hasOwnProperty('firstName')) {
          item1.value = this.passenger["firstName"] || "";
        }
        if (this.passenger && this.passenger.hasOwnProperty('lastName')) {
          item2.value = this.passenger["lastName"] || "";
        }
        newItemList.splice(0, 0, item1, item2);
      }
      __wxConfig.debug && console.log("editPassenger onNameTypeChange newItemList = ", newItemList)
      this.setData({
        itemList: newItemList//this.convertToViewModel(newItemList, this.data.templateIdCardTypeList, passenger),
      });
    },
    convertToViewModel: function (itemList, idCardTypeList, passenger) {
      var cardInfoKey = [];
      itemList = itemList.map(function (item) {
        if (item.type == "name") {
          item = NAME_TYPES[0];
          item.value = passenger ? passenger[NAME_TYPES[0].type] : '';
          item.canSwitch = true;
          item.selectTitle = "姓名类型";
          item.selectIndex = 0;
          item.selectItemList = [];
          item.selectItemList.push("中文名");
          item.selectItemList.push("英文名");
          return item;
        } else {
          item.value = passenger ? passenger[item.type] : '';
          return item;
        }
      });
      var eNameIndex = itemList.findIndex(function (item) { return item.type == "eName" });
      if (eNameIndex > -1) {
        let item1 = NAME_TYPES[1];
        let item2 = NAME_TYPES[2];
        if (passenger && passenger.hasOwnProperty('firstName')) {
          item1.value = passenger["firstName"] || "";
        }
        if (passenger && passenger.hasOwnProperty('lastName')) {
          item2.value = passenger["lastName"] || "";
        }
        item1.canSwitch = false;
        itemList.splice(eNameIndex, 1, item1, item2);
      }
      for (var key in passenger) {
        if ((/^[0-9]*$/).test(key)) {
          cardInfoKey.push(key);
        }
      }
      if (idCardTypeList.length) {
        var card = idCardTypeList[0];
        if (cardInfoKey.length) {
          for (var item of cardInfoKey) {
            var index = idCardTypeList.findIndex(function (e) { return e.type == item });
            if (index > -1) {
              card = idCardTypeList[index];
              card.value = passenger[item];
              break;
            }
          }
        }
        card.selectItemList = [];
        if(idCardTypeList.length > 1) {
          card.selectIndex = 0;
          card.selectTitle = "证件类型";
          idCardTypeList && idCardTypeList.map(function(idcard){
            if(idcard && util.isTxtNotEmpty(idcard.name)) {
              card.selectItemList.push(idcard.name)
            }
          });
        }
        card.canSwitch = card.selectItemList.length>1;
        __wxConfig.debug && console.log('editPassenger convertToViewModel card', card);
        itemList.push(card);
      }
      __wxConfig.debug && console.log('editPassenger convertToViewModel itemList = ', itemList);
      itemList.map(function (item) {
        switch (item.type) {
          case "cName":
            item.hint = HINT['cName'];
            break
          case "mobile":
            item.hint = HINT['mobile'];
            break
          case "firstName":
            item.hint = HINT['firstName']
            break
          case "lastName":
            item.hint = HINT['lastName'];
            break;
          default:
            item.hint = '请输入';
            break;
        }
        if(!util.isTxtNotEmpty(saveItem[item.type]) && util.isTxtNotEmpty(item.value)) {
          saveItem[item.type] = item.value;
        }
        __wxConfig.debug && console.log("editPassenger convertToViewModel saveItem = ", saveItem)
      });
      return itemList;
    },
    onInput: function (e) {
      valueType = e.currentTarget.dataset["type"];
      valueIpt = e.detail.value.replace(' ','');
      __wxConfig.debug && console.log('valueIpt', valueIpt);
      saveItem[valueType] = valueIpt;
      __wxConfig.debug && console.log('saveItem', saveItem);
    },
    onSaveClick() {
      var passengerContent = {}, _this = this, _api = api;
      var isComplete = true;
      var isInputOk = true;
      __wxConfig.debug && console.log("editPassenger onSaveClick saveItem = ", saveItem)
      __wxConfig.debug && console.log("editPassenger onSaveClick itemList = ", this.data.itemList)
      for (var item of this.data.itemList) {
        var value = saveItem[item.type];
        if (value) {
          passengerContent[item.type] = value;
        } else {
          isComplete = false;
        }
        if (item.type == 'mobile') {
          isInputOk = checkId.checkPhoneNum(value);
        }
        if (item.type == 1) {
          isInputOk = checkId.checkIdCard(value);
        }
      }
      if (isComplete && isInputOk) {
        let hasCard = false;//是否已经填写过证件信息
        for (var key in passengerContent) {
          if ((/^\d/).test(key)) {
            hasCard = true;
            break;
          }
        }
        if (passenger) {//props中有passenger说明是编辑，则进行合并
          for (var key in passenger) {
            if ((/^\d/).test(key) && hasCard) {
              delete passenger[key];
            }
          }
          passengerContent = Object.assign({}, passenger, passengerContent);
        }
        __wxConfig.debug && console.log('passengerContent', passengerContent);
        var callback_afterSaveData = function(){
          __wxConfig.debug && console.log("passengerlist callback afterSaveData frompassengerlist = ", _this.data.frompassengerlist)
          if(_this.data.frompassengerlist == 1) {
            var params = 'itemList='+ encodeURIComponent(JSON.stringify(_this.data.templateItemList))+'&idCardTypeList='+ encodeURIComponent(JSON.stringify(_this.data.templateIdCardTypeList));
            if (_this.data.selectedPassengerList&&_this.data.selectedPassengerList.length>0) {
              params = params + '&selectedPassengerList='+encodeURIComponent(JSON.stringify(_this.data.selectedPassengerList));
            }
            if (!util.isEmptyObject(_this.data.currPassenger)) {
              params = params + '&currPassenger='+encodeURIComponent(JSON.stringify(_this.data.currPassenger));
            }
            _api.Navigate.redirectTo({
              url:'../passengerList/passengerList?' + params
              });
          } else {
            //当前没有常旅, 返回填单页并回显数据
            var currentPages = getCurrentPages(),
              lastPage = currentPages[currentPages.length-2];
              lastPage.setData({
                selectedPassenger:passengerContent
              })
            api.Navigate.back();
          }
        }
        if (passenger.timeStamp) {
          //对已有的常旅item的修改
          passengerDao.update(passengerContent, callback_afterSaveData);
        } else {
          //新增常旅
          api.Storage.set({ key: "ticket-selected-passenger", data: passengerContent });
          passengerDao.insert(passengerContent, callback_afterSaveData);
        }
      } else {
        api.showToast({
          title: '请输入正确内容'
        })
      }
    }
  });
})(__overwrite.require(require, __dirname), __overwrite.Page);