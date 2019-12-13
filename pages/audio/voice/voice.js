// 引入文字转语音插件
const plugin = requirePlugin("WechatSI")

const innerAudioContext = wx.createInnerAudioContext();

Page({
  onReady: function(e) {},
  data: { },
  //事件处理函数
  bindViewTap: function() {
  },
  onLoad: function() {
    var that = this;
    // 调用插件的文字转语音功能, content=要转的文字
    plugin.textToSpeech({
      lang: "zh_CN",
      content: "测试语音",
      success: resTrans => {
        console.log(resTrans)
        const tempFilePath = resTrans.filename;
        // 将转换好的语音下载到本地
        wx.downloadFile({
          url: resTrans.filename,
          success: res => {
            console.log(res)
            // 将地址赋给播放器
            innerAudioContext.src = res.tempFilePath;
          }
        })
      },
      fail(resTrans) {
        console.warn("语音合成失败", resTrans, item)
      }
    })
  },
  // 播放
  startVoice(e) {
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
