# TOKEN
用于小程序联合登录用
```javascript
var token=require('./utils/token.js');
//首页检测登录是否失效，并尝试自动登录
token.checkSessionToken(function(isok){
  !isok&&token.autoLogin()
});

//获取sessionToken
token.getSessionToken(function(sessionToken){
    //null or sessionToken
});

//获取openId
token.getOpenId(function(openId){
    //null or openId
});

//登录（失败将重试3次）
token.login(function(response){
    //null or {openId:xxx,sessionToken:xxx}
});

//退出登录
token.logout();
```

# PAGE
目前由于微信小程序的一些缺陷，比如无法返回传值等，请参考
```javascript
var __dirname = "components/calendar/page";
var __overwrite = require("../../../utils/overwrite.js");
(function(require, Page){
    var api = require("utils/api")(__dirname);
    Page({
        // 获取全局数据
        getGlobalData: function(key){},
        // 设置全局数据
        setGlobalData: function(key, value){},
        // 监听全局数据变化
        listenerGlobalData: function(keys, listener){},
        // 触发页面事件
        fireEvent: function(eventName, params){},
        //........
    })
})(__overwrite.require(require, __dirname), __overwrite.Page);
```

# API
参考微信小程序API，如api.request等同于wx.request
# 打点方法调用样例
```javascript
var __dadian = require("../../../utils/dadian.js");
var app = getApp();
Page({
  data: {
    //对应原H5版本中页面的pageInfo JSON数据
    pageInfo: [{"biz":"h5_hotel", ... ,"subPath":"/hotel/"}],
    //对应原H5版本中页面的TJObject JSON数据
    TJObject: {"bns":2,"ch":"h5hotelgeneral", ... ,"v":"1.0"}
  },
  onShow: function () {
    __dadian.DADIAN(this.data.pageInfo,this.data.TJObject);
  }
})
```

# 组件
日历
城市
位置
其它



# Service
参考service目录下
```javascript
Service({
    params: ["searchkey"],//参数[可选]
    url: "https://m.elong.com/hotelwxxcx/gethotelsugcitys",//请求的地址(必填)
    headers: {},//请求头[可选]
    method: "GET",//请求方式[可选]
    cache: true,//请求是否缓存[可选]
    dataTransform: function(data) { //数据转换[可选]
        return data;
    },
    mockData: function() {          //假数据[可选]
        return [{
            "cityId": "0101",
            "cityName": "北京",
            "cityNameSEO": "beijing",
            "jianPin": "bj",
            "pinYin": "beijing"
        }, {
            "cityId": "0201",
            "cityName": "上海",
            "cityNameSEO": "shanghai",
            "jianPin": "sh",
            "pinYin": "shanghai"
        }];
    })
})
```

# 提现页面(payment) Service数据接口
参考目录如下
```javascript
module.exports = {
    //银行提现页面
    payment: Service({
        url: "",
        cache: true,
        mockData: function(){
            return {
                canCashBalances:'188.90',
                banks: [
                    {
                        BankId: 10010,
                        BankName:"招商银行",
                    },
                    {
                        BankId: 10110,
                        BankName:"上海银行",
                    },
                    {
                        BankId: 12310,
                        BankName:"北京银行",
                    }
                ],
                phoneNo:'13552130504',
                withdrawFee: '39.91',
                actualMoney:"116.33",
                withdrawFeeRule: '278.78',
                idCardTypes: 0,//证件类型 0-身份证，1-护照，2-其他
                userLevel: 'V3',//用户等级，新版。V1=普通会员，V2=VIP会员，V3=龙翠会员，V4=永久龙翠会员
                compensate: true,//是否含有赔付金额，若含有赔付金额，提现不收取手续费
                withdrawToAmount: 22.87//收取手续费的上限阀值，提现金额高于该值不收取手续费
            }
        }
    }),
    //提现短信验证页
    smsverify: Service({
        url: "",
        cache: true,
        mockData: function(){
            return {
                money:'212.98',
                banks: [
                    {
                        BankId: 10010,
                        BankName:"招商银行",
                    },
                    {
                        BankId: 10110,
                        BankName:"上海银行",
                    },
                    {
                        BankId: 12310,
                        BankName:"北京银行",
                    }
                ],
                phone:'13552130504',
                withdrawFee: '39.91',
                actualMoney:"116.33",
                withdrawFeeRule: '278.78',
                userLevel: 'V3',//用户等级，新版。V1=普通会员，V2=VIP会员，V3=龙翠会员，V4=永久龙翠会员
                compensate: true,//是否含有赔付金额，若含有赔付金额，提现不收取手续费
                withdrawToAmount: 22.87//收取手续费的上限阀值，提现金额高于该值不收取手续费
                bankCardno: '6124 2662 7277 2772',
                bankname: '北京银行',
                holderName: '张飞',
                province: '河北',
                city: '石家庄',
                vcodeUrl: 'TTWG',
                idcardno: '342221199004083065',
                idcardtype: '0',//证件类型 0-身份证，1-护照，2-其他
                email: '28119292@qq.com',
            }
        }
    }),
    //提现成功页面
    paysuccess: Service({
        url: "",
        cache: true,
        mockData: function(){
            return {
                withdrawFee: '39.91',
                actualMoney:"116.33",
                bankCardno: '6124 2662 7277 2772',
                bankName: '北京银行',
            }
        }
    })
};
```

# 滚动刷新
实现数据列表滚动刷新，很简单，使用微信提供的 [scroll-view组件  ](https://mp.weixin.qq.com "微信小程序开发文档" )，这里需要注意

* `scroll-view` 组件必须设置**固定高度**，才能触发事件，如果确定容器高度可通过wxss内设置，若不确定，可以通过**wx.getSystemInfo** 获取窗口高度减去除容器外的高度，然后动态渲染 style="heigth:{{height}}"。
* 当 `bindscrolltolower` 事件触发时，处理业务模块自身加载数据的逻辑（追加数据）

#### wxml 引入 `scroll-view` 组件
```
<scroll-view scroll-y="true" bindscrolltolower="loadMore" lower-threshold="50" class="scroll-view">
    <!-- 数据项 -->
    <view wx:for="{{dataList}}">
        <view class="item-calss">
            {{item.name}}
        </view>
    </view>
</scroll-view>
```
#### js 文件中 注册 `bindscrolltolower` 事件所对应的处理函数 `loadMore`
```
 Page({
        data: {
            dataList: [],//数据列表
            totalCount: 0//总数
        },
        pageIndex: 0,
        onLoad: function(data) {
            this.loadData();
        },
        reLoad: function() {
            this.pageIndex = 0;
            this.data.dataList = [];
            this.loadData();
        },
        onPullDownRefresh: function() {//下拉刷新
            this.reLoad();
        },
        loadMore: function(e) {
            if (this.data.dataList.length < this.data.totalCount) {
                this.pageIndex += 1;
                this.loadData();
            }
        },
        loadData: function() {
            return service.GetlData(this.pageIndex).then(function(data) {
                this.data.dataList = this.data.dataList.concat(data.orderList);
                this.render();
            }.bind(this));
        },
        render: function(data) {
            this.setData(data || this.data);
        }
    });
```

# 下拉刷新:
* 1、在 `*.json` 配置文件中声明 `"enablePullDownRefresh":true`

```
{
    "navigationBarTitleText": "国内酒店订单",
    "enablePullDownRefresh":true
}
```

* 2、在`*.js ` 注册 `onPullDownRefresh` 事件 。（建议数据加载完毕后，执行 `stopPullDownRefresh` 方法）

```
Page({
    data: {
        dataList: []
    },
    pageIndex: 0,
    onPullDownRefresh: function() {
        this.reLoad('byPull');
    },
    reLoad: function(type) {
        this.pageIndex = 0;
        this.data.dataList = [];
        if (type === 'byPull') { //数据更新后，停止下拉刷新
            this.loadData().then(this.stopPullDownRefresh);
        } else {
            this.loadData();
        }
    },
    stopPullDownRefresh: function() {
        api.stopPullDownRefresh();
    },
    loadData: function() {
        return service.GetlData(this.pageIndex).then(function(data) {
            //success
        }, function(data) {
            //error
        });
    }
});

```

# loading 组件
项目统一封装了 loading 效果，在所有request请求时显示，请求结束后隐藏，所以请各个模块去掉各自的loading处理逻辑。

* 1、需要使用 loading 效果的页面，需要在 wxml 中引入`base.wxml`  

```
<!--业务-->
<view wx-if="{{dataList}}"
    {{item}}
</view>
<!--业务-->

<include src="../../../components/base.wxml" />
```

* 2、如果页面中某些接口不需要laoding效果，可以在请求参数中配置 noLoading 为 true

```
{
    url: 'https://m.elong.com/hotelwxxcx/wxxcxorderdetail/',
    params: ['orderno'],
    method: 'GET',
    noLoading: true
}
```

* 3、js 中可以调用 this.setLoading 方法，控制 loading 组件显示隐藏。

```
Page({
    data: {
    },
    onLoad: function(data) {
        //this.setLoading(true);
        //this.setLoading(false);
    }
});
```

# 拨打电话
api.makePhoneCall

1. 调用方式 0 : 通过组件的dataset配置需拨打的电话号码, 此时绑定事件的目标组件必须包含"data-phone-number"属性, 且内容为待拨打的电话号码, 否则将会抛出一个错误提示。

	```
	<view bindtap="makeCall" data-phone-number="0551-65299391">拨打电话</view>

	Page({
	  makeCall: function (e) {
	    api.makePhoneCall(e)
	  }
	})
	```

2. 调用方式 1 : 直接将待拨打的电话号码作为参数。

	```
	Page({
	  makeCall: function () {
	    api.makePhoneCall('010-66666666')
	  },
	  onReady: function () {
	    this.makeCall()
	  }
	})
	```

# CHANGELOG
2016-01-09 v1.2.5
1. 修改了一些页面内直接给 data 赋值的代码，改为 setData 的方式，排除隐患；
2. 首页、列表页、详情页 增加分享功能，目前只分享当前页面 path + 统计用的of值；
3. 修正了首页频繁定位导致报错的问题；
4. 修正了客服标签的文案错误；
