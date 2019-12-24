var __dirname = "components/city-selector";
var api = require("../../utils/api.js")(__dirname);

module.exports = function(params, callback){
	var event = api.Navigate.go({
		url: "./page/city",
		params: params
	});

	event.on("select", callback);
};