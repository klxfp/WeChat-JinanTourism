var that;
var dateA = "";
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    openid: '',
    content: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    that.data.id = options.id;
    that.data.openid = options.openid;
  },

  bindKeyInput(e) {
    that.data.content = e.detail.value;
    console.log("内容：" + that.data.content)

  },
  GetCurrentTime: function () {
    var now = new Date();
    var year = now.getFullYear();       //年  
    var month = now.getMonth() + 1;     //月  
    var day = now.getDate();            //日  
    var hh = now.getHours();            //时  
    var mm = now.getMinutes();          //分  
    var ss = now.getSeconds();            //秒  
    dateA = year + "年";
    if (month < 10) dateA += "0";
    dateA += month + "月";
    if (day < 10) dateA += "0";
    dateA += day + "日 ";
    if (hh < 10) dateA += "0";
    dateA += hh + ":";
    if (mm < 10) dateA += '0';
    dateA += mm + ":";
    if (ss < 10) dateA += '0';
    dateA += ss;
    return (dateA);
  },

  saveReplay: function() {
    db.collection('replay').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        content: that.data.content,
        date: that.GetCurrentTime(),
        r_id: that.data.id,
        u_id: that.data.openid,
        t_id: that.data.id,
      },
      success: function(res) {
        wx.showToast({
          title: '评论成功',
        })
        setTimeout(function() {
          wx.navigateBack({
            url: "../homeDetail/homeDetail?id=" + that.data.id + "&openid=" + that.data.openid
          })
        }, 1500)

      },
      fail: console.error
    })
  }

})