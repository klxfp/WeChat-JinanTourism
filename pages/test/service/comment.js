var Service = require("../utils/service.js");

module.exports = {
	GetCommentList: Service({
		params:["pageIndex",
      "pageSize",
      "sceneryId",
      "filterItemList"],
		url: "https://m.elong.com/scenery/comment/getcommentlist",
		cache: false
	})
};