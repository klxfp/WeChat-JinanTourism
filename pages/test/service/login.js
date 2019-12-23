var Service = require( "../utils/service.js" );

module.exports = {
	login: Service( {
		params: [ "code", "encryptData","appId"],
        method: "POST",
		dataType: 'form-data',
		url: "https://m.elong.com/authorize/wxapp/login/",
		defaultTip: false,
		noLoading: true,
		cache: false
	}),
	checkSessionToken: Service( {
		params: [ "sessionToken" ],
        method: 'POST',
		dataType: 'form-data',
		url: "https://m.elong.com/authorize/wxapp/checkSessionToken/",
		defaultTip: false,
		noLoading: true,
		cache: false
	})
};