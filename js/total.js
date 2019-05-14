var map = new AMap.Map('container',{
    center:[116.39, 39.9],
    zoom:14
})

/*添加/去除缩放组件*/
var toolbar;
/*测距插件*/
var rule;
/*驾车规划插件*/
var driving;
/*自动补全插件*/
var completestart;
var completeEnd;
/*起点坐标*/
var POIstrat = [];
var POIenf = [];
AMap.plugin(['AMap.ToolBar','AMap.MouseTool','AMap.Driving','AMap.Autocomplete'],function(){//异步加载插件
    toolbar = new AMap.ToolBar({
        offset:new AMap.Pixel(10,30)
    });

    rule = new AMap.MouseTool(map);

    completestart= new AMap.Autocomplete({
        city: '全国',
        input: 'tipinputstart'
    });
    completestart.on('select',function(AutocompleteResult){
        POIstrat[0] = AutocompleteResult.poi.location.lng;
        POIstrat[1] = AutocompleteResult.poi.location.lat;
    })
    completeEnd= new AMap.Autocomplete({
        city: '全国',
        input: 'tipinputEnd'
    });
    completeEnd.on('select',function(AutocompleteResult){
        POIenf[0] = AutocompleteResult.poi.location.lng;
        POIenf[1] = AutocompleteResult.poi.location.lat;
    })



})


function bindingToolBar(val){
    if(val.checked){/*添加*/
        map.addControl(toolbar);
    }else{/*移除*/
        map.removeControl(toolbar)
    }
}
var show = true;
function showMenu(){
    if(show == true){
        document.getElementsByClassName('table')[0].style.height = 0+'px'
        show=false;
    }else {
        document.getElementsByClassName('table')[0].style = ''
        show=true;
    }

}
window.onload = function(){
    document.getElementsByClassName('table')[0].addEventListener('webkitTransitionEnd',function () {
        if(show == true){
            document.getElementsByClassName('btn')[0].innerHTML = '收起'
        }else{
            document.getElementsByClassName('btn')[0].innerHTML = '下拉'
        }

    })
}

/*路况图层*/
var trafficLayer ;
function roadCondition(val) {
    if(val.checked){/*添加*/
        if(!trafficLayer){
            trafficLayer = new AMap.TileLayer.Traffic({
                zIndex: 10
            });
        }
        map.add(trafficLayer);
    }else{/*移除*/
        map.remove(trafficLayer);
    }

}

/*卫星图层*/
var SatelliteLayer;
function satelliteCondition(val){
    if(val.checked){
        if(!SatelliteLayer){
            SatelliteLayer = new AMap.TileLayer.Satellite()
        }
        map.add(SatelliteLayer);
    }else{
        map.remove(SatelliteLayer);
    }
}
var markerArr = [];
/*绑定屏幕点击事件，使屏幕点击生成marker*/
var markerClick = function(e){
    var marker = new AMap.Marker({
        position:e.lnglat,
        map:map
    })
    markerArr.push(marker);
}
function bindingMarker(val){
    if(val.checked){/*绑定*/
         map.on('click',markerClick)
    }else{/*解除绑定*/
        map.off('click',markerClick)
    }
}
/*清除所有marker*/
function clearAllMarker(){
    map.remove(markerArr)
}

/*操作圆形*/
var polylineEditor;
var circleArr = [];
var contextMenu = new AMap.ContextMenu();
var _this;
var pointArr = [];
contextMenu.addItem("删除", function () {
    map.remove(_this)
    map.remove(pointArr)
    if(polylineEditor){
        polylineEditor.close()
    }
}, 0);
contextMenu.addItem("编辑", function () {
    if(polylineEditor){
        polylineEditor.close()
    }
    addplugin(_this)
}, 1);
/*添加编辑插件*/
function addplugin(_this){
    map.plugin('AMap.CircleEditor',function(){
        polylineEditor = new AMap.CircleEditor(map, _this);
        polylineEditor.open();
    })
}
var drawCircle = function(e){
    var circle = new AMap.Circle({
        center: e.lnglat,  // 圆心位置
        radius: 1000, //半径
        borderWeight: 3,
        strokeColor: "#FF33FF",
        strokeOpacity: 1,
        strokeWeight: 6,
        strokeOpacity: 0.2,
        fillOpacity: 0.4,
        strokeStyle: 'dashed',
        strokeDasharray: [10, 10],
        // 线样式还支持 'dashed'
        fillColor: '#1791fc',
        zIndex: 50,
        map:map
    });
    /*点击矢量图，可以删除和编辑矢量图*/
    circle.on('click',function(e){
        _this = this;
        contextMenu.open(map, e.lnglat);
    })
    circleArr.push(circle);
    showPoints(e.lnglat)
}
/*画圆触发该事件，遍历传来的坐标，在圆范围内的显现标记*/
/*参数圆心的经纬度，圆半径和需要遍历比较的点*/
function showPoints(lnglat,radius){
    for(var i = 0;i<data.length;i++){
        if(AMap.GeometryUtil.distance(lnglat,data[i].lnglat)<=1000){
            var icon;
            if(data[i].type==1){
                icon = '../img/hospital.png'
            }
            if(data[i].type==2){
                icon = '../img/school.png'
            }
            if(data[i].type==3){
                icon = '../img/factory.png'
            }
            var startIcon = new AMap.Icon({
                // 图标尺寸
                size: new AMap.Size(25, 34),
                // 图标的取图地址
                image: icon,
                // 图标所用图片大小
                imageSize: new AMap.Size(25, 34),
                // 图标取图偏移量
                // imageOffset: new AMap.Pixel(-9, -3)
            });
            var point = new AMap.Marker({
                position:data[i].lnglat,
                map:map,
                icon:startIcon,
            })
            pointArr.push(point)
        }
    }
}
/*操作线段*/
function changeVector(val){
    if(val.value==1){/*监听map画圆*/
        map.on('click',drawCircle)
        rule.close(false)
    }else{/*监听map画线*/
        map.off('click',drawCircle)
        rule.rule()
    }
}

/*驾车路线规划*/
function getRoad(){
    var select = document.getElementById('select').value;
    if(!select){
        select = 1
    }
    var policy;
    if(select==1){
        policy = AMap.DrivingPolicy.LEAST_TIME
    }
    if(select==2){
        policy = AMap.DrivingPolicy.LEAST_FEE
    }
    if(select==3){
        policy = AMap.DrivingPolicy.LEAST_DISTANCE
    }
    if(select==4){
        policy = AMap.DrivingPolicy.REAL_TRAFFIC
    }
    if(driving){
        driving.clear();
    }
    driving = new AMap.Driving({
        map:map,
        panel: "panel",
        // 驾车路线规划策略，AMap.DrivingPolicy.LEAST_TIME是最快捷模式
        policy: AMap.DrivingPolicy.LEAST_TIME
    })
    var startLngLat = POIstrat
    var endLngLat = POIenf
    driving.search(startLngLat, endLngLat, function (status, result) {
        // 未出错时，result即是对应的路线规划方案
        /*console.log('status',status);
        console.log('result',result);*/
    })
    driving.on('complete',function (e) {
        document.getElementById('panel').style.display = 'block'
    })
}
function clearRoad(){
    if(driving){
        driving.clear();
    }
    document.getElementById('tipinputstart').value = '';
    document.getElementById('tipinputEnd').value = '';
    document.getElementById('panel').style.display = 'none'
}

/*left中tab切换*/
function changeTab(val) {
    var child = document.getElementsByClassName('right')[0].childNodes;
    var b = child;
    for (var i = 0; i < b.length; i++) {
        if (b[i].nodeName == "#text" && !/\s/.test(b.nodeValue)) {
            document.getElementsByClassName('right')[0].removeChild(b[i]);
        }
    }
    for(let i = 0;i<b.length;i++){
        if(i==val){
            b[i].style.display = 'block'
        }else{
            b[i].style.display = 'none'
        }
    }
    /*管理对map点击事件的监听*/
    if(val==0){
        map.off('click',drawCircle)
        rule.close(false)
    }
    if(val==1){
        map.off('click',markerClick)
        map.on('click',drawCircle)
    }
    if(val==2){/*取消监听，并取消所有覆盖层*/
        map.off('click',markerClick)
        map.off('click',drawCircle)
        rule.close(false)
    }
}
