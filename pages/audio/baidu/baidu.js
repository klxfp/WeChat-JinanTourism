const root = "http://192.168.31.213:8899/";
const innerAudioContext = wx.createInnerAudioContext();

Page({
  data: {
    token: "",
    fileName: ""
  },
  onLoad: function() {

  },
  getToken() {
    console.log("getToken");
    var that = this;
    wx.request({
      url: root + '/getToken',
      success(res) {
        console.log(res)
        that.setData({
          token: res.data
        });
      }
    })
  },
  downloadAudio() {
    var that = this;
    wx.downloadFile({
      url: root + "/download/get", //仅为示例，并非真实的资源
      success(res) {
        that.setData({
          fileName: res.tempFilePath
        });
        innerAudioContext.src = res.tempFilePath;
      }
    })
  },
  voiceAudio() {
    var audio = wx.createAudioContext();
  },
  // 播放
  startVoice(e) {
    console.log("播放")
    innerAudioContext.play();
  },
  // 停止
  stopVoice(path) {
    innerAudioContext.stop();
  },
  // 暂停
  pause() {
    innerAudioContext.pause();
  },
  // 继续播放
  conti() {
    innerAudioContext.play();
  },
  // 重新播放
  again() {
    innerAudioContext.seek(0);
    innerAudioContext.play();
  }
})