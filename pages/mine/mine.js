// 获取应用实例
var app = getApp();
// 注册页面
Page({
    data:{
        userInfo:{},
        nickName: "未登录",
        src: "/pages/mine/images/index1.png",
        swiperImg: [
          { src: "https://dimg06.c-ctrip.com/images/100m11000000rhzcqD3D4_R_1600_10000_Mtg_7.jpg" },
          { src: "https://dimg08.c-ctrip.com/images/100l0y000000m1ilk9C71_R_1600_10000_Mtg_7.jpg" },
          { src: "https://dimg04.c-ctrip.com/images/100w10000000ph6twC31B_R_1600_10000_Mtg_7.jpg" },
          { src: "http://img.mp.itc.cn/upload/20160829/2d606e73cb41478bbc634df54581ab14_th.jpg" },
          { src: "http://staticfile.tujia.com/upload/info/day_130531/201305310232448990_s.jpg" },
          { src: "http://img.soufun.com/news/2008_04/29/1209446420219.jpg" }
        ]
    },
    getMyInfo: function (e) {
      console.log(e.detail.userInfo)
      let info = e.detail.userInfo;
      this.setData({
        nickName: info.nickName,//更新名称
        src: info.avatarUrl//更新图片来源
      })
    },
    orders:function(event){
        wx.navigateTo({
          url: '/pages/mine/orders/orders'
        })
      },
    payment:function (event) {
        wx.navigateTo({
          url: '/pages/mine/payment/payment'
        })
    },
    totravel:function (event) {
      wx.navigateTo({
        url: '/pages/mine/totravel/totravel'
        })
    },
    Coupon: function (event) {
      wx.navigateTo({
        url: '/pages/mine/Coupon/Coupon'
      })
    },
    footprint: function (event) {
      wx.navigateTo({
        url: '/pages/mine/footprint/footprint'
      })
    },
    Collection: function (event) {
      wx.navigateTo({
        url: '/pages/mine/Collection/Collection'
      })
    },
    onLoad:function(){
        var that = this;
        // 调用应用实例的方法获取全局数据
        // app.getUserInfo(function(userInfo){
        //     // 更新数据
        //     that.setData({
        //         userInfo:userInfo
        //     })
        // });
        this.setData({
          userInfo: getApp().globalData.userInfo
        })
        if (getApp().globalData.userInfo.avatarUrl) {
          console.log(getApp().globalData.userInfo.avatarUrl)
          this.setData({
            headerImg: getApp().globalData.userInfo.avatarUrl
          })
        }
      }
})