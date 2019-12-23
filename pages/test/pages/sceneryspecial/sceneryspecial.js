// pages/sceneryspecial/sceneryspecial.js
var __dirname = "pages/sceneryspecial";
var __overwrite = require("../../utils/overwrite.js");
(function(require, Page) {
   var api = require("utils/api")(__dirname),
    Util = require('utils/util'),
    DetailService = require('service/detail'),
    mRefreshData = false;
    Page({
      data:{
        sceneryid:'',
        scrollViewHeight:0,
        descriptionlist:[],
      },
      onLoad:function(options){
        // 页面初始化 options为页面跳转所带来的参数
        mRefreshData = false
        this.data.sceneryid = options.sceneryid
        this.setData({
          scrollViewHeight:getApp().getAppSystemInfo().windowHeight
        });
        this.loadData()
        if(options.scenerytitle){
          api.NavigationBar.setTitle({title:options.scenerytitle});
        }
      },
      loadData:function(){
        var that = this
        DetailService.GetSceneryDescription(this.data.sceneryid,1).then(function(data){
          that.setData({
            descriptionlist:that.formateData(data)
          });
          that.stopRefresh()
        });
      },
      onPullDownRefresh: function(){
        mRefreshData = true
        this.loadData()
      },
      stopRefresh:function(){
        if(mRefreshData) {
            mRefreshData = false
            wx.stopPullDownRefresh()
        }
      },
      formateData(data) {
        if(!data || !data.scenicSpecialInfoList || data.scenicSpecialInfoList.length == 0) {
          return []
        }
        var itemList = data.scenicSpecialInfoList;
        for(var i = 0; i < itemList.length; i++) {
          var item = itemList[i]
          if (item && item.title == '景点介绍' && item.scenicItemInfoList && item.scenicItemInfoList.length > 0) {
            var scenicItemInfoList = item.scenicItemInfoList;
            for(var j = 0; j< scenicItemInfoList.length;j++){
              if (scenicItemInfoList[j] && scenicItemInfoList[j].imgePath) {
                scenicItemInfoList[j].imgePath = Util.formateImgUrl(scenicItemInfoList[j].imgePath)
              }
            }
          }
        }
        return itemList;
      },
      onReady:function(){
        // 页面渲染完成
      },
      onShow:function(){
        // 页面显示
      },
      onHide:function(){
        // 页面隐藏
      },
      onUnload:function(){
        // 页面关闭
      }
    })
})(__overwrite.require(require, __dirname), __overwrite.Page);