/**
 * 定义高清类型
 * @type {Array}
 */
var type = [
    'mobp480_1500',
    'mobp540_1500',
    'mobp720_1500',
    'mobp1080_1500',
    'mobp640_1500',
    'mobp750_1500',
    'mobp1242_1500'
]

module.exports = {
    /**
     * 高清图片适配
     * @type {Object}
     */
    hdPicAdapter: {
        /**
         * 获取高清类型
         * @return {string}
         */
        getHDTypeByDevice: function() {
            var _ratio = typeof devicePixelRatio !== "undefined" ? devicePixelRatio : 1;

            if (_ratio >= 3) {
                return type[6];
            } else if (_ratio == 2) {
                return type[5];
            } else {
                return type[1];
            }
        },
        /**
         * 替换图片的url
         * @param  {string} url
         * @param  {string} size
         * @return {string}
         */
        replaceUrl: function(url, size) {
            var lastPos = url.lastIndexOf('/');
            var afterSize = url.substring(lastPos + 1, lastPos.length);
            var firstPos = url.substring(0, lastPos).lastIndexOf('/');
            var beforeSize = url.substring(0, firstPos + 1);
            return beforeSize + size + '/' + afterSize;
        }
    }
}
