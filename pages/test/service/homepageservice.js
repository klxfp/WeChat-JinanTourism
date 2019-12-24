var Service = require("../utils/service.js");

module.exports = {
    GetHomePageData:Service({
      params:["currentCityId",//定位城市id
				"lat",
				"lng",
				"searchCityId",//城市选择页选择的城市id
				"showNearby"],
      url: "https://m.elong.com/scenery/search/gethomepagedata",
      cache: false,
  })
};
