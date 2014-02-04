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


var headC = two.makeCircle(0, 0, k/1.8);
headC.fill = '#ffff00';
headC.linewidth = 1;
//head.noStroke();
headC.stroke = 'rgba(0,0,0,0.5)';

var eye1 = two.makeCircle(k/4,k/4, k/8);
eye1.fill='#000000';

var eye2 = two.makeCircle(k/4,-k/4, k/8);
eye2.fill='#000000';

var head =  two.makeGroup(headC, eye1, eye2);

head.translation.set(c[0],c[1]);

var g0 = [c[0]-parseInt(c[0]/k)*k, c[1]-parseInt(c[1]/k)*k];

var gx = g0[0], gy = g0[1];

var vx = [gx-2*k, gx-k], vy = [gy-2*k, gy-k];

var growFactor = 0;

while (gy <= two.height+2*k) {
	gx = g0[0];
	while(gx <= two.width+2*k){
		if (!_(vx).contains(gx)){
			vx.push(gx);
		}
		gx+=k;
	}
	vy.push(gy);
	gy+=k;
}

function grow(dist){
	if (growFactor>0){
		var tail = body[body.length-1]
		var bp = two.makeCircle(c[0], c[1], k/2.2);
		bp.fill = '#ffff00';
		bp.linewidth = 2;
		//head.noStroke();
		bp.stroke = 'rgba(128,64,0,0.8)';
		taild = curds[curds.length-1];
		curds.push(taild);
		moves.push([taild]);
		turns.push(undefined);

		bptr = move(dist*taild[0]*-1,dist*taild[1]*-1, tail.translation.x, tail.translation.y);

		bp.translation.set(bptr[0], bptr[1]);

		body.push(bp);	
		growFactor--;		
	}

}

function touch (event) {
	var x = event.changedTouches[0].pageX;
	var y = event.changedTouches[0].pageY;

	if (curds[0][0]==0){
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
window.addEventListener('touchend', touch, false);




function onKeyDown (event) {
	var keyCode = event.keyCode;
	switch(keyCode){
    case 68:  //d
    case 39:
    	moves[0].push([1,0]);    		
    break;
    case 83:  //s
    case 40:
    	moves[0].push([0,1]);
    break;
    case 65:  //a
    case 37:
    	moves[0].push([-1,0]);
    break;
    case 87:  //w
    case 38:
    	moves[0].push([0,-1]);
    break;
}
}
window.addEventListener("keydown", onKeyDown, false);


function nearestPoint (curx, cury, curd) {
	var v = vx;
	var d = curd[0];
	var c = curx;
	if (curd[0]==0){
		v = vy;
		d = curd[1];
		c = cury;
	}
	if (d>0){
		for (var i=0;i<v.length;i++){
			if (v[i]>c){
				return v[i];
			}
		}	
	} else {
		for (var i=v.length;i>0;i--){
			if (v[i]<c){
				return v[i];
			}
		}	

	}
}



function move(dx, dy, curx, cury){
	return [
		(two.width+curx+dx) % two.width,
		(two.height+cury+dy) % two.height
	];
}

function nextXY(dist, i){
	
	var curd = curds[i];
	var curx = body[i].translation.x;
	var cury = body[i].translation.y;
	var d = moves[i][0] || curd;
	var m;
	var bd;

	var np = nearestPoint(curx, cury, curd);

	if (d.indexOf(0)==curd.indexOf(0) || (turns[i] && turns[i]!=np) ){
		m = move(dist*curd[0],dist*curd[1], curx, cury);
		moves[i].shift();
		bd = curd;
	} else {
		if (curd[0]==0){
			var ydist = Math.min(Math.abs(dist),Math.abs(np - cury));
			var xdist = dist-ydist;
			m = move(xdist*d[0],ydist*curd[1], curx, cury);
			if (xdist!=0){
				bd = moves[i].shift();
				curds[i] = d;
				if (i<moves.length-1){
					turns[i+1] = np;
					moves[i+1].push(curds[i]);
				}
			}
		} else {
			var xdist = Math.min(Math.abs(dist),Math.abs(np - curx));
			var ydist = dist-xdist;
			m = move(xdist*curd[0],ydist*d[1], curx, cury);
			if (ydist!=0){
				bd = moves[i].shift();
				curds[i] = d;
				if (i<moves.length-1){
					turns[i+1] = np;
					moves[i+1].push(curds[i]);
				}
			}
		}
	}

	return m;
}

function isInBody(x,y,start){
	for (var i=start||0;i<body.length;i++){
		var r = body[i].getBoundingClientRect();
		if (r.top <= y && r.bottom >= y && r.left <= x && r.right >= x){
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

var speed = 5;

var body = [head];
var moves = [[[1,0]]];
var curds = [[1,0]];
var turns = [undefined];

var uc = 0;

placeTarget();


two.bind('update', function(frameCount, timeDelta) {
	uc++;
	var dist = Math.min((timeDelta||0) * speed/10,k/2);
	var l = body.length;
	if (frameCount%10==0) {
		grow(k/2);
	}

	var translations = new Array(body.length);

	for (var i = 0; i<l;i++){
		var m = nextXY(dist, i);
		body[i].translation.set(m[0],m[1]);
	}
	
	if (isInBody(head.translation.x, head.translation.y, 2)){
		window.location.href = window.location.href;
		return;
	}

	if (isInBody(target.translation.x, target.translation.y)){
		placeTarget();
		growFactor = eaten;
	}

	if (curds[0][0]==0){
		head.rotation = curds[0][1]*Math.PI*.5;
	} else {
		if (curds[0][0]==1){
			head.rotation=0;
		} else {
			head.rotation = Math.PI;
		}
	}
	

	uc--;
});

two.update();


