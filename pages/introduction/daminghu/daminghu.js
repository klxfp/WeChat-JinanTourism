// pages/introduction/daminghu/daminghu.js
var wxCharts = require('../../../utils/wxcharts.js');
var lineChart = null;
Page({
  data: {
    business:
      [
        { businesser: 1, time: 6, num: null }, { businesser: 1, time: 7, num: null },
        { businesser: 1, time: 8, num: null }, { businesser: 1, time: 9, num: null },
        { businesser: 1, time: 10, num: null }, { businesser: 1, time: 11, num: null },
        { businesser: 1, time: 12, num: null }, { businesser: 1, time: 13, num: null },
        { businesser: 1, time: 14, num: null }, { businesser: 1, time: 15, num: null },
        { businesser: 1, time: 16, num: null }, { businesser: 1, time: 17, num: null },
        { businesser: 1, time: 18, num: null }, { businesser: 1, time: 19, num: null },
        { businesser: 1, time: 20, num: null }, { businesser: 1, time: 21, num: null },
        { businesser: 1, time: 22, num: null },
        { businesser: 2, time: 6, num: null }, { businesser: 2, time: 7, num: null },
        { businesser: 2, time: 8, num: null }, { businesser: 2, time: 9, num: null },
        { businesser: 2, time: 10, num: null }, { businesser: 2, time: 11, num: null },
        { businesser: 2, time: 12, num: null }, { businesser: 2, time: 13, num: null },
        { businesser: 2, time: 14, num: null }, { businesser: 2, time: 15, num: null },
        { businesser: 2, time: 16, num: null }, { businesser: 2, time: 17, num: null },
        { businesser: 2, time: 18, num: null }, { businesser: 2, time: 19, num: null },
        { businesser: 2, time: 20, num: null }, { businesser: 2, time: 21, num: null },
        { businesser: 2, time: 22, num: null },
        { businesser: 3, time: 6, num: null }, { businesser: 3, time: 7, num: null },
        { businesser: 3, time: 8, num: null }, { businesser: 3, time: 9, num: null },
        { businesser: 3, time: 10, num: null }, { businesser: 3, time: 11, num: null },
        { businesser: 3, time: 12, num: null }, { businesser: 3, time: 13, num: null },
        { businesser: 3, time: 14, num: null }, { businesser: 3, time: 15, num: null },
        { businesser: 3, time: 16, num: null }, { businesser: 3, time: 17, num: null },
        { businesser: 3, time: 18, num: null }, { businesser: 3, time: 19, num: null },
        { businesser: 3, time: 20, num: null }, { businesser: 3, time: 21, num: null },
        { businesser: 3, time: 22, num: null }

      ],
    predict:
      [
        { time: 6, num: null }, { time: 7, num: null },
        { time: 8, num: null }, { time: 9, num: null },
        { time: 10, num: null }, { time: 11, num: null },
        { time: 12, num: null }, { time: 13, num: null },
        { time: 14, num: null }, { time: 15, num: null },
        { time: 16, num: null }, { time: 17, num: null },
        { time: 18, num: null }, { time: 19, num: null },
        { time: 20, num: null }, { time: 21, num: null },
        { time: 22, num: null }
      ],
    area:
      [
        { time: 6, num: null }, { time: 7, num: null },
        { time: 8, num: null }, { time: 9, num: null },
        { time: 10, num: null }, { time: 11, num: null },
        { time: 12, num: null }, { time: 13, num: null },
        { time: 14, num: null }, { time: 15, num: null },
        { time: 16, num: null }, { time: 17, num: null },
        { time: 18, num: null }, { time: 19, num: null },
        { time: 20, num: null }, { time: 21, num: null },
        { time: 22, num: null }
      ]
  },

  createSimulationData: function () {
    var categories = [];
    var data = [];
    var predictdata = [];
    for (var i = 0; i < 17; i++) {
      categories.push("time:" + (i + 6));

      data.push(this.data.area[i].num);
      predictdata.push(this.data.predict[i].num);
    }
    // data[4] = null;
    return {
      categories: categories,
      data: data,
      predictdata: predictdata
    }
  },
  touchHandler: function (e) {
    console.log(lineChart.getCurrentDataIndex(e));
    lineChart.showToolTip(e, {
      // background: '#7cb5ec',
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },  
    mapUrl: "",
  

  onLoad: function () {
    this.setData({
      mapUrl: "http://data.peit.club/h0120845qdx.m701.mp4"
    });

    this.getbusinessnum();
    this.getareanum();
    this.predicrtnum();
    var windowWidth = 200;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    var simulationData = this.createSimulationData();
    lineChart = new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: simulationData.categories,
      animation: true,
      // background: '#f5f5f5',
      series: [{
        name: '实时数据',
        data: simulationData.data,
        format: function (val, name) {
          return val.toFixed(2) + '人';
        }
      }, {
        name: '预测数据',
        data: simulationData.predictdata,
        format: function (val, name) {
          return val.toFixed(2) + '人';
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: '游客人数 (人)',
        format: function (val) {
          return val.toFixed(2);
        },
        min: 0
      },
      width: 310,
      height: 150,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  getbusinessnum: function (e) {

    for (var i = 0; i < 51; i++) {
      if (this.data.business[i].time < 11) {
        var random = Math.ceil(Math.random() * 20);
        var str = "business[" + i + "].num";
        this.setData({ [str]: random });
      }
      else if (this.data.business[i].time < 14) {
        random = Math.ceil(Math.random() * 100);
        str = "business[" + i + "].num";
        this.setData({ [str]: random })
        if (this.data.business[i].num < 50)
          i--;
      }

      else if (this.data.business[i].time < 18) {
        random = Math.ceil(Math.random() * 60);
        str = "business[" + i + "].num";
        this.setData({ [str]: random })
        if (this.data.business[i].num < 30)
          i--;
      }

      else if (this.data.business[i].time < 20) {
        random = Math.ceil(Math.random() * 100);
        str = "business[" + i + "].num";
        this.setData({ [str]: random })
        if (this.data.business[i].num < 50)
          i--;
      }
      else {
        random = Math.ceil(Math.random() * 20);
        str = "business[" + i + "].num";
        this.setData({ [str]: random })
      }


    }
  }
  ,

  getareanum: function (e) {

    for (var i = 0; i < this.data.area.length; i++) {
      var str = "area[" + i + "].num";
      this.setData({ [str]: Math.ceil((this.data.business[i].num + this.data.business[i + 17].num + this.data.business[i + 34].num) / 3) })


    }


  },
  predicrtnum: function () {
    var avenum = 0
    var avetime = 0
    var powtime = 0
    var timenum = 0
    var a = 0
    var b = 0
    for (var i = 0; i < 17; i++) {
      if (this.data.predict[i].time < 11) {
        for (var j = 0; j < this.data.predict[i].time - 5; j++) { this.data.predict[i].num += this.data.area[j].num }
        this.data.predict[i].num = Math.ceil(this.data.predict[i].num / (this.data.predict[i].time - 5))
      }
      else if (this.data.predict[i].time == 11)
        this.data.predict[i].num = Math.ceil(this.data.area[i - 1].num * 8);
      else {
        this.data.predict[i].num = Math.ceil(this.data.area[i - 1].num * 0.9 + this.data.area[i - 2].num * 0.05 + this.data.area[i - 3].num * 0.05);
      }
    }
  }
})
  
