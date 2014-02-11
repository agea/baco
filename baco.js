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

var two = new Two({
	fullscreen:true,
	autostart:true,
	type: getType()
}).appendTo(document.body);

var s = 10;

var k = Math.floor(Math.min(two.height, two.width)/s);
var c = [Math.floor(two.width/2), Math.floor(two.height/2)];

var bounds = two.makeRectangle(c[0],c[1],k*(s+1),k*(s+1));
bounds.fill='#000000';
bounds.stroke='#111111';

var headC = two.makeCircle(0, 0, k/1.9);
headC.fill = '#ffff00';
headC.linewidth = 1;
headC.stroke = 'rgba(0,0,0,0.5)';

var eye1 = two.makeCircle(k/4,k/4, k/8);
eye1.fill='#000000';

var eye2 = two.makeCircle(k/4,-k/4, k/8);
eye2.fill='#000000';

var head =  two.makeGroup(headC, eye1, eye2);
head.translation.set(c[0],c[1]);

var g0 = [Math.floor(c[0]-(s/2)*k), Math.floor(c[1]-(s/2)*k)];

var gx = g0[0], gy = g0[1];

var vx = [], vy = [];

var growFactor = 0;

while (gy <= c[1]+(s/2)*k) {
	vy.push(gy);
	gy+=k;
}
while(gx <= c[0]+(s/2)*k){
	vx.push(gx);
	gx+=k;
}

function touch (event) {
	var x = event.changedTouches[0].pageX;
	var y = event.changedTouches[0].pageY;

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

};

window.addEventListener('touchstart', touch, false);

function onKeyDown (event) {
	var keyCode = event.keyCode;
	switch(keyCode){
	    case 68:  //d
	    case 39:
	    	moves.push([1,0]);    		
	    break;
	    case 83:  //s
	    case 40:
	    	moves.push([0,1]);
	    break;
	    case 65:  //a
	    case 37:
	    	moves.push([-1,0]);
	    break;
	    case 87:  //w
	    case 38:
	    	moves.push([0,-1]);
	    break;
	}
}
window.addEventListener("keydown", onKeyDown, false);

function grow(dist){
	if (growFactor>0){
		var tail = body[body.length-1]
		var bp = two.makeCircle(tail.translation.x, tail.translation.y, k/1.9);
		bp.fill = '#ffff00';
		bp.linewidth = 0;
		body.push(bp);	
		growFactor--;		
	}

}

function move(){
	var d = moves[0] || curd;
	if (d.indexOf(0)==curd.indexOf(0)){
		d = curd;
	}
	moves.shift();
	curd = d;

	var l = body.length;
	grow();
	for (var i = l-1; i >= 1; i--) {
		new TWEEN.Tween(body[i].translation)
			.to({
				x:body[i-1].translation.x,
				y:body[i-1].translation.y},throttle)
			.start();
		//body[i].translation.set(body[i-1].translation.x,body[i-1].translation.y);
	}

	var nxi = vx.indexOf(body[0].translation.x) + d[0];
	if (nxi<0){
		nxi = vx.length-1;
	} else if (nxi >= vx.length){
		nxi=0;
	}
	var nyi = vy.indexOf(body[0].translation.y) + d[1];
	if (nyi<0){
		nyi = vy.length-1;
	} else if (nyi >= vy.length){
		nyi=0;
	}
	new TWEEN.Tween(body[0].translation)
			.to({
				x:vx[nxi],
				y:vy[nyi]},throttle)
			.onComplete(calcMovement)
			.start();
	//body[0].translation.set(vx[nxi], vy[nyi]);

}

function isInBody(x,y,start){
	for (var i=start||0;i<body.length;i++){
		var t = body[i].translation;
		if (t.x==x && t.y==y){
			return true;
		}
	}
	return false;
}

var target;
var eaten = 0;

function placeTarget(){

	var x = vx[parseInt(Math.random()*(vx.length-5))+2];
	var y = vy[parseInt(Math.random()*(vy.length-5))+2];
	if (isInBody(x,y)){
		placeTarget();
	} else {
		if (target) {
			two.remove(target);
		}
		eaten++;
		target = two.makeCircle(x,y,k/3);
		target.fill = '#ff0000';
	}


}
var speed = s/2;
var throttle = 1000/speed;

var body = [head];
var moves = [[1,0]];
var curd = [1,0];


placeTarget();
alert("Use arrow keys, WASD, or touch the screen to move");

calcMovement =  function() {
	
	var l = body.length;


	if (isInBody(head.translation.x, head.translation.y, 1)){
		alert((body.length/(s*s)).toFixed(2)*100);
		window.location.href = window.location.href;
		return;
	}

	if (isInBody(target.translation.x, target.translation.y)){
		placeTarget();
		growFactor = eaten;
	}

	move();

	if (curd[0]==0){
		head.rotation = curd[1]*Math.PI*.5;
	} else {
		if (curd[0]==1){
			head.rotation=0;
		} else {
			head.rotation = Math.PI;
		}
	}
	
};

two.bind('update',function(){
	TWEEN.update();
}).play();

calcMovement();
//two.update();