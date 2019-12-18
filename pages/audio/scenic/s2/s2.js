// pages/audio/scenic/s2/s2.js

//云数据库初始化
const db = wx.cloud.database({});
const cont = db.collection('books');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("11")
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("22")
    db.collection('book').get({
      success(res) {
        console.log("******")
        console.log(res.data)
      }
    })


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("33")

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("55")
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("66")
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("77")
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("88")
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log("99")
  }
})