var Service = require('../utils/service.js')

module.exports = {
  Suggestion: Service({
    params: ['keyword', 'cityId'],
    url: 'https://m.elong.com/scenery/search/suggest/',
    cache: false
  }),
  GetHotData: Service({
    params: ['cityId'],
    url: 'https://m.elong.com/scenery/search/gethotdata/',
    cache: false
  }),
  //获取经纬度对应的城市
  getCityInfo: Service({
      url: "https://m.elong.com/hotelwxxcx/gethotelgeocity",
      params: [
        "lat", //经度
        "lng", //纬度
        "sourceType" //源类型
      ],
      cache:false})
}
