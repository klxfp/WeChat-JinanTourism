let util = require('../../../utils/util.js');
let wechat = require("../../../utils/wechat");
let amap = require("../../../utils/amap");
Page({
  data: {
    lonlat: "",
    city: "",
    tips: []
  },
  onLoad(e) {
    let { lonlat, city } = e;
    this.setData({
      lonlat, city
    })
  },
  bindInput(e) {
    // console.log(e);
    let { value } = e.detail;
    let { lonlat, city } = this.data;
    amap.getInputtips(city, lonlat, value)
      .then(d => {
        // console.log(d);
        if (d && d.tips) {
          this.setData({
            tips: d.tips
          });
        }
      })
      .catch(e => {
        console.log(e);
      })
  },
  bindSearch(e) {
    console.log(e);
    let { keywords } = e.target.dataset;
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];  //上一个页面
    if (keywords) {
      prevPage.setData({ keywords });
      amap.getPoiAround(keywords)
        .then(d => {
          let { markers } = d;
          markers.forEach(item => {
            item.iconPath = "/images/Redmaker.png";
          })
          prevPage.setData({ markers });
          prevPage.showMarkerInfo(markers[0]);
          prevPage.changeMarkerColor(0);
        })
        .catch(e => {
          console.log(e);
        })
    }
    let url = `/pages/map/index/index`;
    wx.switchTab({ url })
  }
});
