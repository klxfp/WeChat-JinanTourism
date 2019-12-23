var __dirname = "pages/homepage";
var __overwrite = require("../../utils/overwrite.js");
var tabNames = ["recommand", "nearby"];
(function (require, Page) {
  var api = require("../../utils/api.js")(__dirname),
    token = require('utils/token'),
    Util = require('utils/util'),
    CityPlugin = require('components/city-selector/index'),
    SearchPlugin = require('components/place-search/index'),
    HomePageService = require('service/homepageservice'),
    CityService = require("service/city");;
  var app = getApp();
  var showLocationDailog = false, isChinaCity = false, showNoDataDialog = false;
  var currentPage;//当前小程序页面
  var mRefresh = false
  Page({
    data: {
      isLocal: false,//是否定位成功
      currentCityId: "36",
      currentCityName: "北京",
      searchCityId: "36",
      searchCityName: "北京",
      lat: "0",
      lng: "0",
      themeAutoplay: false,//主题是否自动切换
      themeindex: 0,//主题选择中的swiper-item的下标
      showTopiclist: [],//主题数据, 转化后展示的主题数据
      themcontainerHeight: 350,
      topicList: [],//后端返回的主题
      indicatordots: true,
      selectedTabIndicator: 'recommand',
      SceneryList: [],
      sceneryindex: 0,
      cityInfo: {
        cityId: "",
        cityName: ""
      },
      keywords: {
        "type": "",
        "data": {}
      },
      scrollHeight: 667,
      topicDefaultUrl: 'https://m.elongstatic.com/static/xcxticket/topicDefault.png'
    },
    //查看更多景点
    gotoList: function (options) {
      //Todo: 附近列表传参还要问题
      let currentCityId = this.data.currentCityId;
      let searhCityId = this.data.searchCityId;
      if (this.data.selectedTabIndicator == 'recommand') {
        this.gotolocalScenery();
      } else {
        var filter = [{
          isSelected: 1,
          filterDesc: "30km",
          filterId: "30"
        },]
        var param = JSON.stringify(filter);
        api.Navigate.go({
          url: '../list/list?nearbyMore=' + param + '&currentCityId=' + currentCityId + "&searchCityId=" + searhCityId
        });
      }
    },
    getLocationCity: function (hasCurrentSelectCity, callback) {
      var _this = this,
        _api = api;
      var qqMap = app.getQQMap();
      var _app = app;
      var lat, lng;
      api.Location.get({
        success: function (res) {
          __wxConfig.debug && console.log("homepage Location res = ", res)
          lat = res.latitude;
          lng = res.longitude;
          qqMap.reverseGeocoder({
            location: {
              latitude: res.latitude,
              longitude: res.longitude
            },
            success: function (res) {
              __wxConfig.debug && console.log("homepage qq map reverseGeocoder success res = ", res);
              //遍历城市解析出城市id
              var currentCityName = res.result.address_component.city//北京市
              __wxConfig.debug && console.log("homepage qq map reverseGeocoder success currentCityName = ", currentCityName);
              _app.getSavedCityData(function (result) {
                __wxConfig.debug && console.log("homepage qq map reverseGeocoder success getSavedCityData  result = ", result);
                if (result && result.data && !Util.isEmptyObject(result.data)) {
                  var city = _this.getCityByName(currentCityName.replace(/市/, ''), result.data.cityList);
                  isChinaCity = true;
                  if (Util.isEmptyObject(city)) {
                    isChinaCity = false;
                    city = _this.getCityByName(currentCityName.replace(/市/, ''), result.data.overseasCityList);
                  }
                  __wxConfig.debug && console.log("homepage qq map reverseGeocoder success getSavedCityData  city = ", city);
                  if (city && city.cityId) {
                    showLocationDailog = city.cityId != _this.data.searchCityId;
                    _this.setData({
                      isLocal: true,
                      searchCityId: _this.data.searchCityId,
                      searchCityName: _this.data.searchCityName,
                      currentCityId: city.cityId,
                      currentCityName: city.cityName || '',
                      lat: lat,
                      lng: lng,
                    })
                  } else {
                    _this.setData({
                      isLocal: false,
                      searchCityId: _this.data.searchCityId,
                      searchCityName: _this.data.searchCityName,
                    });
                  }
                  callback();
                }
              })
            },
            fail: function (res) {
              __wxConfig.debug && console.log('homepage qq map reverseGeocoder fail res = ', res);
              _this.setData({
                isLocal: false,
                searchCityId: _this.data.searchCityId,
                searchCityName: _this.data.searchCityName,
              });
              callback();
            }
          });
        },
        fail: function (e) {
          __wxConfig.debug && console.log('homepage location fail');
          _this.setData({
            isLocal: false,
            searchCityId: _this.data.searchCityId,
            searchCityName: _this.data.searchCityName,
          });
          callback();
        }
      })
    },
    // 根据城市名获取城市信息
    getCityByName(name, cityList) {
      if (Util.isTxtNotEmpty(name) && !Util.isEmptyObject(cityList)) {
        let city;
        for (var index = 0; index < cityList.length; index++) {
          var tempCityList = cityList[index].cityList;
          if (!Util.isEmptyObject(tempCityList)) {
            for (var j = 0; j < tempCityList.length; j++) {
              if (Util.isTxtNotEmpty(tempCityList[j].cityName) && null != tempCityList[j].cityName.match(name)) {
                return tempCityList[j];
              }
            }
          }
        }
      }
      return null;
    },
    onLoad: function (options) {
      //处理别的页面传递过来的数据
      __wxConfig.debug && console.log("homepage onLoad")
      var that = this,
        _api = api;
      mRefresh = false
      that.setData({
        scrollHeight: getApp().getAppSystemInfo().windowHeight
      })
      var pages = getCurrentPages();
      currentPage = pages[pages.length - 1];
      currentPage.setLoading(true)
      app.getSavedCityData(function (result) {
        if (Util.isEmptyObject(result) || (Util.isEmptyObject(result.data.cityList) &&
          Util.isEmptyObject(result.data.overseasCityList))) {
          that.getCityDataFromServer();
        }
      });
      this.loadData();
    },
    loadData: function () {
      //获取当前选择的城市
      __wxConfig.debug && console.log("homepage loadData")
      var _api = api, that = this;
      showLocationDailog = false
      showNoDataDialog = false
      Util.getCurrentSelectCity(_api, function (result) {
        __wxConfig.debug && console.log("homepage getCurrentSelectCity result = ", result)
        var hasCurrentSelectCity = false
        if (!Util.isEmptyObject(result) && !Util.isEmptyObject(result.data)) {
          //当前有选择城市
          var city = result.data;
          that.data.searchCityId = city.cityId;
          that.data.searchCityName = city.cityName;
          hasCurrentSelectCity = true
        }
        that.getLocationCity(hasCurrentSelectCity, function () {
          that.getHomePageData();
        })
      })
    },
    onShow: function () {
      // 检测登陆是否失效，并尝试登陆
      var _this = this
      __wxConfig.debug && console.log("homepage onShow")
      token.checkSessionToken(function (isok) {
        __wxConfig.debug && console.log("homepage checkSessionToken isok = ", isok)
        if (isok) {
          _this.showLocationDailog()
        } else {
          token.autoLogin(function () {
            api.showModal({
              title: '授权登录',
              content: '登录后艺龙将获得您的昵称、头像等公开信息。',
              showCancel: true,
              confirm: function () {
                token.autoLoginConfirm(_this.loginCallback.bind(_this))
              }.bind(_this),
              cancel: function () {
                token.autoLoginCancel()
              }
            })
          }.bind(_this), _this.loginCallback.bind(_this))
        }
      }.bind(_this))
    },
    showLocationDailog: function () {
      var _api = api, that = this;
      __wxConfig.debug && console.log("homepage showLocationDailog showLocationDailog = ", showLocationDailog)
      if (showLocationDailog) {
        showLocationDailog = false
        if (Util.isTxtNotEmpty(that.data.currentCityName)) {
          _api.showModal({
            title: '',
            content: '系统检测到您当前的城市为' + that.data.currentCityName + ',是否要更换城市?',
            showCancel: true,
            confirm: function () {
              that.setData({
                searchCityId: that.data.currentCityId,
                searchCityName: that.data.currentCityName,
              })
              Util.saveLocationChooseCity(_api, { cityId: that.data.currentCityId, cityName: that.data.currentCityName }, isChinaCity)
              isChinaCity = false;
              that.getHomePageData()
            }.bind(that),
            cancel: function () {
              that.showNoDataLocation()
            }
          })
        }
      } else {
        that.showNoDataLocation()
      }
    },
    showNoDataLocation: function () {
      //当前城市无数据弹框
      __wxConfig.debug && console.log("homepage showNoDataLocation showNoDataDialog = ", showNoDataDialog)
      if (showNoDataDialog) {
        var _api = api, that = this;
        showNoDataDialog = false
        _api.showModal({
          title: '',
          content: '很抱歉, 您当前的城市' + that.data.searchCityName + '暂无数据,请选择其他城市试试',
          showCancel: false,
          confirm: function () {
            //跳转城市选择页
            that.onCitySelectClick();
          }.bind(that)
        })
      }
    },
    // 登录回调
    loginCallback: function (loginRes, errorCode) {
      // 失败弹框
      var _this = this
      __wxConfig.debug && console.log("homepage loginCallback loginRes = ", loginRes)
      __wxConfig.debug && console.log("homepage loginCallback errorCode = ", errorCode)
      if (loginRes === null || loginRes === undefined) {
        var content = '登录系统出了点小问题，您可用游客身份下单，或重新尝试登录。'
        if (errorCode != '') content += '[' + errorCode + ']'
        api.showModal({
          title: '登录失败',
          content: content,
          confirmText: '重新登录',
          cancelText: '游客浏览',
          confirm: function () {
            token.login(_this.loginCallback.bind(_this))
            _this.showLocationDailog()
          }.bind(_this),
          cancel: function () {
            _this.showLocationDailog()
          }.bind(_this)
        })
      } else {
        //登录成功

      }
    },
    getCityDataFromServer: function () {
      var _app = app;
      CityService.GetCityData().then(function (data) {
        _app.saveCityData(data);
      }.bind(this));
    },
    getHomePageData: function () {
      var that = this, _api = api;
      __wxConfig.debug && console.log("homepage getHomePageData")
      HomePageService.GetHomePageData(that.data.currentCityId, that.data.lat, that.data.lng, that.data.searchCityId,
        this.data.isLocal && this.data.searchCityId == this.data.currentCityId).then(function (data) {
          __wxConfig.debug && console.log("homepage repsonse data = ", data)
          currentPage.setLoading(false)
          that.stopRefresh()
          var hasData = data.recommendSceneryList && data.recommendSceneryList.length > 0 ||
            data.specialList && data.specialList.length > 0 || data.topicList && data.topicList.length > 0;
          if (!hasData) {
            that.setData({
              sceneryList: [],
              showTopiclist: [],
              topicList: [],
            })
            showNoDataDialog = true
            that.showLocationDailog()
            return
          }
          showNoDataDialog = false
          var topics = [];//二维数组
          // 添加最后一个主题为全部
          let all = {
            topicName: "全部景点",
            topicUrl: "//m.elongstatic.com/static/xcxticket/allScenery.png"
          }
          if (data.topicList && data.topicList.length > 0) {
            data.topicList.push(all)
            for (let i = 0; i < data.topicList.length;) {
              let topic = [];
              for (let j = 0; j < 8; j++) {
                if (i + j == data.topicList.length)
                  break;
                topic.push(data.topicList[i + j]);
              }
              i += 8;
              topics.push(topic);
            }
          }
          data.recommendSceneryList.map(function (scenery) {
            scenery.currentPrice = Util.formatePrice(scenery.currentPrice);
            if (Util.isTxtNotEmpty(scenery.scenicDesc)) {
              scenery.scenicDesc = scenery.scenicDesc.replace(/[\r\n]/g, "");
            }
            return scenery
          });
          data.localSceneryList.map(function (scenery) {
            scenery.currentPrice = Util.formatePrice(scenery.currentPrice);
            if (Util.isTxtNotEmpty(scenery.scenicDesc)) {
              scenery.scenicDesc = scenery.scenicDesc.replace(/[\r\n]/g, "");
            }
            return scenery
          });
          let SceneryList = [];
          let recommandswiperHeight = 0;
          let localswiperHeight = 0;
          if (data.recommendSceneryList && data.recommendSceneryList.length > 0) {
            recommandswiperHeight = data.recommendSceneryList.length * 256;
          }
          SceneryList.push(data.recommendSceneryList);
          if (data.localSceneryList && data.localSceneryList.length > 0) {
            localswiperHeight = data.localSceneryList.length * 256;
            SceneryList.push(data.localSceneryList);
          }
          that.setData({
            searchCityId: that.data.searchCityId,
            searchCityName: that.data.searchCityName,
            showTopiclist: topics,
            themcontainerHeight: data.topicList && data.topicList.length > 4 ? 350 : 186,
            topicList: data.topicList && data.topicList.length > 0 ? data.topicList.slice(0, data.topicList.length - 1) : [],
            sceneryList: SceneryList,
            recommendSceneryList: data.recommendSceneryList,
            specialList: data.specialList,
            weekHotList: data.weekHotList,
            localSceneryList: data.localSceneryList,
            recommandswiperHeight: recommandswiperHeight,
            localswiperHeight: localswiperHeight,
            selectedTabIndicator: 'recommand',
            sceneryindex: 0,
            themeindex: 0,
          });
          that.showLocationDailog()
        });
    },
    gotoSceneryDetail: function (options) {
      api.Navigate.go({
        url: '../detail/detail?sceneryId=' + options.currentTarget.dataset.sceneryid
      });
    },
    //推荐景点和附近景点的tab
    onTabClick: function (options) {
      let name = options.currentTarget.dataset.param;
      if (name == 'recommand') {
        this.setData({
          sceneryindex: 0,
          selectedTabIndicator: "recommand",

        });
      } else if (name == 'nearby') {
        this.setData({
          selectedTabIndicator: "nearby",
          sceneryindex: 1,
        });
      }
    },
    changeScenerySwiper: function (e) {
      this.setData({
        sceneryindex: e.detail.current,
        selectedTabIndicator: tabNames[e.detail.current]
      })
    },
    onTopicItemClick: function (options) {
      // let topicFilterList = [];
      let index = options.currentTarget.dataset.index + this.data.themeindex * 8;
      __wxConfig.debug && console.log("index", index, options);
      if (index >= 0) {
        if (index === this.data.topicList.length) {
          this.gotolocalScenery();
        } else {
          //TODO: 增加主题参数
          var topicFilterList = [];
          for (let i = 0; i < this.data.topicList.length; i++) {
            let topic = {}
            if (i == index) {
              topic.isSelected = 1;
            } else {
              topic.isSelected = 0;
            }
            topic.filterDesc = this.data.topicList[i].topicName;
            topic.filterId = this.data.topicList[i].topicId;
            topicFilterList.push(topic);
          }
          // topicFilterList.splice(0,topicFilterList.length -1);
          var param = JSON.stringify(topicFilterList);
          api.Navigate.go({
            url: '../list/list?topicFilterList=' + param + '&currentCityId=' + this.data.currentCityId + "&searchCityId=" + this.data.searchCityId
          });
        }
      }
    },
    gotolocalScenery: function () {
      api.Navigate.go({
        url: '../list/list?currentCityId=' + this.data.currentCityId + "&searchCityId=" + this.data.searchCityId
      });
    },
    gotoNearbyCityScenery: function () {
      var surroundFilter = [{
        "isSelected": 1,
        "filterDesc": "首页周边",
        "filterId": "-1"
      }];
      var param = JSON.stringify(surroundFilter);
      api.Navigate.go({
        url: '../list/list?homeSurroundFilter=' + param + "&currentCityId=" + this.data.currentCityId + "&searchCityId=" + this.data.searchCityId
      });
    },
    onCitySelectClick: function () {
      var _this = this;
      CityPlugin({
        title: "",
        cityId: ""
      }, function (res) {
        _this.setData({
          searchCityId: res.value.cityId || '',
          searchCityName: res.value.cityName || '',
          cityInfo: {
            cityId: res.value.cityId || "",
            cityName: res.value.cityName || ""
          }
        })
        _this.getHomePageData();
      })
    },
    onSearchClick: function () {
      //搜索点击事件
      var _this = this, tempKeywords;
      SearchPlugin({
        cityId: this.data.searchCityId,
        searchTxt: this.data.keywords.data.title || '',
        searchType: this.data.keywords.data.type || '',
        fromPage: 'homepage'
      }, function (data) {
      });
    },
    gotoOrder: function () {
      api.Navigate.go({
        url: "../orderlist/orderlist"
      })
    },
    themeSwiperChange: function (e) {
      this.setData({
        themeindex: e.detail.current
      })
    },
    //暂时不做
    themeDotClick: function (options) {
      __wxConfig.debug && console.log("themeDotClick", options.currentTarget.dataset.index);
      let index = options.currentTarget.dataset.index;
      this.setData({
        themeindex: index,
      });
    },
    onPullDownRefresh: function () {
      mRefresh = true
      this.loadData();
    },
    stopRefresh: function () {
      if (mRefresh) {
        wx.stopPullDownRefresh()
      }
    }
  });
})(__overwrite.require(require, __dirname), __overwrite.Page);