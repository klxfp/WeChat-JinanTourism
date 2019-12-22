// pages/mine/orders/orders.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index:0,
    array: ['全部', '酒店', '机票', '火车票','汽车票','门票','用车','度假','民宿','优品','向导','活动']
    },
  liaojie: function (event) {
    wx.navigateTo({
      url: '/pages/audio/audio'
    })
  },
  bindPickerChange:function(e){
    this.setData({
      index: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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

  }
})