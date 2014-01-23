var two = new Two({
	fullscreen:true,
	autostart:true
}).appendTo(document.body);


var k = Math.min(two.height, two.width)/10;
var c = [two.width/2, two.height/2];

var head = two.makeCircle(c[0], c[1], k/2 -1);
head.fill = '#ff9000';
head.linewidth = 1;
//head.noStroke();
head.stroke = '#cc7000'

var moves = [[1,0]];


g0 = [c[0]-parseInt(c[0]/k)*k, c[1]-parseInt(c[1]/k)*k];

var gx = g0[0], gy = g0[1];

var vx = [gx-k], vy = [gy-k];


while (gy <= two.height+k) {
	gx = g0[0];
	while(gx <= two.width+k){
		var gp = two.makeCircle(gx,gy,3);
		gp.fill='#000000';
		gp.opacity = 0.2;
		gp.linewidth=0;
		if (!_(vx).contains(gx)){
			vx.push(gx);
		}
		gx+=k;
	}
	vy.push(gy);
	gy+=k;
}

var curd = [1,0];


function onKeyDown(event){
  var keyCode = event.keyCode;
  switch(keyCode){
    case 68:  //d
    case 39:
    	if (!moves.length || moves[0][0]==0){
        	moves.push([1,0]);    		
    	}
    break;
    case 83:  //s
    case 40:
    	if (!moves.length || moves[0][1]==0){
	        moves.push([0,1]);
	    }
    break;
    case 65:  //a
    case 37:
    	if (!moves.length || moves[0][0]==0){
	        moves.push([-1,0]);
	    }
    break;
    case 87:  //w
    case 38:
    	if (!moves.length || moves[0][1]==0){
	        moves.push([0,-1]);
	    }
    break;
  }
}
window.addEventListener("keydown", onKeyDown, false);


rx = c[0];
ry = c[1];

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
}

function nextXY(dist){
	//same direction or on the grid

	var d = curd;

	if (moves.length){
		d = moves[0];
	}

	if (d.indexOf(0)==curd.indexOf(0) || (_(vy).contains(ry) && _(vx).contains(rx))){
		move(dist*d[0],dist*d[1]);
		moves.shift();
	} else {

		var np = nearestPoints();
		if (curd[0]==0){
			var ydist = Math.min(Math.abs(dist),Math.abs(np[1][''+curd[1]] - ry));
			var xdist = dist-ydist;
			move(xdist,ydist*curd[1]);
			if (xdist!=0){
				curd = moves.shift();
			}
		} else {
			var xdist = Math.min(Math.abs(dist),Math.abs(np[0][''+curd[0]] - rx));
			var ydist = dist-xdist;
			move(xdist*curd[0],ydist);
			if (ydist!=0){
				curd = moves.shift();
			}
		}
	}
}

two.bind('update', function(frameCount, timeDelta) {
 	    var dist = (timeDelta||0) * speed/10;
 	    nextXY(dist);
        head.translation.set(rx, ry);
});

two.update();


