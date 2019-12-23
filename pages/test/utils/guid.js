module.exports = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    }) + (+new Date()-new Date(2016,9,3)).toString(16);
};