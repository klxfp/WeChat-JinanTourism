const app = getApp();
//引入插件：微信同声传译
const plugin = requirePlugin('WechatSI');

var startPoint;
//引入本地json数据，这里引入的就是第一步定义的json数据
var jsonData = require('../json.js');

console.log(jsonData.dataList[0]);
console.log(jsonData.dataList[0].name);



Page({
  data: {
    viewTop: 0,
    viewLeft: 0,
    windowHeight: '',
    windowWidth: '',
    imgurl: "../../../../images/icon_play.png",
    isShow: true,
    isMove: false,
    isChange: false,
    content: '请先点击文字选择解说内容。', //内容
    src: ''

  },
  onReady(e) {
    //创建内部 audio 上下文 InnerAudioContext 对象。
    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.onError(function (res) {
      console.log(res);
      wx.showToast({
        title: '语音播放失败',
        icon: 'none',
      })
    })
  },
  onLoad: function (options) {

    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        // 屏幕宽度、高度
        console.log('height=' + res.windowHeight);
        console.log('width=' + res.windowWidth);
        // 高度,宽度 单位为px
        that.setData({
          dataList: jsonData.dataList[0],
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          viewTop: res.windowHeight * 0.9 - 50,
          viewLeft: res.windowWidth * 0.05
        })
      }
    })
  },

  onShow: function () {

  },
  setContent: function (e) {
    console.log(e.currentTarget.dataset.text)
    this.setData({
      content: e.currentTarget.dataset.text,
    })
  },
  // 文字转语音
  wordYun: function (e) {
    var that = this;
    var content = this.data.content;
    plugin.textToSpeech({
      lang: "zh_CN",
      tts: true,
      content: content,
      success: function (res) {
        console.log(res);
        console.log("succ tts", res.filename);
        that.setData({
          src: res.filename
        })
        that.yuyinPlay();

      },
      fail: function (res) {
        console.log("fail tts", res)
      }
    })
  },

  viewStart: function (e) {
    startPoint = e.touches[0]
    console.log("start")

  },
  viewMove: function (e) {
    console.log("move")

    var endPoint = e.touches[e.touches.length - 1]
    var translateX = endPoint.clientX - startPoint.clientX
    var translateY = endPoint.clientY - startPoint.clientY
    startPoint = endPoint
    var viewTop = this.data.viewTop + translateY
    var viewLeft = this.data.viewLeft + translateX
    //判断是移动否超出屏幕
    if (viewLeft + 50 >= this.data.windowWidth) {
      viewLeft = this.data.windowWidth - 50;
    }
    if (viewLeft <= 0) {
      viewLeft = 0;
    }
    if (viewTop <= 0) {
      viewTop = 0
    }
    if (viewTop + 50 >= this.data.windowHeight) {
      viewTop = this.data.windowHeight - 50;
    }
    this.setData({
      viewTop: viewTop,
      viewLeft: viewLeft,
      isMove: true
    })
  },
  viewEnd: function (e) {
    console.log("end")
    if (this.data.isMove == true) {
      console.log("动了")
      this.setData({
        isMove: false
      })
    } else {
      console.log("没动")
      if (this.data.isChange == false) {
        this.setData({
          isChange: true,
          imgurl: "../../../../images/icon_stop.png",
        });
        // 播放事件在此写
        console.log("播放")
        if (this.data.src == '') {
          console.log(暂无语音);
          return;
        }
        console.log("??")
        this.innerAudioContext.src = this.data.src //设置音频地址
        this.innerAudioContext.play(); //播放音频
        console.log("播放ok")
      } 
      else {
        this.setData({
          isChange: false,
          imgurl: "../../../../images/icon_play.png",
        });
        // 停止事件在此写
        this.innerAudioContext.pause(); //暂停音频
        console.log("停止")
      }

    }

  },
  close_tap: function () {
    this.setData({
      isShow: true
    })
  },

  open_tap: function () {
    this.setData({
      isShow: false
    })
  },

  open: function (res) {
    console.log(res);
    let url
    if (res.currentTarget.dataset.msg == "../../../../images/icon_play.png") {
      url = "../../../../images/icon_play.png"
    } else {
      url = "../../../../images/icon_stop.png"
    }
    this.setData({
      url: url
    })

  }

})