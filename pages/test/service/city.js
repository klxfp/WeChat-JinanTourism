var Service = require("../utils/service.js");

module.exports = {
	GetCityData: Service({
		url: "https://m.elong.com/scenery/search/getcitydata/",
		cache: false
	}),
	CitySuggest: Service({
		params: ["keyword"],
		url: "https://m.elong.com/scenery/search/citysuggest",
		cache: false
	})
};