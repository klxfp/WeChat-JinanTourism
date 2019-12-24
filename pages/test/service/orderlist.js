var Service = require("../utils/service.js");

module.exports = {
	orderList: Service({
		params:["cardNo","state","page"],
		url: "https://m.elong.com/scenery/order/findmemberorderlist",
		cache: false
	}),
    // 删除订单
	delOrderById:Service({
		params:["orderId"],
		url: "https://m.elong.com/scenery/order/delorderbyid",
		method:"Post",
		cache: false
	}),
   
	// 获取token
	getToken:Service({
		params:["GorderId"],
		url: "https://m.elong.com/scenery/pay/payurl",
		method:"GET",
		cache: false
	}),
	// 会员取消订单
	memberCancelOrder:Service({
		params:["OrderId"],
		url: "https://m.elong.com/scenery/order/cancelorder",
		method:"Post",
		cache: false
	}),
	// 重发短信凭证
	sendMessage:Service({
		params:["orderId"],
		url: "https://m.elong.com/scenery/order/sendmessage",
		method:"Post",
		cache: false
	})
    
};