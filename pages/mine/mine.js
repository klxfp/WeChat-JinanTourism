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
          { src: "https://dimg04.c-ctrip.com/images/100w10000000ph6twC31B_R_1600_10000_Mtg_7.jpg" }
        ],
        menuList:[
            {
                list:[
                    {
                        name:'下载中心',
                        page:'down-center/down-center',
                        icon:'../../images/down_center_icon.png',
                        arrow:'../../images/ic_arrow_right.png'
                    },
                    {
                        name:'我的订单',
                        page:'my-order/my-order',
                        icon:'../../images/myorder_icon.png',
                        arrow:'../../images/ic_arrow_right.png'
                    },
                    {
                        name:'购物车',
                        page:'shopping-car/shopping-car',
                        icon:'../../images/icon_shoppingcart_blue.png',
                        arrow:'../../images/ic_arrow_right.png'
                    },
                    {
                        name:'我的钱包',
                        page:'my-voucher/my-voucher',
                        icon:'../../images/voucher_icon.png',
                        arrow:'../../images/ic_arrow_right.png'
                    }
                ]
            }
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
    trail:function(event){
      wx.navigateTo({
        url: '/pages/mine/detail/detail'
      })
    },
   collectio:function (event) {
      wx.navigateTo({
        url: '/pages/mine/history/history'
      })
   },
    commen:function (event) {
     wx.navigateTo({
       url: '/pages/mine/collection/collection'
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