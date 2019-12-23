var PASSENGERS_KEY = "passengers",
    __dirname = "pages/passengerList/dao",
    api = require("../../utils/api.js")(__dirname);
function insert(passenger, callback){
    var _this = this
    var _callback = callback
    passenger.timeStamp = new Date().getTime();//更新时间戳
    try{
        this.findAll(function(passengers){
            passengers = passengers ? passengers : [];
            passengers.unshift(passenger);
            if (passengers.length > 20) {//最多存20个
                passengers = passengers.slice(0,20);
            }
            var result = _this._saveAll(passengers, _callback);
            return result ? passenger : null;
        });
    }catch(e){
        return null;
    }
}

function deletaPass(passenger){
    try{
        var p = null, _this = this;
        this.findAll(function(passengers){
            var index = passengers.findIndex( item => item.timeStamp === passenger.timeStamp);
            if (index > -1) {
                p = passengers[index];
                passengers.splice(index,1);
                var result = _this._saveAll(passengers);
                return result ? p : null;
            }else{
                return null;
            }
        });
    }catch(e){
        return null;
    }
}

function update(passenger, callback){
    var _this = this
    var _callback = callback
    this.findAll(function(passengers){
        var index = passengers.findIndex( item => item.timeStamp === passenger.timeStamp);
        if (index > -1) {
            passengers.splice(index,1);
            passenger.timeStamp = new Date().getTime();//更新时间戳
            passengers.unshift(passenger);
            _this._saveAll(passengers, _callback);
        }
    });
}

function findAll(callback){
    api.Storage.get({
        key: PASSENGERS_KEY,
        success: function(result) {
            var passengers = result.data || [];
            callback(passengers);
        },
        fail:function(){
            callback([]);
        }
    });
}

function findPassengerById(id){
    var _passengers;
    this.findAll(function(passengers){
        _passengers = passengers.find(item => item.timeStamp === id);
    });
    return _passengers || {}
}

function _saveAll(passengers, callback){
    try{
        api.Storage.set({
            key: PASSENGERS_KEY,
            data: passengers,
            success:callback
        });
        return true;
    }catch(e){
        return false;
    }
}

module.exports = {
    insert: insert,
    deletaPass: deletaPass,
    update: update,
    findAll:findAll,
    _saveAll: _saveAll,
    findPassengerById: findPassengerById,
};
