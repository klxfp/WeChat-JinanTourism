var Service = require("../utils/service.js");

module.exports = {
	memberOrderDetail: Service({
		params:["orderId"],
		url: "https://m.elong.com/scenery/order/findorderinfo",
		cache: false,
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
		params:["OrderId","userCardNo"],
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