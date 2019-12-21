const app = getApp();
//引入插件：微信同声传译
const plugin = requirePlugin('WechatSI');

var startPoint;
//引入本地json数据，这里引入的就是第一步定义的json数据
var jsonData = require('../json.js');

console.log(jsonData.dataList[8]);



Page({
  data: {
    viewTop: 0,
    viewLeft: 0,
    windowHeight: '',
    windowWidth: '',
    imgurl: "../../../../images/icon_play.png",
    viewrgba: "rgb(102, 102, 102);",
    isShow: true,
    isMove: false,
    isChange: false,
    content: '请先点击文字选择解说内容。', //内容
    src: '',
    color0: "#666",
    color1: "#666",
    color2: "#666",
    color3: "#666",
    color4: "#666",
    color5: "#666",
    color6: "#666",
    color7: "#666",
    color8: "#666",
    color9: "#666",
    time: "00:00"

  },
  onReady(e) {
    console.log("ready")
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
          dataList: jsonData.dataList[8],
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
    console.log(e.currentTarget.dataset.text)
    this.setData({
      content: e.currentTarget.dataset.text
    })
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
        // that.yuyinPlay();

      },
      fail: function (res) {
        console.log("fail tts", res)
        wx.showToast({
          title: "请先等待一分钟后再点击文字！",
          image: "../../../../images/fail.png",//自定义图标的本地路径，image 的优先级高于 icon
          duration: 2000,//提示的延迟时间，单位毫秒，默认：1500 
          mask: false,//是否显示透明蒙层，防止触摸穿透，默认：false 
          success: function () { },
          fail: function () { },
          complete: function () { }
        })
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
      viewrgba: "rgb(90,90, 90);",
      isMove: true
    })
  },
  viewEnd: function (e) {
    console.log("end")
    if (this.data.isMove == true) {
      console.log("动了")
      this.setData({
        viewrgba: "rgb(102, 102, 102);",
        isMove: false
      })
    } else {
      console.log("没动")
      if (this.data.isChange == false) {
        this.setData({
          isChange: true,
          viewrgba: "rgb(102,102, 102);",
          imgurl: "../../../../images/icon_stop.png",
        })
        // 播放事件在此写
        console.log("播放");
        if (this.data.src == '') {
          console.log("暂无语音");
          wx.showToast({
            title: "请先点击文字",
            image: "../../../../images/fail.png",//自定义图标的本地路径，image 的优先级高于 icon
            duration: 2000,//提示的延迟时间，单位毫秒，默认：1500 
            mask: false,//是否显示透明蒙层，防止触摸穿透，默认：false 
            success: function () { },
            fail: function () { },
            complete: function () { }
          })
          this.setData({
            isChange: false,
            imgurl: "../../../../images/icon_play.png",
          })

        }
        else {
          this.innerAudioContext.src = this.data.src //设置音频地址
          this.innerAudioContext.play(); //播放音频
          console.log("播放ok")

          setTimeout(() => {
            this.innerAudioContext.currentTime
            this.innerAudioContext.onTimeUpdate(() => {
              var sumtime = this.innerAudioContext.duration
              var thistime = this.innerAudioContext.currentTime
              console.log(sumtime)   //总时长
              console.log(thistime)   //当前播放进度
              if (this.innerAudioContext.currentTime >= this.innerAudioContext.duration * 0.95) {
                this.setData({
                  isChange: false,
                  imgurl: "../../../../images/icon_play.png",
                  color0: "#666",
                  time: "00:00"
                })
              }
              else {
                this.setData({
                  time: "00:" + ((sumtime - thistime).toFixed())
                })
              }

            })
          }, 300)
        }
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
  },

  change_clr1: function (e) {
    console.log("change1")
    this.setData({
      color0: "#666",
      color1: "#1287FF",
      color2: "#666",
      color3: "#666",
      color4: "#666",
      color5: "#666",
      color6: "#666",
      color7: "#666",
      color8: "#666",
      color9: "#666"
    })


  },
  change_clr2: function (e) {
    console.log("change2")
    this.setData({
      color0: "#666",
      color1: "#666",
      color2: "#1287FF",
      color3: "#666",
      color4: "#666",
      color5: "#666",
      color6: "#666",
      color7: "#666",
      color8: "#666",
      color9: "#666"
    })
  },
  change_clr3: function (e) {
    console.log("change3")
    this.setData({
      color0: "#666",
      color1: "#666",
      color2: "#666",
      color3: "#1287FF",
      color4: "#666",
      color5: "#666",
      color6: "#666",
      color7: "#666",
      color8: "#666",
      color9: "#666"
    })
  },
  change_clr4: function (e) {
    console.log("change4")
    this.setData({
      color0: "#666",
      color1: "#666",
      color2: "#666",
      color3: "#666",
      color4: "#1287FF",
      color5: "#666",
      color6: "#666",
      color7: "#666",
      color8: "#666",
      color9: "#666"
    })
  },
  change_clr5: function (e) {
    console.log("change5")
    this.setData({
      color0: "#666",
      color1: "#666",
      color2: "#666",
      color3: "#666",
      color4: "#666",
      color5: "#1287FF",
      color6: "#666",
      color7: "#666",
      color8: "#666",
      color9: "#666"
    })
  },
  change_clr6: function (e) {
    console.log("change6")
    this.setData({
      color0: "#666",
      color1: "#666",
      color2: "#666",
      color3: "#666",
      color4: "#666",
      color5: "#666",
      color6: "#1287FF",
      color7: "#666",
      color8: "#666",
      color9: "#666"
    })
  },
  change_clr7: function (e) {
    console.log("change7")
    this.setData({
      color0: "#666",
      color1: "#666",
      color2: "#666",
      color3: "#666",
      color4: "#666",
      color5: "#666",
      color6: "#666",
      color7: "#1287FF",
      color8: "#666",
      color9: "#666"
    })
  },
  change_clr8: function (e) {
    console.log("change8")
    this.setData({
      color0: "#666",
      color1: "#666",
      color2: "#666",
      color3: "#666",
      color4: "#666",
      color5: "#666",
      color6: "#666",
      color7: "#666",
      color8: "#1287FF",
      color9: "#666"
    })
  },
  change_clr9: function (e) {
    console.log("change9")
    this.setData({
      color0: "#666",
      color1: "#666",
      color2: "#666",
      color3: "#666",
      color4: "#666",
      color5: "#666",
      color6: "#666",
      color7: "#666",
      color8: "#666",
      color9: "#1287FF"
    })
  },
  onUnload: function () {
    this.innerAudioContext.stop()
  }
})