var __dirname = "components/place-search";
var api = require("../../utils/api.js")(__dirname);

module.exports = function(params, callback){
	var event = api.Navigate.go({
		url: "./page/search",
		params: params
	});

	event.on("search", callback);
};