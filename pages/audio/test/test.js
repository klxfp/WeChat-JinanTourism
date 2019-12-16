< script >
  import voiceIdArray from './voiceIdArray'
export default {
  data() {
    return {
      array: voiceIdArray.aispeech,
      platArr: [{
        id: 'xf',
        name: '科大讯飞'
      }, {
        id: 'aispeech',
        name: '思必驰'
      }, {
        id: 'baidu',
        name: '百度'
      }],
      platIndex: 1,
      index: 26,
      text: `改革春风吹满地，吹满地，春风吹满地。\n中国人民真争气，真争气，人民真争气。\n这个世界太疯狂，耗子都给猫当伴娘。\n齐德隆，齐东强。\n齐德隆的咚得隆咚锵。`,
      voiceId: 'lili1f_diantai',
      speed: 1,
      textAreaFocus: false,
      audioCtx: null,
      ttsServer: 'https://tts.server.com',
      audioSrc: '',
      downloadUrl: '',
      xfSpeedObj: {
        min: 0,
        max: 100,
        default: 50,
        step: 1
      },
      aispeechSpeedObj: {
        min: 0.7,
        max: 2,
        default: 1,
        step: 0.1
      },
      baiduSpeedObj: {
        min: 0,
        max: 9,
        default: 5,
        step: 1
      },
      speedObj: {}
    }
  },
  watch: {
    platIndex(newVal, oldVal) {
      if (newVal === 2) {
        this.array = voiceIdArray.baidu this.index = 0 this.speedObj = this.baiduSpeedObj
      }
      if (newVal === 1) {
        this.array = voiceIdArray.aispeech this.index = 26 this.speedObj = this.aispeechSpeedObj
      }
      if (newVal === 0) {
        this.array = voiceIdArray.xf this.index = 0 this.speedObj = this.xfSpeedObj
      }
    }
  },
  onShareAppMessage() {
    return {
      title: '文本转语音服务，多发音人可选'
    }
  },
  methods: {
    onSpeedChange(e) {
      this.speedObj.default = e.target.value
    },
    bindPlatChange(e) {
      this.platIndex = e.target.value * 1
    },
    bindPickerChange(e) {
      this.index = e.target.value
    },
    getAudioSrc() {
      if (this.text === '') {
        return false
      }
      const speed = this.speedObj.default
      const voiceId = this.array[this.index].id
      const plat = this.platArr[this.platIndex].id
      return encodeURI(`${this.ttsServer}/tts?plat=${plat}&voiceId=${voiceId}&speed=${speed}&text=${this.text}`)
    },
    getDownloadUrl() {
      const plat = this.platArr[this.platIndex].id
      const voiceId = this.array[this.index].id wx.showLoading({
        title: '加载中'
      }) wx.request({
        url: 'https://tts.server.com/getdownloadurl',
        data: {
          plat: plat,
          voiceId: voiceId,
          speed: this.speedObj.default,
          text: this.text
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          wx.hideLoading() wx.setClipboardData({
            data: res.data.short_url,
            success(res) {
              wx.showToast({
                title: '链接已复制请用浏览器下载(ios端无法下载)',
                icon: 'none',
                duration: 3000
              })
            }
          })
        }
      })
    },
    audioPlay() {
      this.audioCtx.src = this.getAudioSrc() if (!this.audioCtx.src) {
        wx.showToast({
          title: '请先输入文本',
          icon: 'none',
          duration: 2000
        }) return false
      }
      wx.showLoading({
        title: '加载中'
      }) this.audioCtx.play()
    },
    audioDownload() {
      this.getDownloadUrl()
    },
    bindTextAreaBlur(e) {
      this.textAreaFocus = false this.text = e.target.value
    },
    bindTextAreaFocus() {
      this.textAreaFocus = true
    }
  },
  created() {
    this.speedObj = this.aispeechSpeedObj
  },
  mounted() {
    this.audioCtx = wx.createInnerAudioContext() this.audioCtx.onEnded((res) => {
      wx.hideLoading()
    }) this.audioCtx.onPlay((res) => {
      wx.hideLoading()
    }) wx.showShareMenu({
      withShareTicket: true
    })
  }
} </script>