// pages/search/search.js
var __dirname = "components/place-search/page";
var listurl = "pages/list/list?";
var detailurl = "pages/detail/detail?";
var __overwrite = require("../../../utils/overwrite.js");

var TICKET_SEARCH_HISTORY_STORAGE_KEY = "wx-ticket-search-history-storage-key";
var tabNames = ["history", "scenic", "theme"];
var dataTypes = ["","城市","景点","主题",""];// ThemeType = 3, CityType = 1, ScenicType = 2, KeywordType= 4

(function(require, Page) {
    var api = require("utils/api")(__dirname);
    var SearchService = require("service/placesearch"),
    Util = require('utils/util'),
    app = getApp();

    function getHistoryByCityId(cityId, callback) {
        api.Storage.get({
            key: TICKET_SEARCH_HISTORY_STORAGE_KEY,
            success: function(result) {
                var list = result.data || [];
                callback(list);
            },
            fail: function(e) {
                callback([]);
            }
        });
    }

    function getHistory(callback) {
        api.Storage.get({
            key: TICKET_SEARCH_HISTORY_STORAGE_KEY,
            success: function(result) {
                callback(result.data || []);
            },
            fail: function(e) {
                callback([]);
            }
        });
    }

    function addHistory(item, callback) {
        getHistory(function(list) {
            list = list.filter(function(_item) {
                return !(_item.hotDataId == item.hotDataId && _item.hotDataName == item.hotDataName && _item.hotDataType == item.hotDataType && _item.typeDesc == item.typeDesc);
            });
            list.unshift(item);
            api.Storage.set({
                key: TICKET_SEARCH_HISTORY_STORAGE_KEY,
                data: list,
                success: callback
            });
        });
    }

    function clearCityHistory(cityId, callback) {
        getHistory(function(list) {
            api.Storage.set({
                key: TICKET_SEARCH_HISTORY_STORAGE_KEY,
                data: [],
                success: callback
            });
        });
  }

  Page({
    data:{
      cityId:"36",//searchCityId
      currentCityId:'',
      currentCityName:'',
      currentLat: '',
      currentLng: '',
      currentIndex:0,
      tabPages:['scenic', 'theme'],//默认有热搜景点,热搜主题
      hotPageDataList:[],
      historyList:[],//搜索历史
      hotScenicList:[],//热搜景点
      hotTopicList:[],//热搜主题
      searchKey:"",
      maskShow:false,
      noresultShow: false,
      suggestDataList: [],
      locErrShow:false,
      locSuccess:false,//定位失败或者定位城市没有获取到
      dataTypes:["","城市","景点","主题",""],
      scrollHeight:667,
      fromPage:''
    },
    onLoad:function(options){
      // 页面初始化 options为页面跳转所带来的参数
      __wxConfig.debug && console.log("search onLoad options = ", options)
      var systemInfo = getApp().getAppSystemInfo()
      this.data.cityId = options.cityId||"36"
      this.data.searchTxt = options.searchTxt||""
      this.data.searchType = options.searchType || ""
      this.data.scrollHeight = systemInfo.windowHeight - 133
      this.data.fromPage = options.fromPage||''
      this.loadData()
    },
    loadData:function(){
      this.getLocationCity();
      this.setData({
          cityId: this.data.cityId,
          searchTxt: this.data.searchTxt,
          searchType: this.data.searchType,
          searchKey: "",
          scrollHeight:this.data.scrollHeight,
          fromPage:this.data.fromPage
      });
      this.loadHistory();
      this.loadHotDataByCityId(this.data.cityId);
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
    },
    loadHotDataByCityId: function(cityId) {
        var _this = this
        __wxConfig.debug && console.log("loadHotDataByCityId cityId = ", cityId)
        SearchService.GetHotData(cityId).then(function(data) {
            try {
                __wxConfig.debug && console.log("loadHotDataByCityId response data = ", data)
                var tempHotScenicList = [], tempHotTopicList = [];
                if(null != data) {
                    if(null!= data.hotScenicList && data.hotScenicList.length>0) {
                        tempHotScenicList = data.hotScenicList.splice(0,10);
                        _this.data.hotPageDataList.push(tempHotScenicList)
                    } else {
                        _this.data.hotPageDataList.push([]);
                    }
                    if(null!= data.hotTopicList && data.hotTopicList.length>0) {
                        tempHotTopicList = data.hotTopicList.splice(0,10);
                        _this.data.hotPageDataList.push(tempHotTopicList)
                    } else{
                        _this.data.hotPageDataList.push([]);
                    }
                }
                _this.setData({
                    hotScenicList:tempHotScenicList,
                    hotTopicList:tempHotTopicList,
                    hotPageDataList:_this.data.hotPageDataList
                });                
                __wxConfig.debug && console.log("loadHotDataByCityId data = ", _this.data);
            } catch (e) {
                __wxConfig.debug && console.log('获取搜索页热门数据失败');
            }
        }.bind(this));
    },
    changeSwiper:function(e){
        this.setData({
            currentIndex:e.detail.current,
        })
    },
    onTabClick:function(options){
      var index = 0;
      switch(options.target.dataset.param) {
        case "history":
          break;
        case "theme":
          if(this.data.historyList.length==0) {
            index = 1;
          } else {
            index = 2;
          }
          break;
        case "scenic":
          if(this.data.historyList.length==0) {
            index = 0;
          } else {
            index = 1;
          }
          break;
        default:
          break
      }
      this.setData({
        currentIndex:index
      })
    },
    searchNearby:function(){
        if(Util.isTxtNotEmpty(this.data.searchKey)) {
            this.searchTap()
            return
        }
        var searchObj = {
            "type": 5,
            "typeDesc":"30km"
        };
        if(this.data.fromPage == 'homepage') {
            this.searchGoto({
                type: "search",
                value: searchObj
            });
        } else {
            this.fireEvent('search',{
                type: "search",
                value: searchObj
            });
            api.Navigate.back();
        }
    },
    inputBind: function(e) {
        clearTimeout(this.searchTimer);
        __wxConfig.debug && console.log("inputBind e= ",e);
        this.searchTimer = setTimeout(function() {
            this.setData({
                searchKey: e.detail.value
            });
            if (!Util.isTxtNotEmpty(e.detail.value)) {
                this.setData({
                    noresultShow: false
                });
            } else {
                SearchService.Suggestion(e.detail.value, this.data.cityId).then(function(data) {
                  __wxConfig.debug && console.log("SearchPage suggestData = ", data);
                    if (data.suggestDataList && data.suggestDataList.length > 0) {
                        this.setData({
                            noresultShow: false,
                            suggestDataList: data.suggestDataList
                        });
                    } else {
                        this.setData({
                            noresultShow: true,
                            suggestDataList: []
                        });
                    }
                }.bind(this));
            }
        }.bind(this), 200);
    },
    inputTap: function() {
        this.setData({
            maskShow: true
        });
    },
    getLocationCity: function() {
        var _this = this;
        var qqMap = app.getQQMap();
        var _app = app;
        var lat, lng;
        api.Location.get({
            success: function(res) {
                __wxConfig.debug && console.log("search Location res = ", res)
                lat = res.latitude;
                lng = res.longitude;
                qqMap.reverseGeocoder({
                    location: {
                        latitude: res.latitude,
                        longitude: res.longitude
                    },
                    success: function(res) {
                        __wxConfig.debug && console.log(res);
                        //遍历城市解析出城市id
                        var currentCityName = res.result.address_component.city//北京市
                        var nation = res.result.address_component.nation//中国
                        if (nation && nation == '中国') {
                            _app.getSavedCityData(function(result){
                                if(result && result.data && !Util.isEmptyObject(result.data)) {
                                    var city = _this.getCityByName(currentCityName.replace(/市/,''), result.data.cityList);
                                    if(city && city.cityId) {
                                        _this.setData({
                                            currentCityName:currentCityName,
                                            locSuccess:true,
                                            currentCityId: city.cityId,
                                            currentCityName: city.cityName||'',
                                            currentLat: lat,
                                            currentLng: lng
                                        })
                                    } else {
                                        _this.setData({
                                            locSuccess:false,
                                            currentCityId: '',
                                            currentCityName: '',
                                            currentLat: '',
                                            currentLng: ''
                                        });
                                    }
                                }
                            })
                        } else {
                            //海外城市 不显示搜索附近景点
                            _this.setData({
                                locSuccess:false,
                                currentCityId: '',
                                currentCityName: currentCityName,
                                currentLat: '',
                                currentLng: ''
                            });
                        }
                    },
                    fail: function(res) {
                        __wxConfig.debug && console.log('fail','res = ' + res);
                        _this.setData({
                            locSuccess:false,
                            currentCityId: '',
                            currentCityName: '',
                            currentLat: '',
                            currentLng: ''
                        });
                    }
                });
            },
            fail: function(e) {
                _this.setData({
                    locSuccess:false,
                    currentCityId: '',
                    currentCityName: '',
                    currentLat: '',
                    currentLng: ''
                });
            }
        })
    },
    // 根据城市名获取城市信息
	getCityByName(name, cityList){
		if(Util.isTxtNotEmpty(name) && !Util.isEmptyObject(cityList)){
			let city;
            for(var index = 0; index < cityList.length;index++){
                var tempCityList = cityList[index].cityList;
                if(!Util.isEmptyObject(tempCityList)) {
                    for(var j = 0; j<tempCityList.length;j++){
                        if(Util.isTxtNotEmpty(tempCityList[j].cityName) && null != tempCityList[j].cityName.match(name)) {
                            return tempCityList[j];
                        }
                    }
                }
            }
		}
        return null;
	},
    searchTap: function() {
        var _this = this,
            _api = api;
        if (this.data.searchKey !== "") {
            var searchObj = {
                "itemId": "",
                "title": this.data.searchKey,
                "type": 4,
                "typeDesc": "关键词",
            };
            addHistory({"hotDataId":'',
                "hotDataName":this.data.searchKey,
                "hotDataType":4,
                "typeDesc":"关键词"}, function() {
                // this.loadHistory();
                if(_this.data.fromPage == 'homepage') {
                    _this.searchGoto({
                        type: "search",
                        value: searchObj
                    });
                } else {
                    _this.fireEvent('search',{
                        type: "search",
                        value: searchObj
                    });
                    _api.Navigate.back();
                }
            }.bind(this));
        }
    },
    loadHistory: function(cityId) {
        var _this = this
        getHistory(function(data) {
            var tempList = []
            if (data.length > 0) {
                 tempList = data.slice(0, data.length==10?10:data.length);
                _this.data.tabPages = ['history','scenic','theme'];
            } else {
                _this.data.tabPages = ['scenic','theme'];
            }
            this.setData({
                historyList: tempList,
                tabPages:_this.data.tabPages,
            });
        }.bind(this));
    },
    onItemClick:function(options){
      var _this = this,
          _api = api;
      __wxConfig.debug && console.log("onItemClick", options);
      addHistory(options.currentTarget.dataset.itemdata, function() {
      if(this.data.fromPage == 'homepage'||options.currentTarget.dataset.itemdata.hotDataType == 2) {
          _this.searchGoto({
            type: "itemData",
            value: options.currentTarget.dataset.itemdata
          });
      } else {
        _this.fireEvent('search',{
            type: "itemData",
            value: options.currentTarget.dataset.itemdata
        });
        _api.Navigate.back()
      }}.bind(this));
    },
    onSuggestItemClick:function(options){
      var _this = this,
          _api = api;
      __wxConfig.debug && console.log("onSuggestItemClick", options);
      let tempData = options.currentTarget.dataset.itemdata;
      addHistory({
          "hotDataId":tempData.itemId,
          "hotDataName":tempData.title,
          "hotDataType":tempData.type,
          "typeDesc":tempData.typeDesc
      }, function() {
        if(_this.data.fromPage == 'homepage'||tempData.type == 2) {
            _this.searchGoto({
                type: "suggest",
                value: tempData
            });
        } else {
            _this.fireEvent('search',{
                type: "suggest",
                value: tempData
            });
            _api.Navigate.back()
        }
      }.bind(this));
    },
    onMaskClick:function(){
        this.setData({
            maskShow:false
        })
    },
    onClearHistoryClick:function(){
        var _this = this;
        __overwrite.alert({
            content: "是否清除所有搜索历史",
            cancelText: "取消",
            confirmText: "确认",
            bindcancel: function() {
            },
            bindconfirm:function(){
                clearCityHistory("", function(){
                    this.setData({
                        currentIndex:0,
                        historyList: [],
                        tabPages:['scenic','theme'],
                    });
                }.bind(_this));
            }
        });
    },
    //搜索页跳转逻辑
    searchGoto:function(data){
      var _this = this;
      var _api = api, tempKeywords;
      switch(data.type){
            case "itemData":
            tempKeywords = {
                "type":"itemData",
                "data":{
                    "id":data.value.hotDataId||"",
                    "title":data.value.hotDataName||"",
                    "type":data.value.hotDataType||"",
                    "typeDesc":data.value.hotDataTypeDesc||"",
                    "tag":data.value.tag||""
                }
            };
            break;
            case "search":
            case "suggest":
            tempKeywords = {
                "type":data.type,
                "data":{
                    "id":data.value.itemId||"",
                    "title":data.value.title||"",
                    "type":data.value.type||"",
                    "typeDesc":data.value.typeDesc||"",
                    "tag":data.value.tag||""
                }
                };
            break;
            default:
            break;
      }
      if (tempKeywords && !Util.isEmptyObject(tempKeywords)) {
        var item = tempKeywords.data;
        if(item){
            //景点,跳转景点详情 type 1:城市id 2:景点id 3:主题 4:特殊关键词（营销标签）5:附近
            if(item.type == 2){
                _api.Navigate.redirectTo({
                    url: detailurl+'sceneryId='+item.id
                });
            } else {
                var itemJsonStr = JSON.stringify(item);
                _api.Navigate.redirectTo({
                    url: listurl+'item='+itemJsonStr+'&homeSearch=true'+"&currentCityId="+_this.data.currentCityId+"&searchCityId="+_this.data.cityId
                });
            }
        }
      }
    },
  });
})(__overwrite.require(require, __dirname), __overwrite.Page);