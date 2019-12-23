var Service = require("../utils/service.js");
module.exports = {
    GetTime: Service({
        url: 'https://m.elong.com/hotelwxxcx/getserverdate/',
        method: 'GET',
        noLoading:true,
        dataTransform: function(data) {
        	return data.timestamp;
        }
    })
};
