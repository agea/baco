function getType(){

	var canvas = document.createElement('canvas');

	if (canvas.getContext){
		if (canvas.getContext('webgl')){
			return Two.Types.webgl;
		}
		if (canvas.getContext('2d')){
			return Two.Types.canvas;
		}

	}

	if (document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.0")){
		return Two.Types.svg;
	}
}

alert(getType());


var log = function(){};
if (console){
	log = console.log;
}

var two = new Two({
	fullscreen:true,
	autostart:true,
	type: getType()
}).appendTo(document.body);



var k = Math.min(two.height, two.width)/10;
var c = [two.width/2, two.height/2];

var head = two.makeCircle(c[0], c[1], k/1.8);
head.fill = '#ff9000';
head.linewidth = 1;
//head.noStroke();
head.stroke = '#cc7000'

var body = [];
body.push(head);

var history = [];

var moves = [[1,0]];

var g0 = [c[0]-parseInt(c[0]/k)*k, c[1]-parseInt(c[1]/k)*k];

var gx = g0[0], gy = g0[1];

var vx = [gx-k], vy = [gy-k];

var free = [];


while (gy <= two.height+k) {
	gx = g0[0];
	while(gx <= two.width+k){
		if (!_(vx).contains(gx)){
			vx.push(gx);
		}
		free.push([gx,gy]);
		gx+=k;
	}
	vy.push(gy);
	gy+=k;
}

var curd = [1,0];

function grow(){
	var bp = two.makeCircle(c[0], c[1], k/2.2);
	bp.fill = '#ff9000';
	bp.linewidth = 1;
	//head.noStroke();
	bp.stroke = '#cc7000'
	body.push(bp);	
}


window.addEventListener('touchstart', function(event){
	var x = event.changedTouches[0].pageX;
	var y = event.changedTouches[0].pageY;
	var e = {keyCode:39};

	if (curd[0]==0){
		if(x>c[0]){
			onKeyDown({keyCode:39});
		} else {
			onKeyDown({keyCode:37});
		}
	} else {
		if(y>c[1]){
			onKeyDown({keyCode:40});
		} else {
			onKeyDown({keyCode:38});  		
		}
	}

	onKeyDown(e);

}, false);




function onKeyDown(event){
	var keyCode = event.keyCode;
	switch(keyCode){
    case 68:  //d
    case 39:
    if (curd[0]==0) {
    	moves.push([1,0]);    		
    }
    break;
    case 83:  //s
    case 40:
    if (curd[1]==0){
    	moves.push([0,1]);
    }
    break;
    case 65:  //a
    case 37:
    if (curd[0]==0){
    	moves.push([-1,0]);
    }
    break;
    case 87:  //w
    case 38:
    if (curd[1]==0){
    	moves.push([0,-1]);
    }
    break;
}
}
window.addEventListener("keydown", onKeyDown, false);


rx = c[0];
ry = c[1];

history.push([rx,ry]);

var speed = 5;

function nearestPoints(){
	var nx;
	var ny;
	for (var i=1;i<vx.length;i++){
		if (vx[i-1]<=rx && vx[i]>=rx ){
			nx = {'-1':vx[i-1], '1': vx[i]}
			break;
		}
	}

	for (var i=1;i<vy.length;i++){
		if (vy[i-1]<=ry && vy[i]>=ry){
			ny= {'-1':vy[i-1],'1':vy[i]};
			break;
		}
	}
	return [nx,ny];
}



function move(dx,dy){
	rx=(two.width+rx+dx) % two.width;
	ry=(two.height+ry+dy) % two.height;
	r = body[body.length-1].getBoundingClientRect();
	history.push([rx,ry]);		
}

function nextXY(dist){
	//same direction or on the grid

	var d = curd;

	if (moves.length){
		d = moves[0];
	}

	if (d.indexOf(0)==curd.indexOf(0)){
		move(dist*d[0],dist*d[1]);
		moves.shift();
	} else {

		var np = nearestPoints();
		if (curd[0]==0){
			var ydist = Math.min(Math.abs(dist),Math.abs(np[1][''+curd[1]] - ry));
			var xdist = dist-ydist;
			move(xdist*d[0],ydist*curd[1]);
			if (xdist!=0){
				curd = moves.shift();
			}
		} else {
			var xdist = Math.min(Math.abs(dist),Math.abs(np[0][''+curd[0]] - rx));
			var ydist = dist-xdist;
			move(xdist*curd[0],ydist*d[1]);
			if (ydist!=0){
				curd = moves.shift();
			}
		}
	}
}

two.bind('update', function(frameCount, timeDelta) {
	var dist = Math.min((timeDelta||0) * speed/10,k);
	nextXY(dist);
	var l = body.length;
	var h = history.length-1;
	for (var i = 0; i<l;i++){
		var pos = history[h-i];
		body[i].translation.set(pos[0], pos[1]);
	}
});

two.update();

setInterval(grow,2000);

