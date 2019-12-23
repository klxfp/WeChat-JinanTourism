var __dirname = "pages/list/sort";
var api = require("../../../utils/api.js")(__dirname);

var bgAnimation = api.createAnimation({
    duration: 200
});
var contentAnimation = api.createAnimation({
    duration: 200
});
module.exports = {
    data: {
        items: [],
        selectedId: "",
        bgAnimation: {},
        contentAnimation: {},
        isOpen: false
    },
    onLoad: function(props){
        this.setData({
            style: props.style
        });
    },
    setSource: function(source, selectedIndex){
        this.setData({
            items: source || [],
            selectedId: source && source.length ? source[selectedIndex || 0].filterId : ""
        });
    },
    select: function(e){
        this.setData({
            selectedId: e.currentTarget.dataset.id
        });
        this.fireEvent("change", {
            filterId: e.currentTarget.dataset.id,
            filterDesc: e.currentTarget.dataset.name
        });
        this.close();
    },
    open: function(){
        this.setData({
            isOpen: true
        });

        bgAnimation.opacity(1).step();
        contentAnimation.translateY(0).step();
        this.setData({
            bgAnimation: bgAnimation.export(),
            contentAnimation: contentAnimation.export()
        });
    },
    close: function(e){
        if (e && e.currentTarget.dataset.bgclose) {
            this.fireEvent("change", {
                'bgclose': e.currentTarget.dataset.bgclose
            });
        }
        contentAnimation.translateY(-this.data.items.length * 46 + 1).step();
        this.setData({
            contentAnimation: contentAnimation.export()
        });
        this.setData({
            isOpen: false
        });
    }
};