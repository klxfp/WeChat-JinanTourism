// pages/bookingRulesMore/bookingRulesMore.js
var __dirname = "pages/bookingRulesMore";
var __overwrite = require("../../utils/overwrite.js");
(function(require, Page) {
   var api = require("utils/api")(__dirname);
    Page({
      data:{
        bookingRules:[],
        scrollHeight:667,
      },
      onLoad:function(options){
        // 页面初始化 options为页面跳转所带来的参数
        var systemInfo = getApp().getAppSystemInfo()
        if(options.data){
          this.setData({
              bookingRules:JSON.parse(options.data),
              scrollHeight:systemInfo.windowHeight
          });
        }
      },
      seeElongTravelNotes:function(){
        api.Navigate.redirectTo({
          url:"../elongtravelnotes/elongtravelnotes"
        })
      }
    })
})(__overwrite.require(require, __dirname), __overwrite.Page);