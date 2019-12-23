// pages/fillinorder/fillinorder.jsvar __dirname = "pages/index";
var __dirname = "pages/fillinorder";
var __overwrite = require("../../utils/overwrite.js");
var CONTACT_DATA_KEY = "ticket_contact_data";

(function(require, Page) {
   var api = require("utils/api")(__dirname),
    token = require('utils/token'),
    PassengerDao = require('pages/passengerList/dao'),
    Util = require('utils/util'),
    CalendarPlugin = require('components/calendar/index'),
    FillInOrderService = require('service/fillinorder');
    var app = getApp();
    var mTotalCostPrice = 0, mTotalPrice = 0;
    var mGorderId="", mOrderId = "";
    Page({
      data:{
          sceneryId:"",//景点id
          sceneryTitle:"",//景点名字
          ticketIdList:[],
          ticketId:"",//资源id
          testTicketId:"32584",//生产,附加信息-中英切换:31682, 生产:出行人:31798
          resourceFillInInfos:[],//动态模板集合
          contactTemplate:{},//联系人模板
          contactValue:{},
          contactEmailNeed:false,
          currentBookTicketType:"",//门票类型描述：如：成人票、学生票...
          isSaleAlone:false,//是否为单售资源
          firstTicketPayPrice:0,
          firstTicketCostPrice:0,
          firstTravelDate:"",
          calendarData:{},
          address:{},
          isPassengersEmpty:true,
          passengerSelect:{
            "resourceIndex":-1,
            "passengerIndex":-1,
            "chooseContact":false,
            "itemList":[],
            "idCardTypeList":[],
          },
          expandInfoSelect:{
            "resourceIndex":-1,
            "expandInfoTypeId":-1,
          },
          receiveInfoSelect:{
            "resourceIndex":-1,
          },
          totalPrice:0,//支付价格payPrice
          totalCostPrice:0,//成本价格
          totalMarketPrice:0,//市场价,暂时不用
          totalTickets:0,//总的购买数量,暂时只有一种资源类型一次购买
          isShowListDialog:false,//是否展示中英文切换,证件切换等弹框
          isOrderFillInVerify:false,//提交订单,验证.控制是否显示warning
          scrollHeight:667,
          showFeeDetail:false,
          showBuyRules:false,
          rulePopHeight:667,
      },
      onLoad:function(options){
        // 页面初始化 options为页面跳转所带来的参数
        __wxConfig.debug && console.log("fillInOrder options = ", options)
        mGorderId = "", mOrderId = "";
        mTotalCostPrice = 0, mTotalPrice = 0;
        var _this = this, tempHeight, tempScreenWidth;
        var systemInfo = getApp().getAppSystemInfo()
        tempHeight = systemInfo.windowHeight
        tempScreenWidth = systemInfo.windowWidth
        this.data.rulePopHeight = tempHeight -80
        this.setData({
          sceneryId: decodeURIComponent(options.sceneryId)||"",//景点id
          sceneryTitle:decodeURIComponent(options.sceneryTitle)||"",//景点名字
          ticketId:decodeURIComponent(options.ticketId)||"",//资源id
          currentBookTicketType:decodeURIComponent(options.currentBookTicketType)||"",//门票类型描述：如：成人票、学生票...
          isSaleAlone:decodeURIComponent(options.isSaleAlone) == "true" ? true : false,//true,//todo !!!是否为单售资源--本迭代只做一个资源
          firstTicketPayPrice:decodeURIComponent(options.ticketPayPrice),
          firstTicketCostPrice:decodeURIComponent(options.ticketCostPrice),
          travelDate:decodeURIComponent(options.travelDate||''),
          calendarData:JSON.parse(decodeURIComponent(options.calendarData||{})),
          address:decodeURIComponent(options.address),
          scrollHeight:tempHeight,
          rulePopHeight:this.data.rulePopHeight
        });
        if(Util.isTxtNotEmpty(options.ticketId)) {
          this.data.ticketIdList.push(options.ticketId);
          this.loadFillInData();
        }
      },
      /*
      *请求填单页数据
      */
      loadFillInData:function(){
        //读取本地出行人信息
        var _this = this
        this.updatePassengerEmptyState();
        FillInOrderService.GetDynamicFormTemplate(this.data.ticketIdList).then(function(data){
          __wxConfig.debug && console.log('loadFillInData responseData= ', data);
          if (data && data.data) {
            var tempResourceFillInInfos = _this.formateResourceItemList(data.data.resourceFillInInfos);
            if(tempResourceFillInInfos && tempResourceFillInInfos.length>0) {
              if(!isNaN(_this.data.costPrice)) {
                tempResourceFillInInfos[0].costPrice = _this.data.costPrice
              }
              if(!isNaN(_this.data.payPrice)) {
                tempResourceFillInInfos[0].payPrice = _this.data.payPrice
                tempResourceFillInInfos[0].showPayPrice = Util.formatePrice(_this.data.payPrice)
              }
              if(Util.isTxtNotEmpty(_this.data.travelDate)){
                tempResourceFillInInfos[0].travelDate = _this.data.travelDate
                tempResourceFillInInfos[0].showTravelDate = _this.getWeekOfDate(_this.data.travelDate)
              }
              _this.calculateTotalPrice(tempResourceFillInInfos[0]);
              _this.formateExpandInfo();
            }
            _this.setData({
              showTotalPrice:Util.formatePrice(mTotalPrice),
              totalPrice:mTotalPrice,
              totalCostPrice:mTotalCostPrice,
              resourceFillInInfos:tempResourceFillInInfos,//动态模板集合,payPrcieValue,purchaseNumValue
              contactTemplate:data.data.contactTemplate||{},//联系人模板
              contactNewItemList:_this.formateContactItemList(data.data.contactTemplate),//联系人itemlist
              // contactValue:this.data.contactValue,
            });
            __wxConfig.debug && console.log("fillInOrder data = ", _this.data)
          }
        }.bind(this));
      },
      calculateTotalPrice:function(resourceFillInInfo){
        if(!isNaN(resourceFillInInfo.costPrice) && resourceFillInInfo.costPrice>=0) {
          mTotalCostPrice = Util.accMul(Number(resourceFillInInfo.ticketNum||1),resourceFillInInfo.costPrice);
        }
        if(!isNaN(resourceFillInInfo.payPrice) && resourceFillInInfo.payPrice>=0) {
          mTotalPrice = Util.accMul(Number(resourceFillInInfo.ticketNum||1),resourceFillInInfo.payPrice);
        }
      },
      updatePassengerEmptyState:function(){
        var _this = this
        PassengerDao.findAll(function(localPassengers){
          __wxConfig.debug && console.log("fillInOrder updatePassengerEmptyState localPassengers = ",localPassengers);
          _this.setData({
            isPassengersEmpty:!localPassengers || localPassengers.length==0
          });
          _this.getContactData();
        });
      },
      //对联系人信息条目排序处理:名字，电话，证件,邮箱
      formateContactItemList:function(contactTemplate){
        if(Util.isEmptyObject(contactTemplate)) {
          return []
        }
        //type: cName、eName、name、mobile、email, 证件
        var nameType = "", mobile = "", email = "", idCard = "";
        var itemList=[];
        var _names = [];
        var _viewTypeList = [];
        var typeRequiredMap = [];//{item:{type:required}}
        var itemContainCName = false, itemContainEName = false, itemCNameRequred = false,
        itemENameRequred= false, itemContainName= false, itemContainMobile= false,itemContainEmail=false;
        if (contactTemplate.itemList && contactTemplate.itemList.length>0) {
            for (var i = 0; i < contactTemplate.itemList.length; i++) {
              var item = contactTemplate.itemList[i];
              if (item && item.type && item.name) {
                  if (item.type == "email") {
                    itemContainEmail = true;
                    this.data.contactEmailNeed = item.required == "0";
                  }
                  if (item.type == "cName") {
                    itemContainCName = true;
                    itemCNameRequred = item.required == "0"
                  }
                  if (item.type == "eName") {
                    itemContainEName = true;
                    itemENameRequred = item.required == "0"
                  }
                  if (item.type == "name") {
                    itemContainName = true;
                  }
                  if (item.type == "mobile") {
                    itemContainMobile = true;
                  }
                  __wxConfig.debug && console.log("formateItemList ", "name = " + item.name + ", type = " + item.type + ", requred = " + item.required);
              }
            }
        }
        if (itemContainCName && itemContainEName && itemCNameRequred && itemENameRequred) {
            //中英文都要
            nameType = "c_e_name";
            _names.push("ch_name");
            _names.push("en_last_name");
            _names.push("en_first_name");
        } else {
            if (itemContainCName) {
                //只有中文名字
                nameType = "cName";
                _names.push("ch_name");
            } else if (itemContainEName) {
                //只有英文名字
                nameType = "eName";
                _names.push("en_last_name");
                _names.push("en_first_name");
            } else if (itemContainName) {
                nameType = "name";
                //中英切换
                if (this.data.contactValue && "1" == this.data.contactValue.ch_en_type){
                    _names.push("ch_en_last_name");
                    _names.push("ch_en_first_name");
                } else {
                    _names.push("ch_en_first_name");
                }
            }
        }
        __wxConfig.debug && console.log("formateItemList names = ", _names);
        __wxConfig.debug && console.log("formateItemList nameType = ", nameType);
        if (itemContainMobile) {
            mobile = "mobile";
        }
        if (itemContainEmail) {
            email = "email";
        }
        if (contactTemplate.idCardTypeList && contactTemplate.idCardTypeList.length > 0) {
            idCard = "idCard";
        }
        if (nameType && ""!==nameType) {
            __wxConfig.debug && console.log("formateItemList isPassengersEmpty = ", this.data.isPassengersEmpty);
            if (!this.data.isPassengersEmpty) {
                _viewTypeList.push("name");//出行人不空,只读的名字，选择
            } else {
              for (var i = 0; i < _names.length; i++) {
                _viewTypeList.push(_names[i]);
              }
            }
        }
        if (mobile && ""!==mobile) {
            _viewTypeList.push(mobile);
        }
        if (idCard && ""!==idCard) {
            _viewTypeList.push(idCard);
        }
        if (email && ""!=email) {
            _viewTypeList.push(email);
        }
        __wxConfig.debug && console.log("formateItemList _viewTypeList = ", _viewTypeList);
        var _newItemList = [];
        for (var i = 0; i < _viewTypeList.length; i++) {
          var itemContainValue = this.getItemTitleLabelHintValue(contactTemplate, _viewTypeList[i]);
          _newItemList.push(itemContainValue);
        }
        this.setData({
          contactViewTypeList:_viewTypeList,
          // contactNewItemList:_newItemList,
          contactItemNames:_names,
        });
        __wxConfig.debug && console.log("formateItemList  _newItemList = ", _newItemList);
        return _newItemList
      },
      //获取条目左侧展示标题 item 为typeStr:name 等
      getItemTitleLabelHintValue:function(contactTemplate, item){
        __wxConfig.debug && console.log("getItemTitleLabelHintValue item = ", item);
        //显示顺序：邮箱，姓名，证件，手机
        //ch_name, en_first_name, en_last_name 中英文都要，
        //ch_name 只中文
        //en_first_name, en_last_name 只英文
        //ch_en_first_name, ch_en_last_name 中英切换
        var newItem = {
            "inputValue":[],
            "typStr":"",
            "type":"",
            "title":"",
            "hint":"",
            "inputType":"",
            "leftIcon":"",
            "rightIcon":"",
            "selectIndex":-1,
            "warningTxt":"",
            "maxLength":200,//中文姓名:27,地址:200,mobile:11,idcard:18
            "selectItemList":[],//中英文切换,证件切换等数据集合
            "selectTitle":"",//中英文切换,证件切换等弹框标题
        };
        newItem.inputValue[0]="";
        newItem.readOnly = false;
        newItem.inputType = "text";
        if (item && ""!==item) {
          newItem.typStr = ""+item;
          if (item == "name") {
            newItem.title = "姓名";
            if (!this.data.isPassengersEmpty) {
              newItem.hint = "点击选择联系人";
              newItem.rightIcon = "ar";
              newItem.readOnly = true;
            } else {
              newItem.hint = "需与证件上姓名一致";
            }
            //获取数据
            if (this.data.contactValue) {
              if ((Util.isStrInArray(this.data.contactItemNames, "ch_name")||Util.isStrInArray(this.data.contactItemNames,"ch_en_first_name")) && Util.isTxtNotEmpty(this.data.contactValue.cName)
                &&Util.isHanZi(this.data.contactValue.cName)&&!Util.hasKongGe(this.data.contactValue.cName)) {
                if (newItem.inputValue.length==1 && newItem.inputValue[0]=="") {
                  newItem.inputValue[0]=this.data.contactValue.cName;
                } else {
                  newItem.inputValue.push(this.data.contactValue.cName);
                }
              }
              if (Util.isStrInArray(this.data.contactItemNames, "en_last_name")||Util.isStrInArray(this.data.contactItemNames, "ch_en_first_name")) {
                if (Util.isTxtNotEmpty(this.data.contactValue.eName) && Util.isEnChar(this.data.contactValue.eName)&&
                    !Util.hasKongGe(this.data.contactValue.eName)) {
                  if (newItem.inputValue.length==1 && newItem.inputValue[0]=="") {
                    newItem.inputValue[0]=this.data.contactValue.eName;
                  } else {
                    newItem.inputValue.push(this.data.contactValue.eName);
                  }
                } else {
                  if (Util.isTxtNotEmpty(this.data.contactValue.firstName) && Util.isTxtNotEmpty(this.data.contactValue.lastName)&&
                    !Util.hasKongGe(this.data.contactValue.firstName)&&!Util.hasKongGe(this.data.contactValue.lastName)&&
                    Util.isEnChar(this.data.contactValue.firstName)&&Util.isEnChar(this.data.contactValue.lastName)) {
                    var tempName = this.data.contactValue.firstName+ " " + this.data.contactValue.lastName;
                    if (newItem.inputValue.length==1 && newItem.inputValue[0]=="") {
                      newItem.inputValue[0]=tempName;
                    } else {
                      newItem.inputValue.push(tempName);
                    }
                  }
                }
              }
              if (!Util.isTxtNotEmpty(newItem.inputValue[0]) && Util.isTxtNotEmpty(this.data.contactValue.name)&&
                !Util.hasKongGe(this.data.contactValue.name)) {
                if (newItem.inputValue.length==1 && newItem.inputValue[0]=="") {
                  newItem.inputValue[0]=this.data.contactValue.name;
                } else {
                  newItem.inputValue.push(this.data.contactValue.name);
                }
              }
            }
            newItem.warningTxt = "姓名不能为空";
          } else if (item == "ch_name") {
              newItem.title = "姓名 (中文)";
              newItem.hint = "需与证件上姓名一致";
              newItem.maxLength = 27;
              newItem.warningTxt = "请填写姓名, 如韩美美";
              if (this.data.isOrderFillInVerify) {
                if (Util.isTxtNotEmpty(this.data.contactValue.cName)) {
                  if (this.data.contactValue.cName.length<2||Util.hasKongGe(this.data.contactValue.cName)||
                    !Util.isHanZi(this.data.contactValue.cName)) {
                    newItem.warningTxt = "姓名应在2~27个字以内，且不包含数字和标点符号";
                    this.data.contactValue.cName = "";
                  }
                  newItem.inputValue[0] = this.data.contactValue.cName;
                }
              } else {
                if (Util.isTxtNotEmpty(this.data.contactValue.cName)) {
                  newItem.inputValue[0] = this.data.contactValue.cName;
                }
              }
          } else if (item == "en_first_name") {
              newItem.title = "名 (英文)";
              newItem.hint = "First Name, 如 MEIMEI";
              newItem.warningTxt = "请填写名, 如MEIMEI";
              if (Util.isTxtNotEmpty(this.data.contactValue.firstName)) {
                if (this.data.isOrderFillInVerify) {
                  if (Util.hasKongGe(this.data.contactValue.firstName)||
                  !Util.isEnChar(this.data.contactValue.firstName)) {
                    this.data.contactValue.firstName = "";
                  }
                }
                newItem.inputValue[0] = this.data.contactValue.firstName;
              }
          } else if (item == "en_last_name") {
              newItem.title = "姓 (英文)";
              newItem.hint = "Last Name, 如 HAN";
              newItem.warningTxt = "请填写姓, 如Han";
              if (Util.isTxtNotEmpty(this.data.contactValue.lastName)) {
                if (this.data.isOrderFillInVerify) {
                  if (Util.hasKongGe(this.data.contactValue.lastName)||
                  !Util.isEnChar(this.data.contactValue.lastName)) {
                    this.data.contactValue.lastName = "";
                  }
                }
                newItem.inputValue[0] = this.data.contactValue.lastName;
              }
          } else if (item == "ch_en_first_name") {
            if (this.data.contactValue && this.data.contactValue.ch_en_type == "1") {
              newItem.title = "名 (英文)";
              newItem.hint = "First Name, 如 MEIMEI";
              newItem.warningTxt = "请填写名, 如MEIMEI";
              if (Util.isTxtNotEmpty(this.data.contactValue.firstName)) {
                if (this.data.isOrderFillInVerify) {
                  if (Util.hasKongGe(this.data.contactValue.firstName)||
                  !Util.isEnChar(this.data.contactValue.firstName)) {
                    this.data.contactValue.firstName = "";
                  }
                }
                newItem.inputValue[0] = this.data.contactValue.firstName;
              }
            } else {
              newItem.title = "姓名 (中文)";
              newItem.pickertype = "name";//picker 切换使用
              newItem.hint = "需与证件上姓名一致";
              newItem.warningTxt = "请填写姓名, 如韩美美";
              newItem.leftIcon = "ad";
              newItem.selectTitle = "姓名类型";
              newItem.selectItemList.push("中文名");
              newItem.selectItemList.push("英文名");
              newItem.maxLength = 27;
              newItem.selectIndex = this.data.contactValue && this.data.contactValue.ch_en_type>=0 ? this.data.contactValue.ch_en_type:0;
              if (this.data.isOrderFillInVerify) {
                if (Util.isTxtNotEmpty(this.data.contactValue.cName)) {
                  if (this.data.contactValue.cName.length<2||Util.hasKongGe(this.data.contactValue.cName)||
                    !Util.isHanZi(this.data.contactValue.cName)) {
                    newItem.warningTxt = "姓名应在2~27个字以内，且不包含数字和标点符号";
                    this.data.contactValue.cName = "";
                  }
                  newItem.inputValue[0] = this.data.contactValue.cName;
                }
              } else {
                if (Util.isTxtNotEmpty(this.data.contactValue.cName)) {
                  newItem.inputValue[0] = this.data.contactValue.cName;
                }
              }
            }
          } else if (item == "ch_en_last_name") {
              newItem.title = "姓 (英文)";
              newItem.pickertype = "name";//picker 切换使用
              newItem.hint = "Last Name, 如 HAN";
              if (this.data.contactValue && this.data.contactValue.ch_en_type == "1") {
                newItem.warningTxt = "请填写姓, 如Han";
                newItem.leftIcon = "ad";
                newItem.selectTitle = "姓名类型";
                newItem.selectItemList.push("中文名");
                newItem.selectItemList.push("英文名");
                newItem.selectIndex = this.data.contactValue.ch_en_type;
              } else {
                newItem.warningTxt = "请填写名, 如美美";
                newItem.maxLength = 27;
              }
              if (Util.isTxtNotEmpty(this.data.contactValue.lastName)) {
                if (this.data.isOrderFillInVerify) {
                  if (Util.hasKongGe(this.data.contactValue.lastName)||
                  !Util.isEnChar(this.data.contactValue.lastName)) {
                    this.data.contactValue.lastName = "";
                  }
                }
                newItem.inputValue[0] = this.data.contactValue.lastName;
              }
          }  else if (item == "email") {
            newItem.title = "邮箱";
            newItem.hint = this.data.contactEmailNeed ? "行程确认信息将发送到此邮箱" : "如在海外或无法接收短信, 建议填写";
            newItem.warningTxt = "请填写正确的邮箱";
            newItem.inputType = "text";
            if (this.data.isOrderFillInVerify && !Util.validateEmail(this.data.contactValue.email)) {
              this.data.contactValue.email = "";
            }
            if (this.data.contactValue && Util.isTxtNotEmpty(this.data.contactValue.email)) {
                newItem.inputValue[0] = this.data.contactValue.email;
            }
          } else if (item == "idCard") {
            var tempIdCardIndex = 0;
            for (var key in this.data.contactValue) {
              for (var i = 0; i < contactTemplate.idCardTypeList.length; i++) {
                var idCardItem = contactTemplate.idCardTypeList[i];
                if (key == idCardItem.type) {
                  //找到指定type的证件
                  tempIdCardIndex = i;
                  break;
                }
              }
            }
            if (this.data.contactValue && this.data.contactValue.id_card_index>=0) {
              var index = this.data.contactValue.id_card_index;
              var type = contactTemplate.idCardTypeList[index].type;
              newItem.title = contactTemplate.idCardTypeList[index].name;
              newItem.pickertype = "idcard";//picker 切换使用
              newItem.selectIndex = index;
              if (this.data.isOrderFillInVerify && type == "1") {
                //身份证, 长度校验
                if (Util.isTxtNotEmpty(this.data.contactValue[type]) && !Util.IdCardValidate(this.data.contactValue[type])) {
                  //不合法的身份证
                  this.data.contactValue[type] = "";
                }
              }
              newItem.inputValue[0] = this.data.contactValue[type]||"";
            } else {
              newItem.title = contactTemplate.idCardTypeList[tempIdCardIndex].name;
              newItem.selectIndex = tempIdCardIndex;
              var type = contactTemplate.idCardTypeList[tempIdCardIndex].type;
              if (this.data.isOrderFillInVerify && type == "1") {
                //身份证, 长度校验
                if (Util.isTxtNotEmpty(this.data.contactValue[type]) && !Util.IdCardValidate(this.data.contactValue[type])) {
                  //不合法的身份证
                  this.data.contactValue[type] = "";
                }
              }
              this.data.contactValue.id_card_index = tempIdCardIndex;
              newItem.inputValue[0] = this.data.contactValue[type]||"";
            }
            newItem.hint = "请输入, 不可为空";
            newItem.warningTxt = "请填写正确的证件号码";
            newItem.inputType = "text";
            newItem.maxLength = newItem.title == "身份证" ? 18 : 200;
            if (contactTemplate.idCardTypeList && contactTemplate.idCardTypeList.length>0) {
              for (var i = 0; i < contactTemplate.idCardTypeList.length; i++) {
                var idCardItem = contactTemplate.idCardTypeList[i];
                if (Util.isTxtNotEmpty(idCardItem.name)) {
                  newItem.selectItemList.push(idCardItem.name);
                }
              }
              if (newItem.selectItemList.length>1) {
                newItem.leftIcon = "ad";
                newItem.selectTitle = "证件类型";
                newItem.selectIndex = this.data.contactValue.id_card_index||0;
              }
            }
          } else if (item == "mobile") {
            newItem.title = "中国大陆(+86)";
            newItem.hint = "接收确认短信";
            newItem.selectIndex = 0;//TODO
            newItem.warningTxt = "请填写正确的手机号";
            newItem.inputType = "number";
            newItem.maxLength = 11;
            // newItem.rightIcon = "mobileUrl";//暂时不能访问通讯录
            if (this.data.isOrderFillInVerify) {
              if (this.data.contactValue && Util.isTxtNotEmpty(this.data.contactValue.mobile)) {
                if (this.data.contactValue.mobile.length<11||!Util.validatePhone(this.data.contactValue.mobile)) {
                  newItem.warningTxt = "手机号格式不正确";
                  this.data.contactValue.mobile = "";
                }
                newItem.inputValue[0] = this.data.contactValue.mobile;
              } else {
                  newItem.warningTxt = "手机号不能为空";
              }
            } else if (this.data.contactValue && Util.isTxtNotEmpty(this.data.contactValue.mobile)) {
              newItem.inputValue[0] = this.data.contactValue.mobile;
            }
          }
        }
        __wxConfig.debug && console.log("getItemTitleLabelHintValue newItem = ", newItem);
        return newItem;
      },
      /*
      * 判断出行人信息是否为空
      */
      isPassengerValueNotEmpty(item) {
        return item && item.passengerValue && item.passengerValue.title.length>0 && item.passengerValue.title[0]!="none"
        && item.passengerValue.content.length>0 && item.passengerValue.content[0]!="none";
      },
      //对资源条目进行转换模型处理
      formateResourceItemList:function(resourceFillInInfos){
        if (!resourceFillInInfos||resourceFillInInfos.length==0) {
          return [];
        }
        //新加资源
        var resourceFillInInfo = resourceFillInInfos[0];
        resourceFillInInfo.costPrice = 0;
        resourceFillInInfo.payPrice = 0;
        resourceFillInInfo.travelDate = "";
        resourceFillInInfo.isSetToContact = false;
        //设置标签
        var showTags = resourceFillInInfo.showTags;
        if (showTags&& showTags.length>0) {
          if (showTags.length == 1) {
            resourceFillInInfo.tag1 = showTags[0];
          } else {
            resourceFillInInfo.tag1 = showTags[0];
            resourceFillInInfo.tag2 = showTags[1];
          }
        }
        resourceFillInInfo.ticketNum = resourceFillInInfo.ticketNum||resourceFillInInfo.minPurchase;
        resourceFillInInfo.calendarItemDataList = [];
        if (resourceFillInInfo.expandInfos && resourceFillInInfo.expandInfos.length>0) {
          for (var j = 0; j < resourceFillInInfo.expandInfos.length; j++) {
            var item = resourceFillInInfo.expandInfos[j];
            if (item && (item.inputType == 1 || item.inputType == 2) && item.selectItemList.length>0) {
              //选择的附加信息
              for (var k = 0; k < item.selectItemList.length; k++) {
                var selectItem = item.selectItemList[k];
                selectItem.isSelected = false;
              }
            }
          }
        }
        //ticketType: A:每张一人、O:每单一人
        if (resourceFillInInfo.passengerTemplate) {
          resourceFillInInfo._passengerList = [];
          if (resourceFillInInfo.ticketType && resourceFillInInfo.ticketType == "O") {
            //一单一个出行人
            resourceFillInInfo._passengerList.push({
              "idCardTypeList":resourceFillInInfo.passengerTemplate.idCardTypeList||[],
              "itemList":resourceFillInInfo.passengerTemplate.itemList||[],
              "passengerValue":{
                "title":"",
                "content":"",
                "passenger":{},
                "isSetToContact":false,
              },
              isValueEmpty:true
            });
          } else{
            //一张一个出行人
            for (var i = 0; i < resourceFillInInfo.ticketNum; i++) {
              resourceFillInInfo._passengerList.push({
                "idCardTypeList":resourceFillInInfo.passengerTemplate.idCardTypeList||[],
                "itemList":resourceFillInInfo.passengerTemplate.itemList||[],
                "passengerValue":{
                  "title":"",
                  "content":"",
                  "passenger":{},
                  "isSetToContact":false,
                },
                isValueEmpty:true
              });
            }
          }
        }
        if(this.data.resourceFillInInfos.length == 0) {
          resourceFillInInfo.costPrice = this.data.firstTicketCostPrice||'';
          resourceFillInInfo.payPrice = this.data.firstTicketPayPrice||'';
          resourceFillInInfo.showPayPrice = Util.formatePrice(this.data.firstTicketPayPrice||'');
          resourceFillInInfo.travelDate = this.data.travelDate||'';
        }
        this.data.resourceFillInInfos.push(resourceFillInInfo);
        return this.data.resourceFillInInfos;
      },
      formateExpandInfo:function(){
        var expandInfos = this.data.resourceFillInInfos[0].expandInfos;
        var inputType5ExpandInfos = [];
        var inputType4ExpandInfos = [];
        var selected5Value = {
          "name":"",
          "nameId":"",
          "mobile":"",
          "mobileId":"",
          "address":"",
          "addressId":"",
        };
        //收获信息选择内容
        var type5IdList = [];
        var newExpandInfos = [];
        var expandInfo5 = {};//有数据的expandinfo
        if (expandInfos && expandInfos.length>0) {
          for (var i = 0; i < expandInfos.length; i++) {
            var expandInfo = expandInfos[i];
            if (expandInfo && expandInfo.inputType != 3) {
              //1单选框 2复选框 3下拉框 4输入框 5地址, 下拉框不做过滤掉.
              expandInfo.view_inputLength = "200";
              expandInfo.warningTxt = "请选择";
              expandInfo.view_showArrowIcon = true;
              if (expandInfo.inputType==5) {
                //设置input:输入类型,长度
                if (expandInfo.typeDesc == "收件人姓名") {
                  expandInfo.view_inputType = "text";
                  expandInfo.view_inputLength = "27";
                  expandInfo.view_inputHint = "请填写";
                  expandInfo.view_showArrowIcon = false;
                  selected5Value.nameId=expandInfo.typeId;
                  selected5Value.name = expandInfo.expandInfoValue;
                  if (this.data.isOrderFillInVerify) {
                    if (Util.isTxtNotEmpty(expandInfo.expandInfoValue)) {
                      if (expandInfo.expandInfoValue.length<2||Util.hasKongGe(expandInfo.expandInfoValue) ||!Util.isHanZi(expandInfo.expandInfoValue)) {
                        expandInfo.view_inputHint = "姓名应在2~27个字以内，且不包含数字和标点符号";
                        expandInfo.expandInfoValue = "";
                      }
                    }
                  }
                  inputType5ExpandInfos.push(expandInfo);
                } else if (expandInfo.typeDesc == "收件人手机号") {
                  expandInfo.view_inputType = "number";
                  expandInfo.view_inputLength = "11";
                  expandInfo.view_inputHint = "请填写11位手机号";
                  expandInfo.view_showArrowIcon = false;
                  selected5Value.mobileId=expandInfo.typeId;
                  selected5Value.mobile = expandInfo.expandInfoValue;
                  if (this.data.isOrderFillInVerify) {
                    if (Util.isTxtNotEmpty(expandInfo.expandInfoValue)) {
                      if (expandInfo.expandInfoValue.length<11||!Util.validatePhone(expandInfo.expandInfoValue)) {
                        expandInfo.view_inputHint = "手机号格式不正确";
                        expandInfo.expandInfoValue = "";
                      }
                    } else {
                        expandInfo.view_inputHint = "手机号不能为空";
                    }
                  }
                  inputType5ExpandInfos.push(expandInfo);
                } else if (expandInfo.typeDesc == "邮寄地址") {
                  expandInfo.view_inputType = "text";
                  expandInfo.view_inputHint = "请填写";
                  expandInfo.view_showArrowIcon = false;
                  selected5Value.addressId=expandInfo.typeId;
                  selected5Value.address = expandInfo.expandInfoValue;
                  inputType5ExpandInfos.push(expandInfo);
                } else if (expandInfo.typeDesc == "收货信息") {
                  //收件人姓名,收件人手机号,邮寄地址,更新数据
                  if (expandInfo.selected5Value) {
                    if (Util.isTxtNotEmpty(expandInfo.selected5Value.name)) {
                      if (expandInfo.selectedItemList.length==1 && selectedItemList[0]=="") {
                        expandInfo.selectedItemList[0]=expandInfo.selected5Value.name;
                      } else {
                        expandInfo.selectedItemList.push(expandInfo.selected5Value.name);
                      }
                    }
                    if (Util.isTxtNotEmpty(expandInfo.selected5Value.mobile)) {
                      if (expandInfo.selectedItemList.length==1 && selectedItemList[0]=="") {
                        expandInfo.selectedItemList[0]=expandInfo.selected5Value.mobile;
                      } else {
                        expandInfo.selectedItemList.push(expandInfo.selected5Value.mobile);
                      }
                    }
                    if (Util.isTxtNotEmpty(expandInfo.selected5Value.address)) {
                      if (expandInfo.selectedItemList.length==1 && selectedItemList[0]=="") {
                        expandInfo.selectedItemList[0]=expandInfo.selected5Value.address;
                      } else {
                        expandInfo.selectedItemList.push(expandInfo.selected5Value.address);
                      }
                    }
                  }
                  if (this.data.isOrderFillInVerify && expandInfo.selectedItemList.length!=3) {
                    expandInfo.warningTxt = "信息不完整:姓名,手机号,邮寄地址";
                  }
                  newExpandInfos.push(expandInfo);
                }
              } else {
                if (expandInfo.inputType==4) {
                  //输入框
                  expandInfo.view_inputType = "text";
                  expandInfo.view_inputHint = "请填写";
                  expandInfo.view_showArrowIcon = false;
                  inputType4ExpandInfos.push(expandInfo);
                } else if (expandInfo.inputType == 1 || expandInfo.inputType == 2) {
                  expandInfo.selectedItemList = [];
                  expandInfo.selectedItemList.push("");
                  for (var k = 0; k < expandInfo.selectItemList.length; k++) {
                    var selectItem = expandInfo.selectItemList[k];
                    if (selectItem.isSelected && selectItem.itemDesc != "") {
                      if (expandInfo.selectedItemList.length == 1 && expandInfo.selectedItemList[0]=="") {
                        expandInfo.selectedItemList[0]= selectItem.itemDesc;
                      } else {
                        expandInfo.selectedItemList.push(selectItem.itemDesc);
                      }
                    }
                  }
                  newExpandInfos.push(expandInfo);
                }
              }
            }
          }
        }
        if (this.data.isPassengersEmpty) {
          if (inputType4ExpandInfos.length > 0) {
            for (var i = 0; i < inputType4ExpandInfos.length; i++) {
              newExpandInfos.push(inputType4ExpandInfos[i]);
            }
          }
          if (inputType5ExpandInfos.length>0) {
            for (var i = 0; i < inputType5ExpandInfos.length; i++) {
              newExpandInfos.push(inputType5ExpandInfos[i]);
            }
          }
        } else {
          if (inputType5ExpandInfos.length>0) {
            //收件人姓名,收件人手机号,邮寄地址
            var receiveExpandInfo = {
              "inputType":5,
              "typeDesc":"收货信息",
              "typeId":-1,
              "warningTxt":"请选择",
              "selectedItemList":["",],
              "view_showArrowIcon":true,
              "selected5Value":selected5Value,
            };
            //收件人姓名,收件人手机号,邮寄地址,更新数据
            if (selected5Value) {
              if (Util.isTxtNotEmpty(selected5Value.name)) {
                if (receiveExpandInfo.selectedItemList.length==1 && receiveExpandInfo.selectedItemList[0]=="") {
                  receiveExpandInfo.selectedItemList[0]=selected5Value.name;
                } else {
                  receiveExpandInfo.selectedItemList.push(selected5Value.name);
                }
              }
              if (Util.isTxtNotEmpty(selected5Value.mobile)) {
                if (receiveExpandInfo.selectedItemList.length==1 && receiveExpandInfo.selectedItemList[0]=="") {
                  receiveExpandInfo.selectedItemList[0]=selected5Value.mobile;
                } else {
                  receiveExpandInfo.selectedItemList.push(selected5Value.mobile);
                }
              }
              if (Util.isTxtNotEmpty(selected5Value.address)) {
                if (receiveExpandInfo.selectedItemList.length==1 && receiveExpandInfo.selectedItemList[0]=="") {
                  receiveExpandInfo.selectedItemList[0]=selected5Value.address;
                } else {
                  receiveExpandInfo.selectedItemList.push(selected5Value.address);
                }
              }
            }
            if (this.data.isOrderFillInVerify && receiveExpandInfo.selectedItemList.length!=3) {
              receiveExpandInfo.warningTxt = "信息不完整:姓名,手机号,邮寄地址";
            }
            newExpandInfos.push(receiveExpandInfo);
          }
          if (inputType4ExpandInfos.length > 0) {
            for (var i = 0; i < inputType4ExpandInfos.length; i++) {
              newExpandInfos.push(inputType4ExpandInfos[i]);
            }
          }
        }
        if(expandInfos && expandInfos.length>0) {
          expandInfos.length = 0;
        }
        for (var i = 0; i < newExpandInfos.length; i++) {
          expandInfos.push(newExpandInfos[i]);
        }
      },
      onExpandInfoInput:function(e){
        //附加信息输入改变
        this.data.resourceFillInInfos[0].expandInfos[e.currentTarget.dataset.index].expandInfoValue = e.detail.value;
        this.formateExpandInfo();
        this.setData({
          resourceFillInInfos:this.data.resourceFillInInfos,
        });
      },
      onExpandInfoItemClick:function(options){
        __wxConfig.debug && console.log("onExpandInfoItemClick options = ", options)
        var expandInfo = options.currentTarget.dataset.item,
            expandInfoTypeId = options.currentTarget.dataset.typeid,
            resourceIndex = 0,
            isPassengersEmpty = options.currentTarget.dataset.ispassengersempty;
            if(!expandInfo || expandInfo.inputType == 5 && isPassengersEmpty || expandInfo.inputType == 4) {
              return
            }
        if (expandInfoTypeId == -1 && expandInfo.typeDesc == "收货信息") {
          //收获信息选择
          var itemList = [];
          itemList.push({
            "id":"邮寄地址",
            "name":"邮寄地址",
            "required":0,
            "type":"address",
          });
          itemList.push({
            "id":"收件人姓名",
            "name":"收件人姓名",
            "required":0,
            "type":"cName",
          });
          itemList.push({
            "id":"收件人手机号",
            "name":"收件人手机号",
            "required":0,
            "type":"mobile",
          });
          this.setData({
            receiveInfoSelect:{
              "resourceIndex":resourceIndex,
            }
          });
          var idCardTypeList = [];
          var params = 'itemList='+ encodeURIComponent(JSON.stringify(itemList))+'&idCardTypeList='+ encodeURIComponent(JSON.stringify(idCardTypeList));;
          api.Navigate.go({
            url:'../passengerList/passengerList?' + params
            });
        } else {
          this.setData({
            expandInfoSelect:{
              "resourceIndex":resourceIndex,
              "expandInfoTypeId":expandInfoTypeId,
            },
          });
          var params = 'expandInfos='+ encodeURIComponent(JSON.stringify(expandInfo));
          api.Navigate.go({
            url:'../additionalinfo/additionalinfo?' + params
            });
        }
      },
      onContactItemClick:function(options){
        __wxConfig.debug && console.log("onContactItemClick options = ", options);
        if(options.currentTarget.dataset.readonly) {
          //只读的处理逻辑
          var typStr = options.currentTarget.dataset.type;
          var itemList = this.data.contactTemplate.itemList || [];
          var idCardTypeList = this.data.contactTemplate.idCardTypeList || [];
          var params = 'itemList='+ encodeURIComponent(JSON.stringify(itemList))+'&idCardTypeList='+ encodeURIComponent(JSON.stringify(idCardTypeList));
          if (typStr == "ar") {
            //选择常旅作为联系人,, 选择
            this.setData({
              passengerSelect:{
                "resourceIndex":-1,
                "passengerIndex":-1,
                "chooseContact":true,
                "itemList":itemList,
                "idCardTypeList":idCardTypeList,
              }
            });
            var currPassenger = {};
            var paramPassengerList = [];
            var tempContactValue = this.data.contactTemplate.contactValue;
            if (tempContactValue && !Util.isEmptyObject(tempContactValue)) {
              currPassenger = tempContactValue;
              paramPassengerList.push(tempContactValue);
            }
            if (!Util.isEmptyObject(currPassenger)) {
              params = params + '&currPassenger='+encodeURIComponent(JSON.stringify(currPassenger));
            }
            if (paramPassengerList.length>0) {
              params = params + '&selectedPassengerList='+encodeURIComponent(JSON.stringify(paramPassengerList));
            }
            api.Navigate.go({
              url:'../passengerList/passengerList?'+params
            })
          } else if (typStr == "mobileUrl") {
            //选择联系人电话号码  暂时无法实现
          }
        }
      },
      onContactItemInput:function(options){
        var item = options.currentTarget.dataset.item;
        var index = options.currentTarget.dataset.index;
        var value = options.detail.value;
        switch(item.typStr+""){
          case "ch_name":
            this.data.contactValue.cName = value;
            this.data.contactNewItemList[index].inputValue[0]=value;
            this.setData({
              contactNewItemList:this.data.contactNewItemList,
              contactValue:this.data.contactValue,
            });
            break;
          case "en_first_name":
            this.data.contactValue.firstName = value;
            this.data.contactNewItemList[index].inputValue[0]=value;
            this.setData({
              contactNewItemList:this.data.contactNewItemList,
              contactValue:this.data.contactValue,
            });
            break;
          case "en_last_name":
            this.data.contactValue.lastName = value;
            this.data.contactNewItemList[index].inputValue[0]=value;
            this.setData({
              contactNewItemList:this.data.contactNewItemList,
              contactValue:this.data.contactValue,
            });
            break;
          case "ch_en_first_name":
            if (this.data.contactValue && this.data.contactValue.ch_en_type == 1) {
              this.data.contactValue.firstName = value;
            } else {
              this.data.contactValue.cName = value;
            }
            this.data.contactNewItemList[index].inputValue[0]=value;
            this.setData({
              contactNewItemList:this.data.contactNewItemList,
              contactValue:this.data.contactValue,
            });
            break;
          case "ch_en_last_name":
            this.data.contactValue.lastName = value;
            this.data.contactNewItemList[index].inputValue[0]=value;
            this.setData({
              contactNewItemList:this.data.contactNewItemList,
              contactValue:this.data.contactValue,
            });
            break;
          case "email":
            this.data.contactValue.email = value;
            this.data.contactNewItemList[index].inputValue[0]=value;
            this.setData({
              contactNewItemList:this.data.contactNewItemList,
              contactValue:this.data.contactValue,
            });
            break;
          case "idCard":
            var idCardItem = this.data.contactTemplate.idCardTypeList[this.data.contactValue.id_card_index];
            this.data.contactValue[idCardItem.type] = value;
            this.data.contactNewItemList[index].inputValue[0]=value;
            this.setData({
              contactNewItemList:this.data.contactNewItemList,
              contactValue:this.data.contactValue,
            });
            break;
          case "mobile":
            this.data.contactValue.mobile = value;
            this.data.contactNewItemList[index].inputValue[0]=value;
            this.setData({
              contactNewItemList:this.data.contactNewItemList,
              contactValue:this.data.contactValue,
            });
            break;
          default:
            break
        }
      },
      setPassengerItemToContact:function(options){
        __wxConfig.debug && console.log("setPassengerItemToContact options = ", options);
        if(options.currentTarget.dataset.empty) {
          return
        }
        this.setPassengerToContact(options.currentTarget.dataset.passenger||[], options.currentTarget.dataset.index, 0)
      },
      onPassenerItemClick:function(options){
        __wxConfig.debug && console.log("onPassenerItemClick options = ", options);
        var passengerItem = options.currentTarget.dataset.item,
            resourceIndex = 0,
            passengerIndex = options.currentTarget.dataset.index,
            itemList = passengerItem.itemList || [],
            idCardTypeList = passengerItem.idCardTypeList || [],
            params = 'itemList='+ encodeURIComponent(JSON.stringify(itemList))+'&idCardTypeList='+ encodeURIComponent(JSON.stringify(idCardTypeList));
        this.setData({
          passengerSelect:{
            "resourceIndex":resourceIndex,
            "passengerIndex":passengerIndex,
            "chooseContact":false,
            "itemList":passengerItem.itemList,
            "idCardTypeList":passengerItem.idCardTypeList,
          }
        });
        if (this.data.isPassengersEmpty) {
          __wxConfig.debug && console.log("onPassenerItemClick passengerItem = ", passengerItem);
          __wxConfig.debug && console.log("onPassenerItemClick passengerIndex = ", passengerIndex);
          api.Navigate.go({
            url:'../editPassenger/editPassenger?' + params
          })
        } else{
          var resourceFillInInfo = this.data.resourceFillInInfos[resourceIndex];
          var temp_PassengerList = resourceFillInInfo._passengerList;
          var paramPassengerList = [];
          var currPassenger = {};
          if (temp_PassengerList && temp_PassengerList.length>0) {
            for (var i = 0; i < temp_PassengerList.length; i++) {
              var tempPassengerValue = temp_PassengerList[i].passengerValue;
              if (tempPassengerValue && !Util.isEmptyObject(tempPassengerValue.passenger)) {
                if (i == passengerIndex) {
                  currPassenger = tempPassengerValue.passenger;
                }
                paramPassengerList.push(tempPassengerValue.passenger);
              }
            }
            if (!Util.isEmptyObject(currPassenger)) {
              params = params + '&currPassenger='+encodeURIComponent(JSON.stringify(currPassenger));
            }
            if (paramPassengerList.length>0) {
              params = params + '&selectedPassengerList='+encodeURIComponent(JSON.stringify(paramPassengerList));
            }
          }
          __wxConfig.debug && console.log("onPassenerItemClick currPassenger = ", currPassenger);
          __wxConfig.debug && console.log("onPassenerItemClick paramPassengerList = ", paramPassengerList);
          api.Navigate.go({
            url:'../passengerList/passengerList?' + params
          })
        }
      },
      setBuyRulesShowState:function(options){
        __wxConfig.debug && console.log("setBuyRulesShowState options = ", options);
        this.setData({
          showBuyRules:options.currentTarget.dataset.show == 1
        })
      },
      /**
       * 获取当前日期是星期几
       * 日期格式为2009-10-01
      */
      getWeekOfDate(travelDate) {
        if (!travelDate || travelDate == "") {
          return "";
        }
        var weekDays = ["星期日","星期一", "星期二", "星期三", "星期四", "星期五", "星期六", ];
        var arrays = new Array();
        arrays = travelDate.split('-'); //日期为输入日期，格式为 2013-3-10
        if (arrays.length == 3) {
          var date = new Date(arrays[0],parseInt(arrays[1]-1),arrays[2]);
          var day = date.getDay();
          if (day >= 0 && day <= 6) {
            return travelDate + "  " + weekDays[day];
          }
        }
        return travelDate;
      },
      onTravelDateClick:function(options){
        __wxConfig.debug && console.log("onTravelDateClick options = ", options);
        __wxConfig.debug && console.log("onTravelDateClick calendarData = ", this.data.calendarData);
        //价格日历
        var  _this = this, isCalendarDataUseful = false;
        if(!Util.isEmptyObject(this.data.calendarData) && this.data.calendarData.ticketList 
            && this.data.calendarData.ticketList.length>0 && this.data.calendarData.ticketList[0].ticketId == this.data.ticketId
            && this.data.calendarData.ticketList[0].ticketCalendar && this.data.calendarData.ticketList[0].ticketCalendar.length > 0){
              isCalendarDataUseful = true
        }
        CalendarPlugin({
          ticketId:this.data.ticketId,
          fromOrderFillIn:true,
          checkTravelDate:this.data.resourceFillInInfos[0].travelDate||"",
          calendarData:isCalendarDataUseful?JSON.stringify(this.data.calendarData):""
        }, function (res) {
          __wxConfig.debug && console.log("fillInOrder calendarCallbackData = ", res);
          _this.data.resourceFillInInfos[0].payPrice = res.value.price
          _this.data.resourceFillInInfos[0].showPayPrice = Util.formatePrice(res.value.price)
          _this.data.resourceFillInInfos[0].costPrice = res.value.costPrice
          _this.data.resourceFillInInfos[0].travelDate = res.value.calendarDate
          _this.data.resourceFillInInfos[0].showTravelDate = _this.getWeekOfDate(res.value.calendarDate)
          _this.calculateTotalPrice(_this.data.resourceFillInInfos[0])
          _this.setData({
            resourceFillInInfos:_this.data.resourceFillInInfos,
            totalCostPrice:mTotalCostPrice,
            totalPrice:mTotalPrice,
            showTotalPrice:Util.formatePrice(mTotalPrice)
          })
        })
      },
      updatePassengerNumber:function(){
        var resourceFillInInfosItem = this.data.resourceFillInInfos[0];
        var ticketNumValue = resourceFillInInfosItem.ticketNum;
        if (resourceFillInInfosItem.ticketType && resourceFillInInfosItem.ticketType == "A") {
          if (resourceFillInInfosItem._passengerList) {
            if (resourceFillInInfosItem._passengerList.length <ticketNumValue) {
              //增加购买数量
              for (var i = resourceFillInInfosItem._passengerList.length; i < ticketNumValue; i++) {
                resourceFillInInfosItem._passengerList.push({
                  "idCardTypeList":resourceFillInInfosItem.passengerTemplate.idCardTypeList||[],
                  "itemList":resourceFillInInfosItem.passengerTemplate.itemList||[],
                  "passengerValue":{
                    "title":"",
                    "content":"",
                    "passenger":{},
                    "isSetToContact":false,
                  },
                  isValueEmpty:true
                });
              }
            } else if (resourceFillInInfosItem._passengerList.length > ticketNumValue) {
              //减少购买数量
              resourceFillInInfosItem._passengerList = resourceFillInInfosItem._passengerList.slice(0, ticketNumValue);
            }
          }
        }
      },
      setResourceTicketNumber:function(options){
        if(options.currentTarget.dataset.type == 'plus' && this.data.resourceFillInInfos[0].ticketNum<this.data.resourceFillInInfos[0].maxPurchase) {
          ++this.data.resourceFillInInfos[0].ticketNum;
        } else if(options.currentTarget.dataset.type == 'minus' && this.data.resourceFillInInfos[0].ticketNum>this.data.resourceFillInInfos[0].minPurchase){
          --this.data.resourceFillInInfos[0].ticketNum;
        } else {
          return
        }
        this.updatePassengerNumber();
        this.calculateTotalPrice(this.data.resourceFillInInfos[0]);
        this.setData({
          showTotalPrice:Util.formatePrice(mTotalPrice),
          totalPrice:mTotalPrice,
          totalCostPrice:mTotalCostPrice,
          resourceFillInInfos:this.data.resourceFillInInfos
        })
      },
      onNumberEditBlur:function(e){
        var tempTicketNum = e.detail.value,
        minNum = this.data.resourceFillInInfos[0].minPurchase,
        maxNum = this.data.resourceFillInInfos[0].maxPurchase;
        if(tempTicketNum < minNum){
          tempTicketNum = minNum
          api.showToast({
            title:"至少购买"+minNum+"份"
          })
        }
        if(tempTicketNum > maxNum){
          tempTicketNum = maxNum
          api.showToast({
            title:"至多购买"+maxNum+"份"
          })
        }
        this.data.resourceFillInInfos[0].ticketNum = tempTicketNum
        this.updatePassengerNumber();
        this.calculateTotalPrice(this.data.resourceFillInInfos[0]);
        this.setData({
          showTotalPrice:Util.formatePrice(mTotalPrice),
          totalPrice:mTotalPrice,
          totalCostPrice:mTotalCostPrice,
          resourceFillInInfos:this.data.resourceFillInInfos
        })
      },
      onContactSelectListLabelClick:function(options){
        __wxConfig.debug && console.log("onContactSelectListLabelClick options = ", options)
        switch(options.currentTarget.dataset.pickertype){
          case "idcard":
            this.data.contactValue.id_card_index = options.detail.value;
            break
          case "name":
            this.data.contactValue.ch_en_type = options.detail.value;
            break
          default:
            break
        }
        this.setData({
          contactValue:this.data.contactValue,
          contactNewItemList:this.formateContactItemList(this.data.contactTemplate),//联系人itemlist
        })
      },
      /*
      * 提交订单
      */
      submitOrder(){
        var _this = this, _api = api;
        if(Util.isTxtNotEmpty(mGorderId)) {
              Util.wxRequestPayment(_api, mOrderId, mGorderId, _this.data.sceneryId);
              return
        }
        __wxConfig.debug && console.log("submitOrder 提交订单  data = ", this.data);
        var createOrderReq = {
          "activityId":"10000",
          "ofId":"20000",
          "userCardNo":"",//用户账号, 必须
          // "channel":"" ,//渠道
          // "outerOrigin":"",//订单来源
          // "traceId":"",//轨迹号
          "contactInfo":{
            // "name":"",//必须
            // "eName":"",
            // "phone":"",//必须
            // "address":,//联系人地址
            // "cardType":,//证件类型
            // "email":"",
            // "fax":"",//传真
            // "idCard":,//证件id
            // "firstName":"",
            // "lastName":"",
          },
          "orderCreateFormInfo":{
            "sceneId":"",//景点id
            "totalCostSumPrice":0,//成本总价格
            // "totalMarketSumPrice":0,//市场总价格,不传
            "totalPayAmount":0,//支付订单总价格
            "totalTickets":0,//总票数
            "resourceInfoList":[],
          },//表单信息
        };
      //常旅返回数据:
      //   {
      //     "firstName":"Lyren",
      //     "lastName":"Lee",
      //     "mobile":"13456789",
      //     "timeStamp":1480334745445,
      //     "cName":"",
      //     "address":"",
      //     "email:"",
      //     "1":"q2w3456789",
      //     "2":"23456789"
      //   },
        //设置请求联系人数据
        var isOrderFillInVerifySucceed = true;
        if (!Util.isEmptyObject(this.data.contactTemplate)) {
          for (var i = 0; i < this.data.contactTemplate.itemList.length; i++) {
            var item = this.data.contactTemplate.itemList[i];
            switch(item.type) {
              case "cName":
                if (Util.isTxtNotEmpty(this.data.contactValue.cName)) {
                  if (this.data.contactValue.cName.length<2||Util.hasKongGe(this.data.contactValue.cName) ||!Util.isHanZi(this.data.contactValue.cName)) {
                    isOrderFillInVerifySucceed = false;
                  }
                  createOrderReq.contactInfo.name = this.data.contactValue.cName;
                } else {
                  isOrderFillInVerifySucceed = false;
                }
                break;
              case "name":
                if (!Util.isEmptyObject(this.data.contactValue)) {
                  if (this.data.isPassengersEmpty) {
                    if (this.data.contactValue.ch_en_type == 1) {
                      if (Util.isTxtNotEmpty(this.data.contactValue.eName)) {
                        if (Util.isTxtNotEmpty(this.data.contactValue.firstName)
                        && Util.isTxtNotEmpty(this.data.contactValue.lastName)) {
                          createOrderReq.contactInfo.firstName = this.data.contactValue.firstName;
                          createOrderReq.contactInfo.lastName = this.data.contactValue.lastName;
                        }
                        createOrderReq.contactInfo.eName = this.data.contactValue.eName;
                        createOrderReq.contactInfo.name = this.data.contactValue.eName;
                        if(!Util.isEnChar(createOrderReq.contactInfo.firstName)|| Util.hasKongGe(createOrderReq.contactInfo.firstName)) {
                          isOrderFillInVerifySucceed = false;
                        }
                        if(!Util.isEnChar(createOrderReq.contactInfo.lastName)|| Util.hasKongGe(createOrderReq.contactInfo.lastName)) {
                          isOrderFillInVerifySucceed = false;
                        }
                        if (!Util.isTxtNotEmpty(createOrderReq.contactInfo.name) || Util.hasKongGe(createOrderReq.contactInfo.name)
                        ||!Util.isEnChar(createOrderReq.contactInfo.name)) {
                          isOrderFillInVerifySucceed = false;
                        }
                      } else if (Util.isTxtNotEmpty(this.data.contactValue.firstName)
                        && Util.isTxtNotEmpty(this.data.contactValue.lastName)) {
                        createOrderReq.contactInfo.firstName = this.data.contactValue.firstName;
                        createOrderReq.contactInfo.lastName = this.data.contactValue.lastName;
                        createOrderReq.contactInfo.eName = createOrderReq.contactInfo.firstName + createOrderReq.contactInfo.lastName;
                        createOrderReq.contactInfo.name = createOrderReq.contactInfo.eName;
                        if(!Util.isEnChar(createOrderReq.contactInfo.firstName)|| Util.hasKongGe(createOrderReq.contactInfo.firstName)) {
                          isOrderFillInVerifySucceed = false;
                        }
                        if(!Util.isEnChar(createOrderReq.contactInfo.lastName)|| Util.hasKongGe(createOrderReq.contactInfo.lastName)) {
                          isOrderFillInVerifySucceed = false;
                        }
                        if (!Util.isTxtNotEmpty(createOrderReq.contactInfo.name) || Util.hasKongGe(createOrderReq.contactInfo.name)
                        ||!Util.isEnChar(createOrderReq.contactInfo.name)) {
                          isOrderFillInVerifySucceed = false;
                        }
                      }
                    } else {
                      if (Util.isTxtNotEmpty(this.data.contactValue.cName)) {
                        if (this.data.contactValue.cName.length<2||Util.hasKongGe(this.data.contactValue.cName) ||!Util.isHanZi(this.data.contactValue.cName)) {
                          isOrderFillInVerifySucceed = false;
                        }
                        createOrderReq.contactInfo.name = this.data.contactValue.cName;
                      } else {
                        isOrderFillInVerifySucceed = false;
                      }
                    }
                  } else {
                    if (Util.isTxtNotEmpty(this.data.contactValue.cName)) {
                      if (this.data.contactValue.cName.length<2 || Util.hasKongGe(this.data.contactValue.cName) || !Util.isHanZi(this.data.contactValue.cName)) {
                        isOrderFillInVerifySucceed = false;
                      }
                      createOrderReq.contactInfo.name = this.data.contactValue.cName;
                    }
                    if (Util.isTxtNotEmpty(this.data.contactValue.eName)) {
                      if (Util.isTxtNotEmpty(this.data.contactValue.firstName)
                      && Util.isTxtNotEmpty(this.data.contactValue.lastName)) {
                        if(!Util.isEnChar(createOrderReq.contactInfo.firstName)|| Util.hasKongGe(createOrderReq.contactInfo.firstName)) {
                          isOrderFillInVerifySucceed = false;
                        }
                        if(!Util.isEnChar(createOrderReq.contactInfo.lastName)|| Util.hasKongGe(createOrderReq.contactInfo.lastName)) {
                          isOrderFillInVerifySucceed = false;
                        }
                        createOrderReq.contactInfo.firstName = this.data.contactValue.firstName;
                        createOrderReq.contactInfo.lastName = this.data.contactValue.lastName;
                      }
                      if(!Util.isEnChar(createOrderReq.contactInfo.name)|| Util.hasKongGe(createOrderReq.contactInfo.eName)) {
                        isOrderFillInVerifySucceed = false;
                      }
                      createOrderReq.contactInfo.eName = this.data.contactValue.eName;
                    } else if (Util.isTxtNotEmpty(this.data.contactValue.firstName)
                      && Util.isTxtNotEmpty(this.data.contactValue.lastName)) {
                      if(!Util.isEnChar(createOrderReq.contactInfo.firstName)|| Util.hasKongGe(createOrderReq.contactInfo.firstName)) {
                        isOrderFillInVerifySucceed = false;
                      }
                      if(!Util.isEnChar(createOrderReq.contactInfo.lastName)|| Util.hasKongGe(createOrderReq.contactInfo.lastName)) {
                        isOrderFillInVerifySucceed = false;
                      }
                      createOrderReq.contactInfo.firstName = this.data.contactValue.firstName;
                      createOrderReq.contactInfo.lastName = this.data.contactValue.lastName;
                      createOrderReq.contactInfo.eName = createOrderReq.contactInfo.firstName + createOrderReq.contactInfo.lastName;
                    }
                    if (!Util.isTxtNotEmpty(createOrderReq.contactInfo.name)) {
                      if (!Util.isTxtNotEmpty(createOrderReq.contactInfo.eName)) {
                        isOrderFillInVerifySucceed = false;
                      } else {
                        if(Util.hasKongGe(createOrderReq.contactInfo.eName)) {
                          isOrderFillInVerifySucceed = false;
                        }
                        createOrderReq.contactInfo.name = this.data.contactValue.eName;
                      }
                    } else if(Util.hasKongGe(createOrderReq.contactInfo.name)) {
                      isOrderFillInVerifySucceed = false;
                    }
                  }
                }
                break;
              case "eName":
                  if (Util.isTxtNotEmpty(this.data.contactValue.firstName)
                    && Util.isTxtNotEmpty(this.data.contactValue.lastName)) {
                    if(!Util.isEnChar(createOrderReq.contactInfo.firstName)|| Util.hasKongGe(createOrderReq.contactInfo.firstName)) {
                      isOrderFillInVerifySucceed = false;
                    }
                    if(!Util.isEnChar(createOrderReq.contactInfo.lastName)|| Util.hasKongGe(createOrderReq.contactInfo.lastName)) {
                      isOrderFillInVerifySucceed = false;
                    }
                    createOrderReq.contactInfo.firstName = this.data.contactValue.firstName;
                    createOrderReq.contactInfo.lastName = this.data.contactValue.lastName;
                    createOrderReq.contactInfo.eName = this.data.contactValue.firstName + this.data.contactValue.lastName;
                  }
                  if (!Util.isTxtNotEmpty(createOrderReq.contactInfo.eName) && Util.isTxtNotEmpty(this.data.contactValue.eName)
                  && Util.isEnChar(this.data.contactValue.eName)&&!Util.hasKongGe(this.data.contactValue.eName)) {
                    createOrderReq.contactInfo.eName = this.data.contactValue.eName;
                  }
                  if (!Util.isTxtNotEmpty(createOrderReq.contactInfo.eName)||Util.hasKongGe(this.data.contactValue.eName)) {
                  isOrderFillInVerifySucceed = false;
                  }
                  break;
              case "mobile":
                  if (Util.isTxtNotEmpty(this.data.contactValue.mobile)) {
                    if (this.data.contactValue.mobile.length==11&&Util.validatePhone(this.data.contactValue.mobile)) {
                      createOrderReq.contactInfo.phone = this.data.contactValue.mobile;
                    } else {
                      isOrderFillInVerifySucceed = false;
                    }
                  } else {
                    isOrderFillInVerifySucceed = false;
                  }
                  break;
              case "email":
                  if (Util.isTxtNotEmpty(this.data.contactValue.email)) {
                    if (Util.validateEmail(this.data.contactValue.email)) {
                      createOrderReq.contactInfo.email = this.data.contactValue.email;
                    } else {
                    isOrderFillInVerifySucceed = false;
                    }
                  } else {
                    isOrderFillInVerifySucceed = false;
                  }
                  break;
              default:
                  break;
            }
          }
          if (!Util.isTxtNotEmpty(createOrderReq.contactInfo.name) && Util.isTxtNotEmpty(createOrderReq.contactInfo.eName)&&!Util.hasKongGe(createOrderReq.contactInfo.eName)) {
            createOrderReq.contactInfo.name = createOrderReq.contactInfo.eName;
          }
          var tempIdCardIndex = this.data.contactValue.id_card_index;
          var tempIdCardIList = this.data.contactTemplate.idCardTypeList;
          if (tempIdCardIList && tempIdCardIList.length > 0) {
            if (!Util.isEmptyObject(tempIdCardIList[tempIdCardIndex])) {
              createOrderReq.contactInfo.cardType = tempIdCardIList[tempIdCardIndex].type;
              createOrderReq.contactInfo.idCard = this.data.contactValue[createOrderReq.contactInfo.cardType]||"";
            }
            if (!Util.isTxtNotEmpty(createOrderReq.contactInfo.idCard) || (createOrderReq.contactInfo.cardType == 1 && !Util.IdCardValidate(createOrderReq.contactInfo.idCard))) {
            isOrderFillInVerifySucceed = false;
            }
          }
        }
        //设置orderCreateFormInfo
        createOrderReq.orderCreateFormInfo.sceneId = this.data.sceneryId;
        createOrderReq.orderCreateFormInfo.totalCostSumPrice = this.data.totalCostPrice;
        createOrderReq.orderCreateFormInfo.totalPayAmount = this.data.totalPrice;
        var tempTotalTickets = 0;
        var tempResourceInfoList = [];
        for (var i = 0; i < this.data.resourceFillInInfos.length; i++) {

          var resourceFillInInfo = this.data.resourceFillInInfos[i];
          var tempResourceInfo = {};
          //计算票的张数
          tempTotalTickets = tempTotalTickets + resourceFillInInfo.ticketNum;
          //设置数据
          tempResourceInfo.costPrice = resourceFillInInfo.costPrice;
          tempResourceInfo.payPrice = resourceFillInInfo.payPrice;
          tempResourceInfo.productId = resourceFillInInfo.ticketId;
          tempResourceInfo.ticketCount = resourceFillInInfo.ticketNum;
          if (!Util.isTxtNotEmpty(resourceFillInInfo.travelDate)) {
          isOrderFillInVerifySucceed = false;
          break;
          } else {
            tempResourceInfo.useDate = resourceFillInInfo.travelDate;
          }
          tempResourceInfo.productName = resourceFillInInfo.title;
          tempResourceInfo.ticketType = resourceFillInInfo.ticketType;
          //下单附加信息集合
          if (resourceFillInInfo.expandInfos && resourceFillInInfo.expandInfos.length > 0) {
            var itemAddInfoList = [];
            for (var j = 0; j < resourceFillInInfo.expandInfos.length; j++) {
              var expandInfo = resourceFillInInfo.expandInfos[j];
              switch(expandInfo.inputType) {
                //1单选框 2复选框 3下拉框 4输入框 5地址(联系人姓名,电话,邮寄地址), 下拉框不做过滤掉.
                case 1://单选
                case 2://多选
                  var itemAddInfo = {};
                  itemAddInfo.ResourceOrderExtendInfoID = expandInfo.typeId;
                  itemAddInfo.resourceOrderExtendTypeName = expandInfo.typeDesc;
                  itemAddInfo.content = "";
                  itemAddInfo.AddInfoDetails = [];
                  for (var k = 0; k < expandInfo.selectItemList.length; k++) {
                    var selectItem = expandInfo.selectItemList[k];
                    if (selectItem.isSelected && Util.isTxtNotEmpty(selectItem.itemDesc)) {
                      itemAddInfo.AddInfoDetails.push({
                        "content":selectItem.itemDesc,
                        "id":selectItem.itemId,
                      });
                    }
                  }
                  if (!Util.isEmptyObject(itemAddInfo) && itemAddInfo.AddInfoDetails.length>0) {
                    itemAddInfoList.push(itemAddInfo);
                  } else {
                    isOrderFillInVerifySucceed = false;
                  }
                  break
                case 4://输入框
                    var itemAddInfo = {};
                    itemAddInfo.content = expandInfo.expandInfoValue||"";
                    itemAddInfo.ResourceOrderExtendInfoID = expandInfo.typeId;
                    itemAddInfo.resourceOrderExtendTypeName = expandInfo.typeDesc;
                    itemAddInfo.AddInfoDetails = [];
                    if (Util.isTxtNotEmpty(itemAddInfo.content)) {
                      itemAddInfo.AddInfoDetails.push({
                          "content":itemAddInfo.content,
                          "id":itemAddInfo.ResourceOrderExtendInfoID,
                        });
                      itemAddInfoList.push(itemAddInfo);
                    } else {
                      isOrderFillInVerifySucceed = false;
                    }
                  break
                case 5://邮寄地址
                    var itemAddInfo = {};
                    itemAddInfo.content = expandInfo.expandInfoValue||"";
                    itemAddInfo.ResourceOrderExtendInfoID = expandInfo.typeId;
                    itemAddInfo.resourceOrderExtendTypeName = expandInfo.typeDesc;
                    itemAddInfo.AddInfoDetails = [];
                    if (Util.isTxtNotEmpty(itemAddInfo.content)) {
                      switch(expandInfo.typeDesc) {
                        case "收件人姓名":
                          if(Util.hasKongGe(itemAddInfo.content) ||!Util.isHanZi(itemAddInfo.content)){
                            isOrderFillInVerifySucceed = false;
                          }
                          break;
                        case "收件人手机号":
                          if(itemAddInfo.content.length!=11 ||!Util.validatePhone(itemAddInfo.content)){
                            isOrderFillInVerifySucceed = false;
                          }
                          break;
                        default:
                          break;
                      }
                      itemAddInfo.AddInfoDetails.push({
                          "content":itemAddInfo.content,
                          "id":itemAddInfo.ResourceOrderExtendInfoID,
                        });
                      itemAddInfoList.push(itemAddInfo);
                    } else {
                      isOrderFillInVerifySucceed = false;
                    }
                  break;
                default:
                  break;
              }
              if (itemAddInfoList.length > 0) {
                tempResourceInfo.itemAddInfosList = itemAddInfoList;
              }
            }
            if (!isOrderFillInVerifySucceed) {
              break;
            }
          }
          //出行人信息集合
          __wxConfig.debug && console.log("submitOrder passengerTemplate =", resourceFillInInfo.passengerTemplate);
          tempResourceInfo.passengerInfoList = [];
          var tempLength = "A" == resourceFillInInfo.ticketType || !Util.isTxtNotEmpty(resourceFillInInfo.ticketType) ? resourceFillInInfo._passengerList.length:1;
          if (Util.isEmptyObject(resourceFillInInfo.passengerTemplate)||(Util.isEmptyObject(resourceFillInInfo.passengerTemplate.itemList)
            &&Util.isEmptyObject(resourceFillInInfo.passengerTemplate.idCardTypeList))) {
            //出行人模板空或者不存在
            var contactInfo = createOrderReq.contactInfo;
            for (var j = 0; j < tempLength; j++) {
              var passengerInfo = {};
              passengerInfo.cName = contactInfo.name;
              passengerInfo.eName = contactInfo.eName;
              passengerInfo.firstName = contactInfo.firstName;
              passengerInfo.lastName = contactInfo.lastName;
              passengerInfo.phone = contactInfo.phone;
              passengerInfo.idCard = contactInfo.idCard;
              passengerInfo.cardType = contactInfo.cardType;
              passengerInfo.address = contactInfo.address;
              if (!Util.isTxtNotEmpty(passengerInfo.cName) && Util.isTxtNotEmpty(passengerInfo.eName)) {
                passengerInfo.cName = passengerInfo.eName;
              }
              tempResourceInfo.passengerInfoList.push(passengerInfo);
              if (Util.isEmptyObject(passengerInfo)||!(Util.isTxtNotEmpty(passengerInfo.cName)&&Util.isTxtNotEmpty(passengerInfo.phone))) {
                isOrderFillInVerifySucceed = false;
              }
            }
          } else {
            var passengerTemplate = resourceFillInInfo.passengerTemplate;
            for (var j = 0; j < tempLength;j++) {
                var passengerValue = resourceFillInInfo._passengerList[j].passengerValue;
                var passenger = passengerValue.passenger;
                var passengerInfo = {};
                if (!Util.isEmptyObject(passengerValue)&&!Util.isEmptyObject(passenger)) {
                  if (!Util.isEmptyObject(passengerTemplate.itemList) && passengerTemplate.itemList.length>0) {
                      for (var k =0; k < passengerTemplate.itemList.length; k++) {
                          var item = passengerTemplate.itemList[k];
                          if (!Util.isEmptyObject(item)) {
                              __wxConfig.debug && console.log("passengerTemplate item = ", item);
                              switch (item.type) {
                                  case "cName":
                                      if (Util.isTxtNotEmpty(passenger.cName)) {
                                          passengerInfo.cName = passenger.cName;
                                      }
                                      break;
                                  case "name":
                                      if (Util.isTxtNotEmpty(passenger.cName)) {
                                          passengerInfo.cName = passenger.cName;
                                      }
                                      if (Util.isTxtNotEmpty(passenger.eName)) {
                                        passengerInfo.eName = passenger.eName;
                                        if (Util.isTxtNotEmpty(passenger.firstName) && Util.isTxtNotEmpty(passenger.lastName)) {
                                          passengerInfo.firstName = passenger.firstName;
                                          passengerInfo.lastName = passenger.lastName;
                                        }
                                      } else if (Util.isTxtNotEmpty(passenger.firstName) && Util.isTxtNotEmpty(passenger.lastName)) {
                                          passengerInfo.eName = passenger.firstName + passenger.lastName;
                                          passengerInfo.firstName = passenger.firstName;
                                          passengerInfo.lastName = passenger.lastName;
                                      }
                                      if (!Util.isTxtNotEmpty(passengerInfo.cName) && Util.isTxtNotEmpty(passengerInfo.eName)) {
                                        passengerInfo.cName = passengerInfo.eName;
                                      }
                                      break;
                                  case "eName":
                                      if (Util.isTxtNotEmpty(passenger.eName)) {
                                        passengerInfo.eName = passenger.eName;
                                        if (Util.isTxtNotEmpty(passenger.firstName) && Util.isTxtNotEmpty(passenger.lastName)) {
                                          passengerInfo.firstName = passenger.firstName;
                                          passengerInfo.lastName = passenger.lastName;
                                        }
                                      } else if (Util.isTxtNotEmpty(passenger.firstName) && Util.isTxtNotEmpty(passenger.lastName)) {
                                          passengerInfo.eName = passenger.firstName + passenger.lastName;
                                          passengerInfo.firstName = passenger.firstName;
                                          passengerInfo.lastName = passenger.lastName;
                                      }
                                      break;
                                  case "mobile":
                                      if (Util.isTxtNotEmpty(passenger.mobile)) {
                                        passengerInfo.phone = passenger.mobile;
                                      }
                                      break;
                                  case "address":
                                      if (Util.isTxtNotEmpty(passenger.address)) {
                                        passengerInfo.address = passenger.address;
                                      }
                                      break;
                                  default:
                                      break;
                              }
                          }
                      }
                  }
                  if (!Util.isEmptyObject(passengerTemplate.idCardTypeList) && passengerTemplate.idCardTypeList.length > 0) {
                      var tempIdCardIndex = -1;
                      for (var key in passenger) {
                        for (var n = 0; n < passengerTemplate.idCardTypeList.length; n++) {
                          var idCardItem = passengerTemplate.idCardTypeList[n];
                          if (key == idCardItem.type) {
                            //找到指定type的证件
                            tempIdCardIndex = n;
                            break;
                          }
                        }
                      }
                      if (tempIdCardIndex>=0) {
                        var type = passengerTemplate.idCardTypeList[tempIdCardIndex].type;
                        passengerInfo.cardType = type;
                        if (Util.isTxtNotEmpty(passenger[type])) {
                            passengerInfo.idCard = passenger[type];
                        }
                      }
                  }
              }
              if (!Util.isEmptyObject(passengerInfo)) {
                tempResourceInfo.passengerInfoList.push(passengerInfo);
              } else {
                isOrderFillInVerifySucceed = false;
              }
            }

          }
          //添加数据到集合
          if (!Util.isEmptyObject(tempResourceInfo)) {
            tempResourceInfoList.push(tempResourceInfo);
          }
        }
        if (tempResourceInfoList.length > 0) {
          createOrderReq.orderCreateFormInfo.resourceInfoList = tempResourceInfoList;
        }
        createOrderReq.orderCreateFormInfo.totalTickets = tempTotalTickets;
        api.showToast({
          title:JSON.stringify(createOrderReq),
          duration:5000
        })
        __wxConfig.debug && console.log("submitOrder createOrderReq", createOrderReq);
        __wxConfig.debug && console.log("submitOrder isOrderFillInVerifySucceed = ", isOrderFillInVerifySucceed);
        if (!isOrderFillInVerifySucceed) {
          //数据不完整
          this.data.isOrderFillInVerify = true
          this.formateExpandInfo();
          this.setData({
            isOrderFillInVerify:true,//数据不完整,显示warning
            contactNewItemList:_this.formateContactItemList(_this.data.contactTemplate),//联系人itemlist
            resourceFillInInfos:this.data.resourceFillInInfos
          });
          api.showToast({
          title:"请填写完整订单信息",
          // duration:5000
          })
          return;
        } else {
          // this.setData({
          //   isOrderFillInVerify:false,//数据完整,不显示warning
          // });
        }
        //请求成单
        let newParams = Object.assign({}, createOrderReq);
        __wxConfig.debug && console.log("成单请求: ", JSON.stringify(newParams));
        try{
          FillInOrderService.CreateOrder(newParams).then(function(createResponseData){
            __wxConfig.debug && console.log("submitOrder responseData = ", createResponseData);
            if(createResponseData.errMsg == 'request:fail') {
                _api.showToast({
                  title:'提交订单失败, 请重试',
                })
                return
            }
            if(createResponseData.IsError){
              if (createResponseData.ErrorCode == "140") {                
                _api.showModal({
                  title: '',
                  content: createResponseData.ErrorMessage && createResponseData.ErrorMessage.indexOf('当前订单超过购买张数') >=0?createResponseData.ErrorMessage:'资源价格变动，请重新选择出游时间后提交重试',
                  showCancel: false,
                })
              } else {
                _api.showToast({
                  title:createResponseData.ErrorMessage||'提交订单失败, 请重试',
                })
              }
              return
            }
            if (createResponseData && Util.isTxtNotEmpty(createResponseData.gorderId)) {
              mGorderId = createResponseData.gorderId;
              mOrderId = createResponseData.orderId;
              //保存联系人
              _this.saveContactData();
              //保存收获地址
              _this.saveReceiveData();
              Util.wxRequestPayment(_api, createResponseData.orderId, createResponseData.gorderId, _this.data.sceneryId);
            }
          }.bind(this));
        }catch(err2){ //todo ,异常处理
          api.showToast({
            title:err2
          });
          __wxConfig.debug && console.log("err2",err2);
        }
      },
      /*
      *如果出行人空, 保存联系人信息
      */
      saveContactData() {
        var _this = this
        if(this.data.isPassengersEmpty) {
          api.Storage.set({
                key: CONTACT_DATA_KEY,
                data: _this.data.contactValue
                // success: callback
          });
        }
      },
      /*
      *如果出行人空, 读取联系人信息
      */
      getContactData() {
        var _this = this
        if(this.data.isPassengersEmpty) {
          api.Storage.get({
            key: CONTACT_DATA_KEY,
            success: function(contactValue) {
              if(!Util.isEmptyObject(contactValue.data)) {
                _this.setData({
                  contactValue:contactValue.data,
                })
              }
            },
            fail: function(e) {
            }
          });          
        }
      },

      /*
      *如果首次常旅空,成单后保存收获地址信息
      */
      saveReceiveData() {
        if(this.data.isPassengersEmpty) {
          for (var i = 0; i < this.data.resourceFillInInfos.length; i++) {
            var resourceFillInInfo = this.data.resourceFillInInfos[i];
            if (resourceFillInInfo && resourceFillInInfo.expandInfos &&
              resourceFillInInfo.expandInfos.length>0) {
              var passenger = {};
              var hasReceiver = false
              for (var k = 0; k < resourceFillInInfo.expandInfos.length; k++) {
                var expandInfo = resourceFillInInfo.expandInfos[k];
                if (expandInfo && Util.isTxtNotEmpty(expandInfo.expandInfoValue)) {
                  switch(expandInfo.typeDesc) {
                    case "收件人姓名":
                    passenger.cName = expandInfo.expandInfoValue;
                    hasReceiver = true
                      break;
                    case "收件人手机号":
                    passenger.mobile = expandInfo.expandInfoValue;
                    hasReceiver = true
                      break;
                    case "邮寄地址":
                    passenger.address = expandInfo.expandInfoValue;
                    hasReceiver = true
                      break;
                    default:
                      break;
                  }
                }
              }
              if (!Util.isEmptyObject(passenger) && hasReceiver) {
                PassengerDao.insert(passenger);
              }
            }
          }
        }
      },
      setBookingDetailShowState:function(options){
        this.setData({
          showFeeDetail:options.currentTarget.dataset.show == 1
        })
      },
      /*
      *设置选择常旅作为联系人
      */
      setPassengerToContact(passengerValue, passengerIndex,resourceIndex){
        // this.trap.click(this.traps["contacts"].params);
        __wxConfig.debug && console.log("fillInOrder setPassengerToContact passenger",passengerValue);
        __wxConfig.debug && console.log("fillInOrder setPassengerToContact passengerIndex",passengerIndex);
        __wxConfig.debug && console.log("fillInOrder setPassengerToContact resourceIndex",resourceIndex);
        if (passengerIndex >=0 && resourceIndex >=0) {
          //更新出行人"已设为联系人状态"
          var i = 0;
          var resourceFillInInfo = this.data.resourceFillInInfos[i];
          if (resourceFillInInfo && resourceFillInInfo.passengerTemplate) {
            //有出行人的资源更新设置状态
            resourceFillInInfo.isSetToContact = i == resourceIndex;
            if (resourceFillInInfo.isSetToContact && resourceFillInInfo._passengerList && resourceFillInInfo._passengerList.length > 0) {
              for (let j = 0; j < resourceFillInInfo._passengerList.length; j++) {
                var passengerItem = resourceFillInInfo._passengerList[j];
                if (passengerItem && j == passengerIndex) {
                  passengerItem.passengerValue.isSetToContact = true;
                } else {
                  passengerItem.passengerValue.isSetToContact = false;
                }
              }
            }
          }
        }
        this.data.contactValue = passengerValue
        this.setData({
          contactValue:passengerValue,
          contactNewItemList:this.formateContactItemList(this.data.contactTemplate),//联系人itemlist
          resourceFillInInfos:this.data.resourceFillInInfos,
          passengerSelect:{
            "resourceIndex":-1,
            "passengerIndex":-1,
            "chooseContact":false,
            "itemList":[],
            "idCardTypeList":[],
          },
          selectedPassenger:{}
        });
      },
      /*
      *设置选择常旅作为出行人
      */
      setResourcePassengerData(passenger){
        __wxConfig.debug && console.log("fillInOrder setResourcePassengerData passenger = ", passenger);
        if (!passenger) {
          return;
        }
        var title = [], content = [];
        var itemList = this.data.passengerSelect.itemList;
        var idCardItemList = this.data.passengerSelect.idCardTypeList;
        var name = [];
        var ch_en_name = false;//中英切换。
        var eName = "";
        var hasCName = false, hasEName = false;
        var mobile = "";
        var hasMobile = false;
        var address = "";
        var hasAddress = false;
        var email = "";
        var hasEmail = false;
        content[0]="";
        name[0]="";
        if (itemList && itemList.length>0) {
            for (var i=0; i<itemList.length; i++) {
              var item = itemList[i];
              if (item) {
                  switch (item.type+"") {
                      case "name":
                          //TODO
                          ch_en_name = true;
                          break;
                      case "cName":
                          hasCName = true;
                          break;
                      case "eName":
                          hasEName = true;
                          if (Util.isTxtNotEmpty(passenger.eName)) {
                              eName = passenger.eName;
                          } else if (Util.isTxtNotEmpty(passenger.firstName)&& Util.isTxtNotEmpty(passenger.lastName)) {
                              eName = passenger.firstName + " "+ passenger.lastName;
                          }
                          break;
                      case "mobile":
                          if (Util.isTxtNotEmpty(passenger.mobile)) {
                              mobile = passenger.mobile;
                          }
                          hasMobile = true;
                          break;
                      case "email":
                          if (Util.isTxtNotEmpty(passenger.email)) {
                              email = passenger.email;
                          }
                          hasEmail = true;
                          break;
                      default:
                          break;
                  }
              }
            }
        }
        if (ch_en_name) {
            if (Util.isTxtNotEmpty(passenger.cName)) {
              if (name.length == 1 && name[0]=="") {
                name[0]=passenger.cName;
              } else {
                name.push(passenger.cName);
              }
            }
            if (Util.isTxtNotEmpty(passenger.eName)) {
                eName = passenger.eName;
                if (name.length == 1 && name[0]=="") {
                  name[0]=eName;
                } else {
                  name.push(eName);
                }
            } else if (Util.isTxtNotEmpty(passenger.firstName) && Util.isTxtNotEmpty(passenger.lastName)) {
                passenger.eName = passenger.firstName + passenger.lastName;
                if (name.length == 1 && name[0]=="") {
                  name[0]=passenger.firstName + " "+ passenger.lastName;
                } else {
                  name.push(passenger.firstName + " "+ passenger.lastName);
                }
            }
            if (Util.isEmptyObject(name) && Util.isTxtNotEmpty(passenger.name)) {
              if (name.length == 1 && name[0]=="") {
                name[0]=passenger.name;
              } else {
                name.push(passenger.name);
              }
            }
        } else {
            if (Util.isTxtNotEmpty(passenger.cName) && hasCName) {
                if (name.length == 1 && name[0]=="") {
                  name[0]=passenger.cName;
                } else {
                  name.push(passenger.cName);
                }
                //英文
                if (Util.isTxtNotEmpty(eName) && hasEName) {
                    if (name.length == 1 && name[0]=="") {
                      name[0]=eName;
                    } else {
                      name.push(eName);
                    }
                }
            } else if (Util.isTxtNotEmpty(eName) && hasEName) {
              if (name.length == 1 && name[0]=="") {
                  name[0]=eName;
                } else {
                  name.push(eName);
                }
            }
        }
        title = name;//标题
        //证件 passenger.idCardName + " " + passenger.idCardNo\
        var idCard = "", idCardName = "";
        var hasID = false;
        var tempIdCardIndex = -1;
        for (var key in passenger) {
          for (var i = 0; i < idCardItemList.length; i++) {
            var idCardItem = idCardItemList[i];
            if (key == idCardItem.type) {
              //找到指定type的证件
              tempIdCardIndex = i;
              idCardName = idCardItem.name;
              break;
            }
          }
        }
        if (tempIdCardIndex>=0) {
          hasID = true;
          var type = idCardItemList[tempIdCardIndex].type;
          if (Util.isTxtNotEmpty(idCardName)) {
              idCard = idCard + idCardName;
          }
          if (Util.isTxtNotEmpty(passenger[type])) {
              idCard = idCard + " " + passenger[type];
          }
        }

        if (hasMobile && Util.isTxtNotEmpty(mobile)) {
            if (content.length == 1 && content[0] == "") {
              content[0] = mobile;
            } else {
              content.push(mobile);
            }
        }
        if (hasID && Util.isTxtNotEmpty(idCard)) {
            if (content.length == 1 && content[0] == "") {
              content[0] = idCard;
            } else {
              content.push(idCard);
            }
        }
        if (hasAddress && Util.isTxtNotEmpty(address)) {
            if (content.length == 1 && content[0] == "") {
              content[0] = address;
            } else {
              content.push(address);
            }
        }

        var passengerIndex = this.data.passengerSelect.passengerIndex;
        var resourceIndex = this.data.passengerSelect.resourceIndex;
        var passengerList = this.data.resourceFillInInfos[resourceIndex]._passengerList;
        if (passengerList && passengerList.length > passengerIndex) {
          if (passengerList[passengerIndex].passengerValue.isSetToContact == true &&
            !Util.isSameObject(passenger,passengerList[passengerIndex].passengerValue.passenger)) {
            passengerList[passengerIndex].passengerValue.isSetToContact = false;
          }
          passengerList[passengerIndex].passengerValue.title = title;
          passengerList[passengerIndex].passengerValue.content = content;
          passengerList[passengerIndex].passengerValue.passenger = passenger;
          passengerList[passengerIndex].isValueNotEmpty = this.isPassengerValueNotEmpty(passengerList[passengerIndex])
        }
        __wxConfig.debug && console.log("fillinorder passengerList = ", passengerList)
        this.setData({
          resourceFillInInfos:this.data.resourceFillInInfos,
          passengerSelect:{
            "resourceIndex":-1,
            "passengerIndex":-1,
            "chooseContact":false,
            "itemList":[],
            "idCardTypeList":[],
          },
          selectedPassenger:{}
        })
      },
      updatePassengerData:function(){
        var passenger = this.data.selectedPassenger,
            resourceIndex = 0;
        if (Util.isEmptyObject(passenger)) {
          this.setData({
            passengerSelect:{
              "resourceIndex":-1,
              "passengerIndex":-1,
              "chooseContact":false,
              "itemList":[],
              "idCardTypeList":[],
            },
          });
          return;
        }
        if(this.data.isPassengersEmpty) {
          this.setData({
            isPassengersEmpty:false
          })
        }
        if (this.data.passengerSelect.chooseContact) {
          this.setPassengerToContact(passenger);
        } else if (this.data.passengerSelect.passengerIndex >= 0 &&
          this.data.passengerSelect.resourceIndex>=0) {
          this.setResourcePassengerData(passenger);
        }
      },
      updateExpandInfoData:function(){
        var expandInfo = this.data.seletedExpandInfos,
            resourceIndex = 0;
        __wxConfig.debug && console.log("updateExpandInfoData expandInfo  = ", expandInfo);
        if (Util.isEmptyObject(expandInfo)) {
          this.setData({
            expandInfoSelect:{
            "resourceIndex":-1,
            "expandInfoTypeId":-1,
            },
          })
          return;
        }
        var expandInfoIndex = -1;
        var resourceIndex = this.data.expandInfoSelect.resourceIndex;
        for (var i = 0; i < this.data.resourceFillInInfos[resourceIndex].expandInfos.length; i++) {
          var tempExpandInfo = this.data.resourceFillInInfos[resourceIndex].expandInfos[i];
          if (tempExpandInfo.typeId == this.data.expandInfoSelect.expandInfoTypeId) {
            expandInfoIndex = i;
            break;
          }
        }
        __wxConfig.debug && console.log("updateExpandInfoData expandInfoIndex  = ", expandInfoIndex);
        if (expandInfoIndex >= 0) {
          this.data.resourceFillInInfos[resourceIndex].expandInfos[expandInfoIndex]=expandInfo;
          this.formateExpandInfo();
          this.setData({
            resourceFillInInfos:this.data.resourceFillInInfos,
            expandInfoSelect:{
              "resourceIndex":-1,
              "expandInfoTypeId":-1,
            },
            seletedExpandInfos:{}
          });
        } else {
          this.setData({
            expandInfoSelect:{
              "resourceIndex":-1,
              "expandInfoTypeId":-1,
            },
            seletedExpandInfos:{}
          });
        }
      },
      onReady:function(){
        // 页面渲染完成
      },
      onShow:function(){
        // 页面显示
        __wxConfig.debug && console.log("onShow data = ", this.data)
        this.updateExpandInfoData();//附加信息选择后
        this.updatePassengerData();//常旅列表选择后:常旅, 联系人选择数据返回
      },
      onHide:function(){
        // 页面隐藏
      },
      onUnload:function(){
        // 页面关闭
      }
    })
})(__overwrite.require(require, __dirname), __overwrite.Page);