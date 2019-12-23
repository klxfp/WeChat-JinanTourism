var __dirname = "components/city-selector/page";
var __overwrite = require("../../../utils/overwrite.js");
var CHINA_CITY_SELECT_HISTORY_STORAGE_KEY = "wxxcx-ticket-china-city-select-history-storage-key";
var OVERSEAS_CITY_SELECT_HISTORY_STORAGE_KEY = "wxxcx-ticket-overseas-city-select-history-storage-key";
var CITY_DATA = "wxxcx-ticket-city-data-key";

// 为数据分段，3个一段
function subsection(list) {
    if (list && list.length>0) {
        return new Array(Math.ceil(list.length / 3) + 1).join("|").split("").map(function(item, index) {
            var items = list.slice(index * 3, index * 3 + 3);
            var count = items.length;
            if (count !== 3) {
                items.length = 3;
                for (; count < 3; count++) {
                    items[count] = null;
                }
                //items.fill(null, count, 3);
            }
            return items;
        });
    } else {
        return [];
    }
}

(function(require, Page) {
    var api = require("utils/api")(__dirname);
    var Util = require("utils/util");
    var CityService = require("service/city");
    var _dadian = require("utils/spot-click");
    var app = getApp();

    function getHistory(saveKey,callback) {
        api.Storage.get({
            key: saveKey,
            success: function(result) {
                callback(result.data.slice(0, 3) || []);
            },
            fail: function(e) {
                callback([]);
            }
        });
    }

    function addHistory(item, saveKey, callback) {
        getHistory(saveKey, function(list) {
            list = list.filter(function(_item) {
                return _item.cityId !== item.cityId;
            });
            list.unshift(item);
            api.Storage.set({
                key: saveKey,
                data: list.slice(0,3),
                success: callback
            });
        });
    }

    Page({
        data: {
            title: "",
            scrollViewHeight:667,
            headers:[[],[]],
            historys:[[],[]],
            pageDataList:[{
                cityList:[],
                hotCityList:[]
            },{
                cityList:[],
                hotCityList:[]
            }],
            searchKey: "",
            maskShow:false,
            maskHeight:667,
            currentIndex:0,
            suggestItems: [],//city suggest
            selectedCityId: 0,
            scrollTop: 0,
            toView: '',
            locSuccess:false,//定位是否成功
            address:'',
            currentLat: '',
            currentLng: ''
        },
        onLoad: function(options) {
            var _this = this
            var systemInfo = getApp().getAppSystemInfo()
            _this.data.scrollViewHeight = systemInfo.windowHeight-90;
            _this.data.maskHeight = systemInfo.windowHeight-45
            this.data.headers[0].push("当前")
            this.setData({
                title: options.title || "选择城市",
                selectedCityId: options.cityId,
                maskHeight:this.data.maskHeight,
                scrollViewHeight:this.data.scrollViewHeight
            });
            this.getLocationAddress();
            this.loadHistory();
            this.loadCityData();
        },
        onReady: function() {
            api.NavigationBar.setTitle({
                title: this.data.title
            });
        },
        onShow: function() {
            // _dadian.DADIAN("selectCity");
        },
        onRefreshLocation:function(){
            if(this.data.locSuccess) {
                return
            }
            this.getLocationAddress();
        },
        getLocationAddress: function() {
            var _this = this;
            var qqMap = app.getQQMap();
            var _app = app;
            var lat, lng;
            api.Location.get({
                success: function(res) {
                    __wxConfig.debug && console.log("city Location res = ", res)
                    lat = res.latitude;
                    lng = res.longitude;
                    qqMap.reverseGeocoder({
                        location: {
                            latitude: res.latitude,
                            longitude: res.longitude
                        },
                        success: function(res) {
                            __wxConfig.debug && console.log(res);
                            _this.setData({
                                locSuccess:true,
                                address:res.result.address,
                                currentLat: lat,
                                currentLng: lng
                            });
                        },
                        fail: function(res) {
                            __wxConfig.debug && console.log('fail','res = ' + res);
                            _this.setData({
                                locSuccess:false,
                                address:'',
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
        loadHistory: function(saveKey) {
            var _this = this
            if(saveKey && saveKey != "") {
                getHistory(saveKey, function(data) {
                    _this.data.historys[saveKey==OVERSEAS_CITY_SELECT_HISTORY_STORAGE_KEY?1:0] = subsection(data);
                    _this.setData({
                        historys: this.data.historys
                    });
                }.bind(this));
            } else {
                getHistory(CHINA_CITY_SELECT_HISTORY_STORAGE_KEY, function(data) {
                    if(data && data.length>0) {
                        if(_this.data.headers[0][1] !="历史") {
                            _this.data.headers[0].splice(1,0,"历史")
                        }
                    } else {
                        if(_this.data.headers[0][1] =="历史") {
                           _this.data.headers[0] = _this.data.headers[0].splice(2,_this.data.headers[0].length-1)
                           _this.data.headers[0].unshift("当前")
                        }
                    }
                    _this.data.historys[0] = subsection(data);
                    _this.setData({
                        headers:_this.data.headers,
                        historys: _this.data.historys
                    });
                }.bind(this));
                getHistory(OVERSEAS_CITY_SELECT_HISTORY_STORAGE_KEY, function(data) {
                    if(data && data.length>0) {
                        if(_this.data.headers[1][0] !="历史") {
                            _this.data.headers[1].splice(0,0,"历史")
                        }
                    } else {
                        if(_this.data.headers[1][0] =="历史") {
                           _this.data.headers[1] = _this.data.headers[1].splice(1,_this.data.headers[1].length-1)
                        }
                    }
                    _this.data.historys[1] = subsection(data);
                    _this.setData({
                        headers:_this.data.headers,
                        historys: _this.data.historys
                    });
                }.bind(this));
            }
        },
        clearHistory: function(e) {
            var _this = this;
            var isChina = e.currentTarget.dataset.ischina;
            let cityKey = isChina ?CHINA_CITY_SELECT_HISTORY_STORAGE_KEY:OVERSEAS_CITY_SELECT_HISTORY_STORAGE_KEY;
            api.Storage.set({
                key: cityKey,
                data: [],
                success: function() {
                    _this.loadHistory();
                }.bind(this)
            });
        },
        getCityDataFromServer:function(){
            var _app = app;
            var _this = this
            CityService.GetCityData().then(function(data) {
                _app.saveCityData(data);
                _this.setCityData(data);
            }.bind(this));
        },
        setCityData:function(data){
            var _this = this
            this.data.pageDataList[0].cityList = data.cityList||[];
            if(data.hotCityList && data.hotCityList.length>0) {
                _this.data.headers[0].push("热门")
            }
            data.cityList && data.cityList.map(function(cityInfo){
                if(cityInfo && cityInfo.cityList && cityInfo.cityList.length>0 && cityInfo.key && cityInfo.key.length>0) {
                    _this.data.headers[0].push(cityInfo.key)
                }
            });
            this.data.pageDataList[0].hotCityList = subsection(data.hotCityList||[]);
            this.data.pageDataList[1].cityList = data.overseasCityList||[];
            if(data.overseasHotCityList && data.overseasHotCityList.length>0) {
                _this.data.headers[1].push("热门")
            }
            data.overseasCityList && data.overseasCityList.map(function(cityInfo){
                if(cityInfo && cityInfo.cityList && cityInfo.cityList.length>0 && cityInfo.key && cityInfo.key.length>0) {
                    _this.data.headers[1].push(cityInfo.key)
                }
            });
            this.data.pageDataList[1].hotCityList = subsection(data.overseasHotCityList||[]);
            this.setData({
                pageDataList:_this.data.pageDataList,
                headers:this.data.headers
            })
        },
        loadCityData: function() {
            var _this = this;
            app.getSavedCityData(function(result){
                if(Util.isEmptyObject(result)||(Util.isEmptyObject(result.data.cityList)&&
                    Util.isEmptyObject(result.data.overseasCityList))) {
                    _this.getCityDataFromServer();
                } else {
                    _this.setCityData(result.data);
                }
            });
        },
        afterSelectCity:function(city, isChinaCity){
            var _this = this,
                _api = api;
            let cityKey = isChinaCity?CHINA_CITY_SELECT_HISTORY_STORAGE_KEY:OVERSEAS_CITY_SELECT_HISTORY_STORAGE_KEY;
            addHistory(city,cityKey , function() {
                Util.saveCurrentSelectCity(_api, city)
            });
            //城市选择之后todo
            this.fireEvent("select", {
                type: "city",
                value: city
            });
            api.Navigate.back();
        },
        selectCity: function(e) {
            this.afterSelectCity(e.currentTarget.dataset.city, e.currentTarget.dataset.ischina);
        },
        inputBind: function(e) {
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(function() {
                this.setData({
                    searchKey: e.detail.value
                });
                if (e.detail.value === "") {
                    this.setData({
                        noresultShow: false
                    });
                } else {
                    CityService.CitySuggest(e.detail.value).then(function(data) {
                    __wxConfig.debug && console.log("CityPage suggestData = ", data);
                        if (data.cityList && data.cityList.length > 0) {
                            this.setData({
                                noresultShow: false,
                                suggestItems: data.cityList
                            });
                        } else {
                            this.setData({
                                noresultShow: true,
                                suggestItems: []
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
        changeSwiper:function(e){
            this.setData({
            currentIndex:e.detail.current
            })
        },
        onMaskClick:function(){
            this.setData({
                maskShow:false
            })
        },
        onTabClick:function(options){
            this.setData({
                currentIndex:options.target.dataset.param == "overseaCity"?1:0,
            })
        },
        onSuggestItemClick:function(options){
            var isChinaCity = true;
            var city = options.currentTarget.dataset.itemdata;
            city.cityName = city.cityName.split(",")[0]
            __wxConfig.debug && console.log("onSuggestItemClick city = ", city);
            this.data.pageDataList[1].cityList.map(function(item){
                if(item && item.cityList && item.cityList.length>0) {
                    for(let index = 0; index < item.cityList.length; index++) {
                        if(item.cityList[index].cityId == city.cityId) {
                            isChinaCity = false;
                            return;
                        }
                    }
                    
                }
            });
            this.afterSelectCity(city, isChinaCity);
        },
        scroll: function() {
        },
        onHeaderSelect:function(options){
            __wxConfig.debug && console.log("onHeaderSelect options = ", options)
            switch(options.currentTarget.dataset.key){
                case "当前":
                    this.setData({
                        toView:'location'
                    })
                    break;
                case "历史":
                    this.setData({
                        toView:'history'
                    })
                    break;
                case "热门":
                    this.setData({
                        toView:'hot'
                    })
                    break;
                default:
                    this.setData({
                        toView:options.currentTarget.dataset.key
                    })
                    break;
            }
        }
    });
})(__overwrite.require(require, __dirname), __overwrite.Page);
