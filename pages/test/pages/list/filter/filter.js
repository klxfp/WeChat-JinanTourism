var __dirname = "pages/main-pages/list/filter";
var api = require("../../../utils/api.js")(__dirname);

var bgAnimation = api.createAnimation({
	duration: 200
});
var containerAnimation = api.createAnimation({
	duration: 200,
	timingFunction: "ease-out"
});

module.exports = {
	data: {
		style: {
			top: 0
		},
		surNone:'',
		isOpen: false,
		data: [],
		column: 3,
		index2: 0,
		index3: 0,
		tempCityData:[{
			filterDesc:"不限",
            filterId:"0",
			isSelected:1
		}],
		selectIndex:0,
		containerAnimation: {}
	},
	select: function(e) {
		var column = e.currentTarget.dataset.column;
		var index = e.currentTarget.dataset.index;
		//点击左边栏目
		if(column == 0 && index == 0){
			this.setData({selectIndex:0,typeData:[{
				typeName:'附近',
				className:'on'
			},{
				typeName:'周边城市',
				className:''
			}]});
		}
		else if(column == 0 && index == 1){
			this.setData({selectIndex:1,typeData:[{
					typeName:'附近',
					className:''
				},{
					typeName:'周边城市',
					className:'on'
			}]});
		}
		//点击附近item
		if(column == 1 && this.data.selectIndex == 0){
			var cbArr = [];
			//其他筛选项置空
			this.clearOtherData(this.data.disData);
			this.data.disData[index].isSelected = 1;
			this.setData({
				disData: this.data.disData
			});
			cbArr.push(this.data.disData[index]);
			this.fireEvent("change",{
				distanceData: cbArr
			});
			this.close();
		}
		//周边城市条目
		else if(column == 1 && this.data.selectIndex == 1){
			var cityArr = [],that = this;
			//不限处理方法
			if(index == 0){
				this.clearOtherData(this.data.cityData);
				cityArr.push({
					filterDesc:"不限",
                    filterId:"0",
					isSelected:1
				});
				this.data.cityData[0].isSelected = 1;
				this.setData({
					cityData: this.data.cityData,
					tempCityData: cityArr
				});
				__wxConfig.debug && console.log('tempCityData',this.data.tempCityData);
			}
			else{
				this.data.cityData[0].isSelected = 0;
				this.data.cityData[index].isSelected = this.data.cityData[index].isSelected == 1 ? 0 : 1;
				this.setData({
					cityData: this.data.cityData
				});
				__wxConfig.debug && console.log('city Data now',this.data.cityData);
				this.data.cityData.map(function(item,i){
					item.isSelected == 1 && cityArr.push(item);
				});
				__wxConfig.debug && console.log('cityArr88',cityArr);
				if(cityArr.length == 0){
					this.clearOtherData(this.data.cityData);
					cityArr = [{filterDesc:"不限",filterId:"0",isSelected:1}];
					this.data.cityData[0].isSelected = 1;
					this.setData({
						cityData: this.data.cityData
					});
				}
				__wxConfig.debug && console.log('cityArr99',cityArr);
				this.setData({
					tempCityData: cityArr
				});
			}
		}
	},
	clearOtherData: function(data){
		data.map(function(item,i){
			item.isSelected = 0;
		});
	},
	confirm: function() {
		this.fireEvent("change", {
			surCityData: this.data.tempCityData
		});
		this.close();
	},
	reset: function() {
		var cityArr = [];
		this.clearOtherData(this.data.cityData);
		cityArr.push({
			filterDesc:"不限",
            filterId:"0",
			isSelected:1
		});
		this.data.cityData[0].isSelected = 1;
		this.setData({
			cityData: this.data.cityData,
			tempCityData: cityArr
		});
	},
	bindData: function(distanceData, surCityData) {
		__wxConfig.debug && console.log('surCityData',surCityData);
		this.setData({
			disData: distanceData,
			cityData:surCityData
		});
		if(surCityData.length == 0 || (surCityData.length == 1 && surCityData[0].filterDesc == "不限")){
			this.setData({
				surNone:'none',
				typeData:[{
					typeName:'附近',
					className:'on'
				},{
					typeName:'',
					className:''
				}]
			});
		}
	},
	open: function() {
		this.setData({
			isOpen: true
		});
		bgAnimation.opacity(1).step();
		containerAnimation.translateY(0).step();
		this.setData({
			bgAnimation: bgAnimation.export(),
			containerAnimation: containerAnimation.export()
		});
	},
	close: function(e) {
		if (e && e.currentTarget.dataset.bgclose) {
			this.fireEvent("change", {
				'bgclose': e.currentTarget.dataset.bgclose
			});
		}
		containerAnimation.translateY(-1000).step();
		this.setData({
			containerAnimation: containerAnimation.export()
		});
		this.setData({
			isOpen: false
		});
	},
	onLoad: function(options, pageoptions) {
		__wxConfig.debug && console.log('filter');
		this.type = options.type;
		this.setData({
			typeData:[{
				typeName:'附近',
				className:'on'
			},{
				typeName:'周边城市',
				className:''
			}],
			style: options.style
		});
	}
};