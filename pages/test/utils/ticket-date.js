
module.exports = {
    formatDay: function (date, cut) {
        cut = cut ? cut : '/';
        return (date.getFullYear()) + cut + this.formatNumber(date.getMonth()+1) + cut + this.formatNumber(date.getDate());
    },
    formatNumber : function(n) {
        n = n.toString();
        return n[1] ? n : '0' + n;
    },
    dateObj: function (str) {  //把YYYY/MM/DD转换成时间对象
        var date = new Date();
        if(str){
            var cut = str.indexOf("/") >= 0 ? '/' : '-';
            var obj = str.split(cut);
            if(obj.length == 3){
                return new Date(obj[0], obj[1]-1, obj[2])
            }
        }
        return date;
    },
    getInOutData: function(inObj, outObj){
        var now = new Date();
        now = this.formatDay(now);
        now = this.dateObj(now);
        inObj = typeof inObj == "string" ? this.dateObj(inObj) : inObj;
        outObj = typeof outObj == "string" ? this.dateObj(outObj) : outObj;

        if(inObj && outObj && outObj > inObj && inObj >= now && outObj > now){
            var inData = inObj;
            var outData = outObj;
        }else{
            var inData = new Date(now.getFullYear(), (now.getMonth()), now.getDate()+2);
            var outData = new Date(now.getFullYear(), (now.getMonth()), now.getDate()+3);
        }

        return {
            in: this.formatDay(inData),
            out: this.formatDay(outData),
            inShow: this.formatNumber(inData.getMonth()+1) + '月' + this.formatNumber(inData.getDate()) + '日',
            outShow: this.formatNumber(outData.getMonth()+1) + '月' + this.formatNumber(outData.getDate()) + '日',
            day: parseInt(Math.abs(outData  -  inData)  /  1000  /  60  /  60  /24)
        };
    }
};
