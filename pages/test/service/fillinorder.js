var Service = require("../utils/service.js");

module.exports = {
    GetDynamicFormTemplate:Service({
		url: "https://m.elong.com/scenery/query/getdynamicformtemplate",
		params:["ticketIdList"],
		method: "GET",
		dataTransform: function(data){
			if(data && !data.IsError){
				return {
					data: {
						contactTemplate:data.contactTemplate,
						resourceFillInInfos:data.resourceFillInInfos,
					}
				};
			}else{
				throw data && data.ErrorMessage;
			}
		}
	}),
	CreateOrder: Service({
		url: "https://m.elong.com/scenery/order/createorder",
		method: "Post",
	}),
	GetWxPayUrl:Service({
		params:["orderId", "gorderId"],
		url: "https://m.elong.com/scenery/pay/wxpayment",
		method: "GET",
		cache:false,
	}),
};