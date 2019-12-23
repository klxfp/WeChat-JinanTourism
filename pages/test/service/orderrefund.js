var Service = require("../utils/service.js");
module.exports = {
    // 订单可退性检查
    orderRefundValidate:Service({
		url: "https://m.elong.com/scenery/order/refundvalidate",
		params:["orderId"],
		method: "GET",
		// dataTransform: function(data){
		// 	if(data && !data.IsError){
		// 		return data;
		// 	}else{
		// 		if(data && data.IsError && data.ErrorMessage){
		// 			throw data.ErrorMessage;
		// 		}
		// 		throw "网络异常";
		// 	}
		// }
	}),
    // 申请退款接口
	unsubscribeOrder: Service({
		url: "https://m.elong.com/scenery/order/unsubscribeorder",
		method: "GET",
		dataTransform: function(data){
			if(data && !data.IsError){
				return data;
			}
			else{
				if(data && data.IsError && data.ErrorMessage){
					throw data.ErrorMessage;
				}
				throw "申请退款失败";
			}
		}
	})
};