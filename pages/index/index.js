//index.js
//获取应用实例
var app = getApp();
//获取封装好的ajax
var ajax = require('../../utils/util.ajax.js');

var _url = app.globalData.url;

var amapFile = require('../../utils/amap-wx.js');
// 实例化地图API，获取当前定位信息
var myAmapFun = new amapFile.AMapWX({
  key: 'fa5b1bf50930615d2303c0072aa33691'
});

Page({
  data: {
    cityName: '',
    hotList: null,
    navList: [{
      name: "名店特产",
      icon: "icon_4.png",
      page: "local-product/index"
    },
    {
      name: "景区讲解",
      icon: "icon_1.png",
      page: "../audio/audio"
    },
    {
      name: "目的地",
      icon: "icon_2.png",
      page: "../map/inputtip/inputtip"
    },
    {
      name: "景点门票",
      icon: "btn_ticket.png",
      page: "../test/test"
    }
    ],
    imgList: [
      { src: 'https://s2.ax1x.com/2019/12/07/QteoKP.png', text: "趵突泉" },
      { src: 'https://s2.ax1x.com/2019/12/07/QteTDf.png', text: "五龙潭" },
      { src: 'https://s2.ax1x.com/2019/12/07/QteqUg.png', text: "环城公园" },
      { src: 'https://s2.ax1x.com/2019/12/07/QteL5Q.png', text: "大明湖" },
      { src: 'https://s2.ax1x.com/2019/12/07/QteXCj.png', text: "黑虎泉" },
      { src: 'https://s2.ax1x.com/2019/12/07/Qtej8s.png', text: "济南国际园博园" },
      { src: 'https://s2.ax1x.com/2019/12/07/Qtev2n.png', text: "泉城欧乐堡梦幻世界" },
      { src: 'https://s2.ax1x.com/2019/12/07/Qtexvq.png', text: "泉城海洋极地世界" },
      { src: 'https://s2.ax1x.com/2019/12/07/QtmprV.png', text: "金象山乐园" },
      { src: 'https://s2.ax1x.com/2019/12/07/Qtm9bT.png', text: "红叶谷生态文化旅游区" },
      { src: 'https://s2.ax1x.com/2019/12/07/QtmPVU.png', text: "跑马岭野生动物世界" },
      { src: 'https://s2.ax1x.com/2019/12/07/QtmiaF.png', text: "九顶塔中华民俗乐园" },
      { src: 'https://s2.ax1x.com/2019/12/07/QtmZx1.png', text: "灵岩寺旅游区" },
      { src: 'https://s2.ax1x.com/2019/12/07/QtmuqK.png', text: "九如山瀑布风景区" }
    ],


    circular: true,
    //是否显示画板指示点  
    indicatorDots: false,
    //选中点的颜色  
    indicatorcolor: "#000",
    //是否竖直  
    vertical: false,
    //是否自动切换  
    autoplay: true,
    //自动切换的间隔
    interval: 2500,
    //滑动动画时长毫秒  
    duration: 100,
    //所有图片的高度  
    imgheights: [],
    //图片宽度 
    imgwidth: 750,
    //默认  
    current: 0

  },
  onReady: function () {
    var that = this;
    // 调用高德地图接口，获取城市信息
    if (app.globalData.curCity) {
      this.setData({
        cityName: app.globalData.curCity
      });
      this.getHot();
    } else {
      myAmapFun.getRegeo({
        success: function (data) {
          //获取当前城市信息

          console.log(data[0].regeocodeData.addressComponent);
          var _msg = data[0].regeocodeData.addressComponent;
          var _city = _msg.city[0] ? _msg.city[0] : _msg.province;
          app.globalData.curCity = _city;
          that.setData({
            cityName: _city
          });

          // console.log(app.globalData.curCity);

          // 获取当前城市热门景点列表
          that.getHot();
        },
        fail: function (info) {
          //失败回调
          console.log(info)
        }
      });
    }

  },
  myLocation: function () {
    var that = this;
    wx.getLocation({
      // 返回可以用于wx.openLocation的经纬度
      type: 'gcj02',
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        wx.openLocation({
          latitude: latitude,
          longitude: longitude,
          scale: 1
        })
      }
    });
  },
  getHot: function () {
    var that = this;
    ajax.post(_url,
      'cityName=' + that.data.cityName + '&lanKey=zh-cn&provinceName=&method=scenicsOfCityNew&',
      function (res) {
        that.setData({
          hotList: res.data.data.scenics
        });
      })
  },
  imageLoad: function (e) {//获取图片真实宽度  
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      //宽高比  
      ratio = imgwidth / imgheight;
    console.log(imgwidth, imgheight)
    //计算的高度值  
    var viewHeight = 750 / ratio;
    var imgheight = viewHeight;
    var imgheights = this.data.imgheights;
    //把每一张图片的对应的高度记录到数组里  
    imgheights[e.target.dataset.id] = imgheight;
    this.setData({
      imgheights: imgheights
    })
  },
  bindchange: function (e) {
    // console.log(e.detail.current)
    this.setData({ current: e.detail.current })
  },

  bindFocus: function () {
    wx.navigateTo({
      url: './search/search'
    })
  }
})