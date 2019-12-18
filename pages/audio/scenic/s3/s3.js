
//引入本地json数据，这里引入的就是第一步定义的json数据
var jsonData = require('../json.js');
Page({
  data: {
  },
  //我们在这里加载本地json数据
  onLoad: function () {
    this.setData({
      //jsonData.dataList获取json.js里定义的json数据，并赋值给dataList
      dataList: jsonData.dataList
    });
  },
})