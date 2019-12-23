// pages/elongtravelnotes/elongtravelnotes.js
var __dirname = "pages/elongtravelnotes";
var __overwrite = require("../../utils/overwrite.js");
(function(require, Page) {
   var api = require("utils/api")(__dirname),
    Util = require('utils/util');
    Page({
      data:{
        scrollHeight:667,
        scrollWidth:667,
        travelNoteImages:[
          "https://m.elongstatic.com/static/xcxticket/elongtravelnotes_1.jpg",
          "https://m.elongstatic.com/static/xcxticket/elongtravelnotes_2.jpg",
          "https://m.elongstatic.com/static/xcxticket/elongtravelnotes_3.jpg",
          "https://m.elongstatic.com/static/xcxticket/elongtravelnotes_4.jpg",
          "https://m.elongstatic.com/static/xcxticket/elongtravelnotes_5.jpg",
          "https://m.elongstatic.com/static/xcxticket/elongtravelnotes_6.jpg",
          "https://m.elongstatic.com/static/xcxticket/elongtravelnotes_7.jpg",
          "https://m.elongstatic.com/static/xcxticket/elongtravelnotes_8.jpg",
          "https://m.elongstatic.com/static/xcxticket/elongtravelnotes_9.jpg",
          "https://m.elongstatic.com/static/xcxticket/elongtravelnotes_10.jpg",
          "https://m.elongstatic.com/static/xcxticket/elongtravelnotes_11.jpg",
          "https://m.elongstatic.com/static/xcxticket/elongtravelnotes_12.jpg",
          "https://m.elongstatic.com/static/xcxticket/elongtravelnotes_13.jpg",
          "https://m.elongstatic.com/static/xcxticket/elongtravelnotes_14.jpg",
        ]//图片展示艺龙旅行注意事项pdf
      },
      onLoad:function(options){
        // 页面初始化 options为页面跳转所带来的参数
        var systemInfo = getApp().getAppSystemInfo()
        this.setData({
          scrollHeight:systemInfo.windowHeight,
          scrollWidth:systemInfo.windowWidth
        })
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