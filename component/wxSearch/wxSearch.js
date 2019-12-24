import { getStorage, setStorage, setData } from '../../utils/util';
// component/wxSearch.js
module.exports = {
  init(that) {
    this._setData(that, {
      'searchList': getStorage('searchList') || []
    })
  },
  bindShowLog(e, that) {
    this.showlog(that)
  },
  bindHideLog(e, that) {
    this._setData(that, {
      'searchIsHidden': true
    })
  },
  bindInputSchool(e, that) {
    var val = e.detail.value;
    this.matchStroage(that, val)
  },
  bindSearchAllShow(e, that) {
    this._setData(that, {
      searchAllShow: true
    })
  },
  bindGoSearch(e, that) {
    let searchList_stroage = getStorage('searchList') || [];
    const inputVal = that.data.tabData.inputVal;
    searchList_stroage.push(inputVal)

    setStorage('searchList', searchList_stroage)
    this._setData(that, {
      inputVal: ''
    })
    this.goMap(inputVal)
  },

  bindDelLog(e, that) {
    let val = e.currentTarget.dataset.item;
    let searchList_stroage = getStorage('searchList') || [];
    let index = searchList_stroage.indexOf(val);
    searchList_stroage.splice(index, 1)
    this.updataLog(that, searchList_stroage)
  },
  bindSearchHidden(that) {
    this._setData(that, {
      searchIsHidden: true
    })
  },
  showlog(that) {
    let searchList_stroage = getStorage('searchList') || [];
    let searchList = []
    if (typeof (searchList_stroage) != undefined && searchList_stroage.length > 0) {
      for (var i = 0, len = searchList_stroage.length; i < len; i++) {
        searchList.push(searchList_stroage[i])
      }
    } else {
      searchList = searchList_stroage
    }
    this._setData(that, {
      searchIsHidden: false,
      searchAllShow: false,
      searchList
    })
  },
  matchStroage(that, val) {
    let searchList_stroage = getStorage('searchList') || [];
    let searchList = []
    if (typeof (val) != undefined && val.length > 0 && typeof (searchList_stroage) != undefined && searchList_stroage.length > 0) {
      for (var i = 0, len = searchList_stroage.length; i < len; i++) {
        if (searchList_stroage[i].indexOf(val) != -1) {
          searchList.push(searchList_stroage[i])
        }
      }
    } else {
      searchList = searchList_stroage
    }
    this._setData(that, {
      inputVal: val,
      searchList
    })
  },
  _setData(that, param) {
    let tabData = that.data.tabData;
    for (var key in param) {
      tabData[key] = param[key];
    }
    that.setData({
      tabData
    })
  },
  updataLog(that, list) {
    setStorage('searchList', list)
    this._setData(that, {
      searchList: list
    })
  },
  goMap2(e){
    var inputVal = e.currentTarget.dataset.item;
    console.log(inputVal);
    // this.goMap(inputVal);
    console.log(e.currentTarget.dataset.item);
  },
  goMap(val) {
    wx.showModal({
      title: '调往搜索页面',
      content: `你搜索的是${val}，将跳转至新页面`,
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          console.log(val)
          if (val == "趵突泉" || val == "突泉") {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s1/s1',
            })
          }
          else if (val == "五龙潭") {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s2/s2',
            })
          }
          else if (val == "环城公园") {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s3/s3',
            })
          }
          else if (val == "大明湖") {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s4/s4',
            })
          }
          else if (val == "黑虎泉") {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s5/s5',
            })
          }
          else if (val == "济南国际园博园") {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s6/s6',
            })
          }
          else if (val == "泉城欧乐堡梦幻世界") {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s7/s7',
            })
          }
          else if (val == "海洋极地世界") {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s8/s8',
            })
          }
          else if (val == "金象山乐园") {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s9/s9',
            })
          }
        }
        else if (res.cancel) {
          wx.navigateTo({
            url: '/component/wxSearch/wxSearch',
          })
        }
      }
    })
  },
  goScene(val) {
    wx.showModal({
      title: '调往搜索页面',
      content: `你搜索的是${val.name}，将跳转至新页面`,
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          if (val.id == 1) {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s1/s1',
            })
          }
          else if (val.id == 2) {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s2/s2',
            })
          }
          else if (val.id == 3) {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s3/s3',
            })
          }
          else if (val.id == 4) {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s4/s4',
            })
          }
          else if (val.id == 5) {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s5/s5',
            })
          }
          else if (val.id == 6) {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s6/s6',
            })
          }
          else if (val.id == 7) {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s7/s7',
            })
          }
          else if (val.id == 8) {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s8/s8',
            })
          }
          else if (val.id == 9) {
            wx.navigateTo({
              url: '../../pages/audio/scenic/s9/s9',
            })
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
          wx.redirectTo({
            url: '/component/wxSearch/wxSearch',
          })
        }

      }

    })
  }
}