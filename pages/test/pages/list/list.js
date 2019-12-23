var __dirname = "pages/list";
var __overwrite = require("../../utils/overwrite.js");
(function (require, Page) {
    var api = require("../../utils/api.js")(__dirname),
        util = require("../../utils/util.js"),
        ListService = require("service/list"),
        Sort = require("../list/sort/index"),
        Theme = require("../list/theme/index"),
        Filter = require("../list/filter/filter"),
        SearchPlugin = require('components/place-search/index'),
        mRefreshData = false;
    Page({
        data: {
            isFirst: true,
            sortShow: false,
            scrollViewHeight: '571',
            filterShow: false,
            locShow: false,
            initFilterDesc: '',
            toView: '',
            scrollTop:0,
            words: '',
            currentCityId: "36",//当前定位城市id
            lat: "39.90403",
            lng: "116.407526",
            searchCityId: "36",//选择城市id
            currentPageIndex: 0,
            imageSize: '4',
            topicDesc: '主题筛选',
            orderDesc: '排序',
            orderDescDefault: '排序',
            distanceDesc: '距离',
            //搜索相关数据
            cityInfo: {
                cityId: "",
                cityName: ""
            },
            keywords: {
                "type": "",
                "data": {}
            },
            isSearch: false,//用于判断是否为搜索关键字,区分搜索无结果
            searchType: 2,//搜索类型 1：关键字 2：city 3：周边城市搜索 4：多景点id
            page: {
                pageIndex: 0,
                pageSize: 20
            },
            currentFilterList: [],
            distanceFilterList: [],
            localHotScenicList: [],
            nearbyScenicList: [],
            selectedOrderFilter: [],
            selectedTopicFilter: [],
            orderFilterList: [],
            productList: [],
            showSpecialSale: true,
            specialSaleSelected: 0,//是否选中特价 0未选1选中
            surroundingCityList: [],
            todayAvailable: 0,
            topicFilterList: [],
            surroundingCityFilterList: [],
            totalCount: 0,
            activeFilterTab: '',
            hasSelectedTab: {
                filterTab: "",
                areaTab: "",
                sortTab: "",
                pricestarTab: ""
            },
            sortTabText: '排序',
            themeTabText: '主题筛选',
            filterTabText: '距离',
            getListType: -1, // -1:全部；0，周边城市；2：附近
        },
        getLocation: function () {
            var _this = this;
            wx.getLocation({
                type: 'wgs84',
                success: function (res) {
                    __wxConfig.debug && console.log('定位成功', res);
                    _this.setData({
                        lat: res.latitude,
                        lng: res.longitude
                    });
                },
                fail: function () {

                }
            });
        },
        onLoad: function (options) {
            //处理别的页面传递过来的数据
            __wxConfig.debug && console.log("list onLoad options = ", options)
            var _this = this;
            mRefreshData = false
            this.getLocation();
            this.setData({
                currentCityId: options.currentCityId || this.data.currentCityId,
                searchCityId: options.searchCityId || this.data.searchCityId,
                //   nearbyMore:
            })
            //首页选择主题
            if (options.topicFilterList) {
                var topics = JSON.parse(options.topicFilterList);
                var desc=0;
                var filterid;
                var filterText;
                topics.map(function(item){
                    desc+=Number(item.filterId);
                    if(item.isSelected == 1){
                        filterid = item.filterId;
                        filterText = item.filterDesc;
                    }
                });
                var filtertopic = [{
                    "isSelected":1,
                    "filterDesc":desc,
                    "filterId":filterid,
                    "filterType":3}];
                this.setData({
                    selectedTopicFilter: filtertopic,
                    themeTabText: filterText,
                    // keywords: {
                    //     "type": "",
                    //     "data": {
                    //         "title": filterText
                    //     }
                    // },
                    // words: '1'
                });
                this.addSelectedTab("themeTab", [1]);
            }
            //首页选择周边
            if (options.homeSurroundFilter) {
                var surroundingcity = JSON.parse(options.homeSurroundFilter);
                this.setData({
                    surroundingCityFilterList: JSON.parse(options.homeSurroundFilter) || [],
                    searchType: 3,
                    getListType: 0
                });
            }
            // 附近更多
            if (options.nearbyMore) {
                let params = JSON.parse(options.nearbyMore);
                this.setData({
                    distanceFilterList: params || [],
                    getListType: 1,
                    selectedOrderFilter: [{ "filterId": "6", "filterDesc": "距离从近到远", "isSelected": 1 }],
                    filterTabText: "30km",
                    sortTabText: "距离从近到远",
                    saerchType: 2,
                    surroundingCityFilterList: []
                });
                this.addSelectedTab("filterTab", [1]);
                this.addSelectedTab("sortTab", [1]);
            }
            if (options.homeSearch && JSON.parse(options.item)) {
                var item = { data: JSON.parse(options.item) };
                this.searchTypeCallBack(item);
            } else {
                this.getSceneryList();
            }
        },
        //滚动事件
        onScroll:function(e){
            this.setData({
                scrollTop:e.detail.scrollTop,
            })
        },
        onShow: function () {
            this.closeOtherFilter();
        },
        onReady: function () {
            this.setScrollViewHeight();
        },
        setScrollViewHeight: function () {
            var _this = this;
            _this.setData({
                scrollViewHeight: getApp().getAppSystemInfo().windowHeight - 134
            });
        },
        formatParam: function (param) {
            param = param ? param.filter(function (e) { return e.isSelected == 1 }) : [];
            return param;
        },
        //拼接列表页参数
        getListParams: function () {
            //公共参数
            var params = {
                page: {
                    pageIndex: 0,
                    pageSize: 20
                },
                imageSize: 4
            };
            var searchObj = {};
            //临时使用，后期要改
            var filterParams = {
                "currentCityId": this.data.currentCityId,
                "keyword": this.data.keywords.data.title || "",
                "lat": this.data.lat,
                "lng": this.data.lng,
                "searchCityId": this.data.searchCityId,
                "searchType": this.data.searchType,
                "showDistanceFilter": this.showNearBy(),//待处理 --据您/距市中心
                "specialSaleSelected": this.data.specialSaleSelected,
                "distanceFilterList": this.formatParam(this.data.distanceFilterList),
                "orderFilterList": this.data.selectedOrderFilter,
                "todayAvailable": this.data.todayAvailable,
                "topicFilterList": this.data.selectedTopicFilter,
                "surroundingCityFilterList": this.formatParam(this.data.surroundingCityFilterList)
            };
            searchObj = Object.assign({}, params, filterParams);
            return searchObj;
        },
        //处理后端返回productList数据
        productListFormat: function (productList) {
            var _this = this;
            if (!productList || productList.length == 0) return [];
            productList.map(function (item) {
                item.showPrice = util.formatePrice(item.currentPrice);
                item.city = _this.cutStr(item.scenicCity, 4);
                item.level = Number(item.scenicLevel);
                item.showOriginalPrice = util.formatePrice(item.originalPrice);
                item.biao = item.topicList != undefined && _this.isEqual(item.topicList, _this.data.initFilterDesc);
                if(util.isTxtNotEmpty(item.scenicDesc)) {
                    item.scenicDesc = item.scenicDesc.replace(/[\r\n]/g, "");
                }
                return item;
            });
            return productList;
        },
        showNearBy: function () {
            return (this.data.searchCityId == this.data.currentCityId) && Number(this.data.lat) != 0 && Number(this.data.lng) != 0;
        },
        //处理筛选topicList显示逻辑
        isEqual: function (arrTopList, objFilterDesc) {
            for (var i = 0; i < arrTopList.length; i++) {
                if (objFilterDesc === arrTopList[i]) {
                    return objFilterDesc;
                }
            }
            return arrTopList[0];
        },
        //异步获取门票列表
        getSceneryList: function () {
            var params = this.getListParams(),
                _this = this;
            ListService.SceneryList(params).then(function (data) {
                var resData = util.objectClone(data);
                if (resData) {
                    resData.topicFilterList && resData.topicFilterList.map(function (item) {
                        if (item.isSelected == 1) {
                            _this.setData({
                                initFilterDesc: item.filterDesc
                            });
                        }
                    });
                }
                var cityList = data.surroundingCityFilterList;
                _this.setData({
                    currentPageIndex: data.currentPageIndex,
                    orderFilterList: data.orderFilterList,
                    distanceFilterList: data.distanceFilterList,
                    nearbyScenicList: data.nearbyScenicList,
                    productList: _this.productListFormat(data.productList),
                    specialSaleSelected: data.specialSaleSelected,
                    surroundingCityList: data.surroundingCityList,
                    todayAvailable: data.todayAvailable,
                    topicFilterList: data.topicFilterList,
                    totalCount: data.totalCount,
                    localHotScenicList: data.localHotScenicList,
                    surroundingCityFilterList: cityList,
                    showSpecialSale: data.showSpecialSale,
                    isFirst: false,
                    page: {
                        "pageIndex": 0,
                        "pageSize": 20
                    }
                });
                _this.stopRefresh()
                //首页周边城市为空特殊处理
                if (_this.data.getListType == 0 && cityList.length != 0 && !_this.isSelectedInDis()) {
                    var text = '';
                    data.surroundingCityFilterList.map(function (item) {
                        if (item.isSelected == 1) {
                            text += item.filterDesc;
                        }
                    });
                    _this.setData({
                        'filterTabText': text == '' ? '距离' : _this.cutStr(text, 3),
                    });
                    text == '' ? _this.addSelectedTab("filterTab", []) : _this.addSelectedTab("filterTab", [1]);
                    if(text == '不限'){
                      _this.setData({filterTabText:'距离'});
                      _this.addSelectedTab("filterTab", []);
                    }
                }
            }.bind(this), function (err) {
                __overwrite.alert({
                    content: "接口调用失败，请重试",
                    complete: function () {
                        api.Navigate.back();
                    }
                });
            });
        },
        isSelectedInDis:function(){
          return this.data.distanceFilterList.some(function(item){
            return item.isSelected == 1;
          });
        },
        //搜索框点击跳转跳转
        searchClick: function () {
            var _this = this, tempKeywords;
            SearchPlugin({
                cityId: this.data.searchCityId,
                searchTxt: this.data.keywords.data.title || '',
                searchType: this.data.keywords.data.type || ''
            }, function (data) {
                __wxConfig.debug && console.log("list searchCallbackData = ", data);
                switch (data.type) {
                    case "itemData":
                        tempKeywords = {
                            "type": "itemData",
                            "data": {
                                "id": data.value.hotDataId || "",
                                "title": data.value.hotDataName || "",
                                "type": data.value.hotDataType || "",
                                "typeDesc": data.value.hotDataTypeDesc || "",
                                "tag": data.value.tag || ""
                            }
                        };
                        _this.searchTypeCallBack(tempKeywords);
                        break;
                    case "search":
                    case "suggest":
                        tempKeywords = {
                            "type": data.type,
                            "data": {
                                "id": data.value.itemId || "",
                                "title": data.value.title || "",
                                "type": data.value.type || "",
                                "typeDesc": data.value.typeDesc || "",
                                "tag": data.value.tag || ""
                            }
                        };
                        _this.searchTypeCallBack(tempKeywords);
                        break;
                    default:
                        break;
                }
            });
        },
        searchTypeCallBack: function (options) {
            var _this = this;
            var _api = api, item = options.data;
            __wxConfig.debug && console.log('search item', item);
            __wxConfig.debug && console.log("list searchTypeCallBack options =", options);
            if (item) {
                //城市搜索
                if (item.type == 1) {
                    this.setData({
                        searchCityId: item.id,
                        distanceFilterList: [],
                        surroundingCityFilterList: [],
                        searchType: 2,
                        keywords: options,
                        words: '1'
                    });
                    this.clearTopicFilter();
                    this.clearOrderFilter();
                    this.clearDisSurFilter();
                    this.getSceneryList();
                    this.backTop();
                }
                //景点,跳转景点详情
                else if (item.type == 2) {
                    _api.Navigate.redirectTo({
                        url: '../detail/detail?sceneryId=' + item.id
                    });
                }
                // 主题搜索
                else if (item.type == 3) {
                    var newItem = {
                        filterId: item.id,
                        filterDesc: item.title,
                        isSelected: 1
                    };
                    this.updateCurrentFilterList2(newItem, 3);
                    this.clearTopicFilter();
                    this.clearOrderFilter();
                    this.clearDisSurFilter();
                    var totleFilterId = 0;
                    if (this.data.topicFilterList.length) {
                        this.data.topicFilterList.map((item, index) => {
                            totleFilterId += Number(item.filterId);
                        });
                    } else {
                        totleFilterId = Number(item.filterId);
                    }
                    this.setData({
                        distanceFilterList: [],
                        surroundingCityFilterList: [],
                        selectedTopicFilter: [{
                            filterId: item.id,
                            filterDesc: totleFilterId > 0 ? totleFilterId : item.title,
                            isSelected: 1
                        }],
                        searchType: 2,
                        themeTabText: item.title,
                        themeTabSt: '',
                        toView: 'top',
                        preventScroll: '',
                        topicFilterList: this.data.topicFilterList
                    });
                    this.addSelectedTab("themeTab", [1]);
                    this.getSceneryList();
                    this.backTop();
                }
                //关键词搜索
                else if (item.type == 4 && item.title) {
                    this.setData({
                        distanceFilterList: [],
                        surroundingCityFilterList: [],
                        searchType: 1,
                        keywords: options,
                        words: '1'
                    });
                    this.clearTopicFilter();
                    this.clearOrderFilter();
                    this.clearDisSurFilter();
                    this.getSceneryList();
                } else if (item.type == 5) {
                    //附近搜索30km
                    var newItem = {
                        filterId: "30",
                        filterDesc: "30km",
                        isSelected: 1
                    };
                    this.updateCurrentFilterList2(newItem, 1);
                    this.clearOrderFilter();
                    this.clearDisSurFilter();
                    this.setData({
                        distanceFilterList: [{
                            filterDesc: "30km",
                            filterId: "30",
                            isSelected: 1
                        }],
                        surroundingCityFilterList: [],
                        selectedOrderFilter: [{
                            filterId: "6",
                            filterDesc: "距离从近到远",
                            isSelected: 1
                        }],
                        searchType: 2,
                        isSearch: false,
                        sortTabText: "距离从近到远",
                        distanceDesc: '30km',
                        filterTabText: this.cutStr('30km', 4)
                    });
                    this.addSelectedTab("filterTab", [1]);
                    this.addSelectedTab("sortTab", [1]);
                    this.clearTopicFilter();
                    this.getSceneryList();
                }
            }
        },
        clearTopicFilter: function () {
            this.setData({
                selectedTopicFilter: [{ "filterDesc": "不限", "filterId": "0", "isSelected": 1 }],
                themeTabText: '主题筛选'
            });
            this.addSelectedTab("themeTab", []);
        },
        clearOrderFilter: function () {
            this.setData({
                selectedOrderFilter: [],
                sortTabText: '排序'
            });
            this.addSelectedTab("sortTab", []);
        },
        clearDisSurFilter: function () {
            this.setData({
                surroundingCityFilterList:[],
                distanceFilterList:[],
                filterTabText: '距离',
                wxc1:'',
                wxc2:'',
                todayAvailable:0,
                specialSaleSelected:0
            });
            this.addSelectedTab("filterTab", []);
        },
        updateCurrentFilterList2: function (targetItem, filterType) {
            if (!targetItem) {
                return;
            };
            var tempCurrentFilterList = [];
            targetItem.filterType = filterType;
            if (this.data.currentFilterList && this.data.currentFilterList.length > 0) {
                var num = 0;
                this.data.currentFilterList.map((item, index) => {
                    if (item.filterType == filterType) {
                        num++;
                        tempCurrentFilterList.push(targetItem);
                    } else {
                        tempCurrentFilterList.push(item);
                    }
                });
                if (num == 0) {
                    tempCurrentFilterList.push(targetItem);
                }
            } else {
                tempCurrentFilterList.push(targetItem);
            }
            this.setData({
                currentFilterList: tempCurrentFilterList
            });
        },
        order: function () {
            this.setData({ wxc1: this.data.todayAvailable == 0 ? 'wxc' : '', todayAvailable: this.data.todayAvailable == 1 ? 0 : 1, 'toView': 'top' });
            this.getSceneryList();
        },
        sale: function () {
            if (!this.data.showSpecialSale) return;
            this.setData({ wxc2: this.data.specialSaleSelected == 0 ? 'wxc' : '', specialSaleSelected: this.data.specialSaleSelected == 1 ? 0 : 1, 'toView': 'top' });
            this.getSceneryList();
        },
        //关闭其它筛选项
        closeOtherFilter: function () {
            var activeFilterStr = (this.data.activeFilterTab === 'area') ? 'filter1' : (this.data.activeFilterTab + '1');
            var currentComponent = this.components[activeFilterStr];
            currentComponent && currentComponent.close();
        },
        cutStr: function (str, len) {
            return str.length > len ? (str.substr(0, len) + "...") : str;
        },
        //排序回调方法
        sortChange: function (e) {
            if (e.data.bgclose) {
                this.setData({ sortTabSt: '' });
                return;
            }
            var tabName = e.data.filterDesc,
                sortId = e.data.filterId;

            this.setData({
                'selectedSortId': e.data.filterId,
                'sortTabSt': '',
                'loadmore': false,
                'sortTabText': (sortId == 0) ? '排序' : this.cutStr(tabName, 4),
                'searchFrom': 2,
                'toView': 'top',
                'preventScroll': '',
                'selectedOrderFilter': [
                    {
                        "filterDesc": tabName,
                        "filterId": sortId,
                        "isSelected": 1
                    }
                ]
            });
            this.getSceneryList();
            var selectArr = (sortId == 0) ? [] : [1];
            this.addSelectedTab("sortTab", selectArr);
        },
        themeChange: function (e) {
            if (e.data.bgclose) {
                this.setData({ themeTabSt: '' });
                return;
            }
            var tabName = e.data.filterDesc,
                sortId = e.data.filterId,
                totleFilterId = 0;
            this.data.topicFilterList.map(function (item, i) {
                totleFilterId += Number(item.filterId);
            });
            this.data.selectedTopicFilter = [{
                "filterDesc": totleFilterId,
                "filterId": sortId,
                "isSelected": 1
            }];
            this.setData({
                'selectedThemeId': e.data.filterId,
                'themeTabSt': '',
                'loadmore': false,
                'themeTabText': (sortId == 0) ? '主题筛选' : this.cutStr(tabName, 4),
                'toView': 'top',
                'preventScroll': ''
            });
            this.getSceneryList();
            var selectArr = (sortId == 0) ? [] : [1];
            this.addSelectedTab("themeTab", selectArr);
        },
        filterChange: function (e) {
            if (e.data.bgclose) {
                this.setData({ filterTabSt: '' });
                return;
            }
            var distanceData = e.data.distanceData && e.data.distanceData[0],
                surCityData = e.data.surCityData;
            if (distanceData) {
                this.setData({
                    'filterTabText': distanceData.filterDesc == "不限" ? "距离" : this.cutStr(distanceData.filterDesc, 4),
                    'filterTabSt': '',
                    'toView': 'top',
                    'preventScroll': '',
                    'searchType': 2,
                    'distanceFilterList': e.data.distanceData,
                    'surroundingCityFilterList': []
                });
                this.getSceneryList();
                var selectArr = distanceData && (distanceData.filterDesc == '不限') ? [] : [1];
                this.addSelectedTab("filterTab", selectArr);
            }
            else if (surCityData) {
                var text = '';
                surCityData.map(function (item, i) {
                    text += item.filterDesc;
                });
                this.setData({
                    'filterTabText': text == '不限' ? '距离' : this.cutStr(text, 3),
                    'filterTabSt': '',
                    'toView': 'top',
                    'preventScroll': '',
                    'searchType': text == '不限' ? 2 : 3,
                    'surroundingCityFilterList': surCityData,
                    'distanceFilterList': []
                });
                this.clearTopicFilter();
                this.addSelectedTab("themeTab", []);
                this.getSceneryList();
                var selectArr = surCityData[0] && (surCityData[0].filterDesc == '不限') ? [] : [1];
                this.addSelectedTab("filterTab", selectArr);
            }
        },
        openFilter: function () {
            var _this = this,
                filterComponent = this.components['filter1'];
            this.data.activeFilterTab !== 'filter' && this.closeOtherFilter();
            filterComponent.bindData(this.data.distanceFilterList, this.data.surroundingCityFilterList);
            if (filterComponent.data.isOpen) {
                filterComponent.close();
                this.setData({
                    filterTabSt: '',
                    activeFilterTab: '',
                    preventScroll: ''
                });
            } else {
                filterComponent.open();
                this.setData({
                    filterTabSt: 'on',
                    activeFilterTab: 'filter',
                    preventScroll: 'g_oh'
                });
            }
            this.removeTabOn(this.data.activeFilterTab);
        },
        openSort: function () {
            var _this = this,
                arr = this.data.orderFilterList;
            this.data.activeFilterTab !== 'sort' && this.closeOtherFilter();
            var sortComponent = this.components["sort1"];
            var selectedIndex = arr.findIndex(function (item, index) {
                // return item.filterId == _this.data.selectedSortId;
                return item.isSelected == 1;
            });
            sortComponent.setSource(arr, selectedIndex < 0 ? 0 : selectedIndex);
            if (sortComponent.data.isOpen) {
                sortComponent.close();
                this.setData({
                    sortTabSt: '',
                    activeFilterTab: '',
                    preventScroll: ''
                });
            } else {
                sortComponent.open();
                this.setData({
                    sortTabSt: 'on',
                    activeFilterTab: 'sort',
                    preventScroll: 'g_oh'
                });
            }
            this.removeTabOn(this.data.activeFilterTab);
        },
        openTheme: function () {
            var _this = this,
                arr = this.data.topicFilterList;
            this.data.activeFilterTab !== 'theme' && this.closeOtherFilter();
            var themeComponent = this.components["theme1"];
            var selectedIndex = arr.findIndex(function (item, index) {
                // return item.filterId == _this.data.selectedThemeId;
                return item.isSelected == 1;
            });
            themeComponent.setSource(arr, selectedIndex < 0 ? 0 : selectedIndex);
            if (themeComponent.data.isOpen) {
                themeComponent.close();
                this.setData({
                    themeTabSt: '',
                    activeFilterTab: '',
                    preventScroll: ''
                });
            } else {
                themeComponent.open();
                this.setData({
                    themeTabSt: 'on',
                    activeFilterTab: 'theme',
                    preventScroll: 'g_oh'
                });
            }
            this.removeTabOn(this.data.activeFilterTab);
        },
        addSelectedTab: function (type, selectData) {
            var curDataObj = {
                hasSelectedTab: this.data.hasSelectedTab
            },
                hasSelectedTab = {},
                textKey = type + "Text";

            if (selectData.length) {
                curDataObj.hasSelectedTab[type] = "cur";
            } else {
                curDataObj.hasSelectedTab[type] = "";
            }
            this.setData(curDataObj);
        },
        //修改tab的箭头方向
        removeTabOn: function (activeTab) {
            var _this = this,
                tabArr = ['filter', 'sort', 'theme'];
            tabArr.map(function (item, i) {
                if (activeTab !== tabArr[i]) {
                    var tabStr = tabArr[i] + 'TabSt',
                        obj = {};
                    obj[tabStr] = "";
                    _this.setData(obj);
                }
            });
        },
        onPullDownRefresh:function(){
            mRefreshData = true
            this.getSceneryList();
        },
        stopRefresh:function(){
            if(mRefreshData) {
                mRefreshData = false
                wx.stopPullDownRefresh()
            }
        },
        // 回到顶部
        backTop: function () {
            this.setData({
                "toView": "top"
            })
        },
        resetParams: function (e) {
            // 清空首页周边筛选
            this.data.keywords.data.title = '';
            this.data.surroundingCityFilterList = [];
            this.data.selectedOrderFilter = [];
            this.data.selectedTopicFilter = [];
            this.data.searchType = 2;
            // 清空当前筛选
            this.data.currentFilterList = [];
            this.setData({
                wxc1:'',
                wxc2:'',
                todayAvailable:0,
                specialSaleSelected:0,
                words: '',
                themeTabText: '主题筛选'
            });
            this.addSelectedTab("themeTab", []);
            if (e.currentTarget.dataset.param || e) {
                this.getSceneryList();
                this.backTop();
            }
        },
        loadMore: function () {
            var totalPage = parseInt((this.data.totalCount + 20 - 1) / 20);
            if (totalPage - 1 > this.data.page.pageIndex) {
                this.data.page.pageIndex++;
                let moreParams = {
                    "currentCityId": this.data.currentCityId || "36",
                    "imageSize": 4,
                    "keyword": this.data.keywords.data.title,
                    "lat": this.data.lat,
                    "lng": this.data.lng,
                    "searchCityId": this.data.searchCityId || "36",
                    "searchType": this.data.searchType,
                    "page": {
                        "pageIndex": this.data.page.pageIndex,
                        "pageSize": 20
                    },
                    "showDistanceFilter": this.showNearBy(),
                    "specialSaleSelected": this.data.specialSaleSelected,
                    "distanceFilterList": this.data.distanceFilterList,
                    "orderFilterList": this.data.selectedOrderFilter,
                    "surroundingCityFilterList": this.data.surroundingCityFilterList,
                    "todayAvailable": this.data.todayAvailable,
                    "topicFilterList": this.data.selectedTopicFilter
                };
                ListService.SceneryList(moreParams).then(function (data) {
                    this.data.productList = this.data.productList.concat(data.productList);
                    this.setData({
                        productList: this.productListFormat(this.data.productList),
                        totalCount: this.data.totalCount
                    });
                    __wxConfig.debug && console.log(this.data.productList);
                }.bind(this), function (err) {
                    __overwrite.alert({
                        content: "接口调用失败，请重试"
                    });
                })
            }
        },
    }, [{
        component: Sort,
        instanceName: "sort1",
        props: {
            style: {
                top: '82px'
            }
        },
        events: {
            onChange: "sortChange"
        }
    },
    {
        component: Theme,
        instanceName: "theme1",
        props: {
            style: {
                top: '82px'
            }
        },
        events: {
            onChange: "themeChange"
        }
    },
    {
        component: Filter,
        instanceName: "filter1",
        props: {
            style: {
                top: '82px'
            }
        },
        events: {
            onChange: "filterChange"
        }
    }
        ]);
})(__overwrite.require(require, __dirname), __overwrite.Page);