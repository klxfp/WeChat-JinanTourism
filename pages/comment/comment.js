var that
const app = getApp()
// pages/comment/comment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    totalCount: 0,
    topics: {},
    tishi: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    wx.cloud.init({
      env: app.globalData.evn
    }),
    that.getData();
  },
  Topublish: function () {
    wx.navigateTo({
      url: '../publish/publish'
    })
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
    that.getData();
  },

  getData: function () {
    const db = wx.cloud.database();

    db.collection('topic')
      .orderBy('date', 'desc')//倒序查询
      .get({
        success: function (res) {
          // res.data 是包含以上定义的两条记录的数组
          console.log("数据：" + res.data)
          if (!res.data.length <= 0) {
            that.setData({
              tishi: "暂时没有留言哦~"
            })
          }
          if (res.data.length > 0) {
            that.setData({
              tishi: ""
            })
          }
          that.data.topics = res.data;
          // for(var i=0;i<res.data.length;i++){
          //   res.data[i].date = new Date(+new Date(res.data[i].date) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '');
          //   console.log(res.data[i].date);
          // }
          that.setData({
            topics: that.data.topics,

          })
          wx.hideNavigationBarLoading(); //隐藏加载
          wx.stopPullDownRefresh();

        },
        fail: function (event) {
          wx.hideNavigationBarLoading(); //隐藏加载
          wx.stopPullDownRefresh();
        }
      })

  },

  /**
  * item 点击
  */
  onItemClick: function (event) {
    var id = event.currentTarget.dataset.topicid;
    var openid = event.currentTarget.dataset.openid;
    console.log("id:" + id);
    console.log("openid:" + openid);
    wx.navigateTo({
      url: "../homeDetail/homeDetail?id=" + id + "&openid=" + openid
    })
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
    wx.showNavigationBarLoading() //在标题栏中显示加载
    that.getData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var temp = [];
    // 获取后面十条
    if (this.data.topics.length < this.data.totalCount) {
      const db = wx.cloud.database();
      db.collection('topic').get({
        success: function (res) {
          // res.data 是包含以上定义的两条记录的数组
          if (res.data.length > 0) {
            for (var i = 0; i < res.data.length; i++) {
              var tempTopic = res.data[i];
              console.log(tempTopic);
              temp.push(tempTopic);
            }

            var totalTopic = {};
            totalTopic = that.data.topics.concat(temp);

            console.log(totalTopic);
            that.setData({
              topics: totalTopic,
            })
          } else {
            wx.showToast({
              title: '没有更多数据了',
            })
          }
        },
      })
    } else {
      wx.showToast({
        title: '没有更多数据了',
      })
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})