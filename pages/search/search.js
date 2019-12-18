import * as wxSearch from '../../component/wxSearch/wxSearch';
import { getStorage, setStorage } from '../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabData: {
      searchList: getStorage('searchList'),
      tabs: ['好评优先', '距离优先', '更多筛选'],
      hotsSearch: [
        { name: '趵突泉', id: '1' },
        { name: '五龙潭', id: '2' },
        { name: '环城公园', id: '3' },
        { name: '大明湖', id: '4' },
        { name: '黑虎泉', id: '5' },
        { name: '济南国际园博园', id: '6' },
        { name: '泉城欧乐堡梦幻世界', id: '7' },
        { name: '泉城海洋极地世界', id: '8' },
        { name: '金象山乐园', id: '9' }
      ]
      ,
      activeIndex: 0,
      sliderOffset: 0,
      sliderLeft: 0,
      searchIsHidden: true,
      searchAllShow: false,
      inputVal: ''
    }
  },
  onLoad: function (options) {
    //初始渲染-读取storage的历史记录
    wxSearch.init(this)
  },
  bindSearchAllShow: function (e) {
    wxSearch.bindSearchAllShow(e, this)
  },
  bindInputSchool: function (e) {
    wxSearch.bindInputSchool(e, this)
  },
  bindGoSearch: function (e) {
    wxSearch.bindGoSearch(e, this)
  },
  bindClearSearch: function () {
    wxSearch.updataLog(this, [])
  },
  bindGoScene(e) {
    let val = e.currentTarget.dataset.item;
    wxSearch.goScene(val)
  },
  bindDelLog(e) {
    wxSearch.bindDelLog(e, this)
  },
  bindShowLog(e) {
    wxSearch.bindShowLog(e, this)
  },
  bindHideLog(e) {
    wxSearch.bindHideLog(e, this)
  },
  bindSearchHidden() {
    wxSearch.bindSearchHidden(this)
  }
})