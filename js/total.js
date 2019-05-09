var map = new AMap.Map('container',{
    center:[116.39, 39.9]
})
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
        console.log('过渡结束');
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

/*绑定屏幕点击事件，使屏幕点击生成marker*/
function bindingMarker(val){
    if(val.checked){/*绑定*/

    }else{/*解除绑定*/

    }
}
