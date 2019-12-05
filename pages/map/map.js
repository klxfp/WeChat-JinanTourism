//index.js
//获取应用实例
let app = getApp();
let wechat = require("../../utils/wechat");
let amap = require("../../utils/amap");
var amapFile = require('../../utils/amap-wx.js');
let markersData = [];
Page({
  data: {
    markers: [],
    latitude: '',
    longitude: '',
    textData: {},
    city: '',
    markerId: 0,
    placeData: { title: '点击图上marker获得详细信息哦☺️' },
    searchMethod: '酒店',
    bitmap: '',
    fail: '',
    success: '',
    selsectState: [1, 0, 0],
    controls: [
      {
        id: 0,
        position: {
          left: 10,
          top: 200,
          width: 40,
          height: 40
        },
        iconPath: "images/local.png",
        clickable: true
      }
    ]
  },
  makertap: function (e) {
    var id = e.markerId;
    var that = this;
    that.showMarkerInfo(markersData, id);
    that.changeMarkerColor(markersData, id);
  },
  onLoad(e) {
    var that = this;
    var Amap = new amapFile.AMapWX({ key: '6205e3022b70167945e90fec43976555' });
    Amap.getPoiAround({
      iconPathSelected: 'images/marker_blue.png',
      iconPath: 'images/marker_red.png',
      success: function (data) {
        markersData = data.markers;
        that.setData({
          markers: markersData
        });
        that.setData({
          latitude: markersData[0].latitude
        });
        that.setData({
          longitude: markersData[0].longitude
        });
        that.showMarkerInfo(markersData, 0);
      },
      fail: function (info) {
        wx.showModal({ title: info.errMsg })
      }
    }),
    amap.getRegeo()
      .then(d => {
        console.log(d);
        let { name, desc, latitude, longitude } = d[0];
        let { city } = d[0].regeocodeData.addressComponent;
        this.setData({
          city,
          bitmap:Amap,
          latitude,
          longitude,
          textData: { name, desc }
        })
      })
      .catch(e => {
        console.log(e);
      })
  },
  bindInput() {
    let { latitude, longitude, city } = this.data;
    let url = `/pages/inputtip/inputtip?city=${city}&lonlat=${longitude},${latitude}`;
    wx.navigateTo({ url });
  },
  makertap(e) {
    // console.log(e);
    let { markerId } = e;
    let { markers } = this.data;
    let marker = markers[markerId];
    // console.log(marker);
    this.showMarkerInfo(marker);
    this.changeMarkerColor(markerId);
  },
  showMarkerInfo(data,i) {
    var that = this;
    that.setData({
      textData: {
        name: data[i].name,
        desc: data[i].address
      }
    });
  },
  changeMarkerColor(markerId) {
    let { markers } = this.data;
    markers.forEach((item, index) => {
      item.iconPath = "images/marker.png";
      if (index == markerId) item.iconPath = "images/marker_checked.png";
    })
    this.setData({ markers, markerId });
  },
  getRoute() {
    // 起点
    let { latitude, longitude, markers, markerId, city, textData } = this.data;
    let { name, desc } = textData;
    if (!markers.length) return;
    // 终点
    let { latitude: latitude2, longitude: longitude2 } = markers[markerId];
    let url = `/pages/routes/routes?longitude=${longitude}&latitude=${latitude}&longitude2=${longitude2}&latitude2=${latitude2}&city=${city}&name=${name}&desc=${desc}`;
    wx.navigateTo({ url });
  },
  clickcontrol(e) {
    console.log("回到用户当前定位点");
    let { controlId } = e;
    let mpCtx = wx.createMapContext("map");
    mpCtx.moveToLocation();
  },
  //点击地图标记点时触发，显示周边信息，改变标记点颜色
  makertap: function (e) {
    var that = this;
    var id = e.markerId;
    that.showSearchInfo(wxMarkerData, id);
    that.changeMarkerColor(wxMarkerData, id);
  },
  //上面方法调用，获得周边信息setData渲染到页面里
  showSearchInfo: function (data, i) {
    var that = this;
    that.setData({
      placeData: {
        title: '名称：' + data[i].title + '\n',
        address: '地址：' + data[i].address + '\n',
        telephone: data[i].telephone == undefined ? '电话：暂无信息' : '电话：' + data[i].telephone
      }
    });
  },
  //上面方法调用，改变标记点颜色
  changeMarkerColor: function (data, id) {
    var that = this;
    var markersTemp = [];
    for (var i = 0; i < data.length; i++) {
      if (i === id) {
        data[i].iconPath = "images/marker_blue.png";
      } else {
        data[i].iconPath = "images/marker_red.png";
      }
      markersTemp[i] = data[i];
    }
    that.setData({
      markers: markersTemp
    });
  },
  //点击酒店图标
  clickHotel: function () {
    this.setData({
      searchMethod: '酒店',
      selsectState: [1, 0, 0],
      placeData: { title: '点击图上marker获得附近-酒店-信息哦☺️' }
    });
    this.onShow();
  },
  //点击美食图标
  clickFood: function () {
    this.setData({
      searchMethod: '美食',
      selsectState: [0, 1, 0],
      placeData: { title: '点击图上marker获得附近-美食-信息哦☺️' }
    });
    this.onShow();
  },
  //点击服务图标
  clickService: function () {
    this.setData({
      searchMethod: '生活服务',
      selsectState: [0, 0, 1],
      placeData: { title: '点击图上marker获得附近-生活服务-信息哦☺️' }
    });
    this.onShow();
  },
  onShow: function () {
    // 发起POI检索请求 
    this.data.bitmap.search({
      "query": this.data.searchMethod,
      fail: this.data.fail,
      success: this.data.success,
      // 此处需要在相应路径放置图片文件 
      iconPath: 'images/marker_red.png',
      // 此处需要在相应路径放置图片文件 
      iconTapPath: 'images/marker_red.png'
    });
  },
  mapchange() {
    // console.log("改变视野");
  }
})
