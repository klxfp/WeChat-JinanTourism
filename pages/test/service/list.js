var Service = require("../utils/service.js");

module.exports = {
	SceneryList: Service({
		url: "https://m.elong.com/scenery/search/getsearchlist",
		cache: false,
	})
};