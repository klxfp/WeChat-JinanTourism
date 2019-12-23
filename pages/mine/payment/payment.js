//获取应用实例
var app = getApp()
Page({
  data: {
    totalIncome: 0.0,
    runningMoney: 0.0,
    publicWelfareMoney: 0.0,
    orderNum: 123456789,
    appointmentNum: 5,
    appointmentTime: '2019年12月16日  11:42',
    orderTime: '2019年12月16日  11:42',
    hasData: true,
    navTab: ["全部", "待付款", "待出行", "已完成", "订单收藏"],
    moneyInfo: [, , , , , , ,],
    nickName: '测试',
    phoneNum: '18202801506',
    // statusImage: ['../images/daijiedai.png'],
    currentNavtab: 1,
    // statusText: ['未付款待出行'],
    startPoint: [0, 0]
  },

  catchtouchstart: function (e) {
    var that = this;
    that.setData({
      startPoint: [e.touches[0].clientX, e.touches[0].clientY]
    })
  },

  catchtouchend: function (e) {
    var that = this;
    var currentNum = parseInt(this.data.currentNavtab);

    // that.endX = e.changedTouches[0].clientX;
    // that.endY = e.changedTouches[0].clientY;

    // if(that.endX  - that.startX > 10 && currentNum > 0){
    //   currentNum -= 1;
    // }

    // if(that.endX - that.startX < -10 && currentNum< this.data.navTab.length -1){
    //   currentNum=currentNum + 1;
    // }

    var endPoint = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
    var startPoint = that.data.startPoint
    if (endPoint[0] <= startPoint[0]) {
      if (Math.abs(endPoint[0] - startPoint[0]) >= Math.abs(endPoint[1] - startPoint[1]) && currentNum < this.data.navTab.length - 1) {
        currentNum = currentNum + 1;
      }
    } else {
      if (Math.abs(endPoint[0] - startPoint[0]) >= Math.abs(endPoint[1] - startPoint[1]) && currentNum > 0) {
        currentNum -= 1;
      }
    }

    this.setData({
      currentNavtab: currentNum
    });
  },

  switchTab: function (e) {
    this.setData({
      currentNavtab: e.currentTarget.dataset.idx
    });
  },


  callEvent: function (e) {
    console.log(e)
    wx.makePhoneCall({
      phoneNumber: this.data.phoneNum
    })
  },

  goDeatailEvent: function () {
    wx.navigateTo({
      url: '../orderManage/orderDeatail/orderDeatail'
    })
  },
  getMyInfo: function (e) {
    console.log(e.detail.userInfo)
    let info = e.detail.userInfo;
    this.setData({
      nickName: info.nickName,//更新名称
      src: info.avatarUrl//更新图片来源
    })
  },
  // 加载
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '订单管理'
    })
    var that = this
    //更新数据
  }
})
