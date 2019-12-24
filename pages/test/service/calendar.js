var Service = require("../utils/service.js");

module.exports = {
	GetPriceCalendar: Service({
		params:["startDate", "endDate", "ticketIdList"],
		url: "https://m.elong.com/scenery/price/getpricecalendar",
		cache: false
	})
};