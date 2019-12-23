// pages/additionalinfo/additionalinfo.js
var __dirname = "pages/additionalinfo";
var __overwrite = require("../../utils/overwrite.js");
(function(require, Page) {
   var api = require("utils/api")(__dirname),
    Util = require('utils/util'),
    SpotClick = require('utils/spot-click');
    var app = getApp();
    Page({
      data:{
        expandInfos:{},
        pageTitle:"",
        inputType:1,//1,单选框 2 复选框
        typeDesc:"",
        typeId:-1,
      },
      onLoad:function(options){
        // 页面初始化 options为页面跳转所带来的参数
        __wxConfig.debug && console.log("additionalinfo options = ", options)
        var tempExpandInfos = {},
            tempPageTitle = "附加信息";
        if (options.expandInfos) {
          tempExpandInfos = JSON.parse(decodeURIComponent(options.expandInfos));
          if (tempExpandInfos.selectItemList && tempExpandInfos.selectItemList.length>0) {
            tempPageTitle = "选择" + tempExpandInfos.typeDesc;
            var tempDesc = tempPageTitle + (tempExpandInfos.inputType == 2 ? "多选" :"");
            for (var i = 0; i < tempExpandInfos.selectItemList.length; i++) {
              var selectItem = tempExpandInfos.selectItemList[i];
              selectItem.firstSelectState = selectItem.isSelected;
            }
            this.setData({
              expandInfos:tempExpandInfos,
              inputType:tempExpandInfos.inputType,
              typeDesc: tempDesc,
              typeId:tempExpandInfos.typeId,
            });
          }
          api.NavigationBar.setTitle({
            title:tempPageTitle
          })
        }
      },
       //选择点击
      selectItem:function(options){
        __wxConfig.debug && console.log("selectItem options")
        var item = options.currentTarget.dataset.item,
            index = options.currentTarget.dataset.index;
        if(this.data.inputType == 1){//单选
          this.radiocheck(item, index);
        }else{//复选
          this.checkBoxCheck(item, index);
        }
      },
      //单选
      radiocheck:function(item, index){
        for (var i = 0; i < this.data.expandInfos.selectItemList.length; i++) {
          this.data.expandInfos.selectItemList[i].isSelected = index == i;
        }
        this.setData({
          expandInfos:this.data.expandInfos,
        });
        this.onConfirm();
      },
      //复选
      checkBoxCheck:function(item, index){
        this.data.expandInfos.selectItemList[index].isSelected = !item.isSelected;
        this.setData({
          expandInfos:this.data.expandInfos,
        });
      },
      onCancel(){
        api.Navigate.back();
      },
      onConfirm(){
        //todo 传值填单页
        var currentPages = getCurrentPages(),
            lastPage = currentPages[currentPages.length-2];
            lastPage.setData({
              seletedExpandInfos:this.data.expandInfos
            })
        api.Navigate.back();
      },
      onShow:function(){
        // 页面显示
      }
    })
})(__overwrite.require(require, __dirname), __overwrite.Page);