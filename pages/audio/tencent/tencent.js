Page({
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.autoplay = true;
    innerAudioContext.loop = true;

    wx.request({
      url: 'http://39.96.184.98:8282/speech.php',
      data: {},
      method: 'POST',
      success(res) {
        console.log('success');
        console.log(res);
        let data = res.data;
        if (data.ret === 0) {
          innerAudioContext.src = data.data; //后端返回的mp3文件地址        
          innerAudioContext.onPlay(() => {
            console.log('开始播放啦');
          });
          innerAudioContext.onError((res) => {
            console.log(res.errMsg)
            console.log(res.errCode)
          });

        }
      },
      fail(err) {
        console.log('err');
        console.log(err)
      }
    });
  }
})