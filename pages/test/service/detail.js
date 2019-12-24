var Service = require("../utils/service.js");

module.exports = {
	GetDetail: Service({
		params:["sceneryId", "imageSize"],
		url: "https://m.elong.com/scenery/search/getsearchdetail",
		cache: false
	}),
	GetSceneryDescription:Service({
		params:["sceneryId","tagCode"],
		url: "https://m.elong.com/scenery/query/getscenerydescription",
	})
};