var __dirname = "pages/commentlist";
var __overwrite = require("../../utils/overwrite.js");
(function(require, Page) {
   var api = require("../../utils/api.js")(__dirname),
    Util = require('utils/util'),
    CommentService = require("service/comment"),
    mRefreshData = false;
  Page({
    data: {
      pageIndex:1,
      pageSize:20,
      itemFilterQuery: false,
      showNoMore: false,
      commentList: [],
      commentCount:0,
      filterItemList:[],
      satisfaction:0,
      score:0,
      scorenum:0,
      recommand:"",
      startNumbers:[1,2,3,4,5],
      sceneryid:0,
      scrollViewHeight:0,
      selectedFilterCommentCount:-1,
    },
    onLoad: function (options) {
      //处理别的页面传递过来的数据
      mRefreshData = false
      this.setData({
        scrollViewHeight:getApp().getAppSystemInfo().windowHeight
      });
      api.NavigationBar.setTitle({title:options.sceneryTitle});
      if(options.sceneryid){
        this.data.sceneryid = options.sceneryid;
        this.loadComments();
      }
    },
    onPullDownRefresh: function(){
      mRefreshData = true
      this.loadComments();
    },
    stopRefresh:function(){
      if(mRefreshData) {
        mRefreshData = false
        wx.stopPullDownRefresh()
      }
    },
    loadComments:function(){
      var that = this;
      CommentService.GetCommentList(this.data.pageIndex,20,this.data.sceneryid,this.data.filterItemList).then(function(data){
            that.setData({
              commentList: that.formateCommentList(data.commentList),
              commentCount:data.commentCount,
              filterItemList:data.filterItemList,
              satisfaction:data.satisfaction,
              score:data.score,
              commentStarValue:that.getStarValue(data.score),
              scorenum:Number(data.score),
              recommand:Number(data.score) >= 1 ? (Number(data.score) <=2 ? "吐糟" : "推荐"):"",
            });
            that.stopRefresh()
          });
    },
    onShow:function(){
      // 页面显示
    },
    loadMore:function(){
      var _api = api
      if (this.data.selectedFilterCommentCount <=0) {
        this.data.selectedFilterCommentCount = this.data.commentCount;
      }
      if(this.data.selectedFilterCommentCount > this.data.commentList.length){
        this.data.pageIndex ++;
        try{
          var that = this;
          CommentService.GetCommentList(this.data.pageIndex,20,this.data.sceneryid,this.data.filterItemList).then(function(data){    
                that.setData({
                  commentList: that.data.commentList.concat(that.formateCommentList(data.commentList)),
                  commentCount:data.commentCount,
                  showNoMore: data.commentList.length === 20
                });
              });
        }
        catch(e){
          _api.showToast({
            title:'加载数据失败，网络错误'
          })
          return false;
        }
      }else{
        //没有更多评论了
        _api.showToast({
          title:'没有更多评论啦...'
        })
      }
    },
    getStarValue:function(value){
        var fix = value%0.5;
        var value = !fix?value:Math.round(value);
        var intValue = parseInt(value);
        var fixValue = value - intValue;
        var result = {value:value,intValue:intValue,fixValue:fixValue};
        return result;
      },
      selectFilter:function(options){
        let selectedIndex =options.currentTarget.dataset.filter;
        this.data.filterItemList.map(function(item, index){
          item.isSelected = selectedIndex == index?1:0;
          return item
        });
        this.data.pageIndex = 1;
        this.data.selectedFilterCommentCount = Number(this.data.filterItemList[selectedIndex].extraDesc);
        this.loadComments();
      },
      /*
      * 映射图片url
      */
      dealCommentItemData:function(item){
        var _this = this
        var num = item && Number(item.score);
        item.score = num && num.toFixed(1);
        item.originImageUrlList = item.imageUrlList && item.imageUrlList.map(function(url){
          url = Util.formateImgUrl(url)
          return url
        });
        item.imageUrlList = item.imageUrlList && item.imageUrlList.slice(0,4);
        item.imageUrlList = item.imageUrlList && item.imageUrlList.map(function(url){
          url = Util.formateImgUrl(url)
          return url
        })
        item.commentTime = this.formatDate(item.commentTime);
        item.userName = item.userName && this.encodeUserName(item.userName);
        return item;
      },
      formatDate:function(oriTimestamp){
        var nowTimestamp=new Date().getTime();
        var deltaTimestamp = nowTimestamp - oriTimestamp;
        if(deltaTimestamp< 60){
          return "刚刚";
        }else if(deltaTimestamp < 3600){
          var minute = deltaTimestamp/60;
          return Math.ceil(minute)+"分钟前";
        }else if(deltaTimestamp<86400){
          var hours = deltaTimestamp/3600;
          return Math.ceil(hours)+"小时前";
        }else if(deltaTimestamp<86400 * 2){
          return "昨天";
        }else{
          var oriDate = new Date(oriTimestamp);
          var   year=oriDate.getFullYear();
          var   month=oriDate.getMonth()+1;
          var   date=oriDate.getDate();
          return  year+"/"+month+"/"+date;
        }
      },
      encodeUserName:function(userName){
        if(userName.length>6){//123 4 567
          var prefix = userName.slice(0,3);
          var suffix = userName.slice(userName.length - 3);
          var middle = userName.slice(3,userName.length - 3);
          var userName = prefix;
          for(var i = 0;i<middle.length;i++){
            userName = userName + '*';
          }
          return userName + suffix;
        }
        return userName;
      },
      formateCommentList:function(commentList){
        //评论最多展示两条
        var _this = this
        if(commentList && commentList.length>0) {
          var tempcommentList = commentList;
          tempcommentList.map(function(commentItem){
            return _this.dealCommentItemData(commentItem);
          })
          return tempcommentList;
        }
        return [];
      },
      onCommentItemImgClick:function(options){
          api.Image.preview({
            current:options.currentTarget.dataset.url,
            urls:options.currentTarget.dataset.imageurllist||[]
          })
      }
  });
})(__overwrite.require(require, __dirname), __overwrite.Page);