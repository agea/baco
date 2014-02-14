var baco = _(function(mode){

	if (mode !=2){
		mode=1;
	}

	$('.container').remove();

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

	var s = 12;

	var speed = s/1.5;
	var throttle = 1000/speed;

	var eaten = -1;
	var growFactor = 0;

	var moves = [[1,0]];
	var curd = [1,0];
	var delays = [];

	var history = [];

	var releases = [];

	var k = Math.floor(Math.min(two.height, two.width)/s);
	var c = [Math.floor(two.width/2), Math.floor(two.height/2)];

	var bounds = two.makeRectangle(c[0],c[1],k*(s+1),k*(s+1));
	bounds.fill='#000000';
	bounds.stroke='#111111';

	var target = two.makeCircle(0,0,k/3);
	target.fill = '#ff0000';

	var headC = two.makeCircle(0, 0, k/1.9);
	headC.fill = '#ffff00';
	headC.noStroke();

	var eye1 = two.makeCircle(k/4,k/4, k/8);
	eye1.fill='#000000';

	var eye2 = two.makeCircle(k/4,-k/4, k/8);
	eye2.fill='#000000';

	var head =  two.makeGroup(headC, eye1, eye2);
	head.translation.set(c[0],c[1]);

	var body = [head];

	var g0 = [Math.floor(c[0]-(s/2)*k), Math.floor(c[1]-(s/2)*k)];

	var gx = g0[0], gy = g0[1];

	var vx = [], vy = [];

	while (gy <= c[1]+(s/2)*k) {
		vy.push(gy);
		gy+=k;
	}
	while(gx <= c[0]+(s/2)*k){
		vx.push(gx);
		gx+=k;
	}

	var grid = [];

	_(vx).each(function(x){
		_(vy).each(function(y){
			grid.push(1000000*x+y);
		});
	});

	grid = _(grid);

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

	function growBody(){
		var tail = body[body.length-1]
		var bp = two.makeCircle(tail.translation.x, tail.translation.y, k/1.9);
		bp.fill = '#ffff00';
		bp.noStroke();
		body.push(bp);	
	}

	function release(){
		if (growFactor==1){
			growBody();
		}
		var tail = body[body.length-1]
		releases.push([tail.translation.x,tail.translation.y]);
		var d = [[2,2],[-2,2],[2,-2],[-2,-2]][Math.floor(Math.random()*4)]

		var r = two.makeCircle(tail.translation.x+d[0], tail.translation.y+d[1],k/3);
		r.fill="#a05000";
		r.noStroke();

	}

	function grow(dist){
		if (growFactor>0){
			if (mode==1){
				growBody();
			} else {
				release();
			}
			growFactor--;		
		}
	}

	function step(k){
		return 1;
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
		var h = history.length;
		for (var i = 1; i<l; i++) {

			var jump = history[h-i][2];
			new TWEEN.Tween(body[i].translation)
				.to({
					x:history[h-i][0],
					y:history[h-i][1]},throttle)
				.easing(jump ? step : TWEEN.Easing.Linear.None)
				.start();
			if (jump){
				body[i].fill='rgba(0,0,0,0)';
			} else {
				body[i].fill='#ffff00';
			}
			//body[i].translation.set(body[i-1].translation.x,body[i-1].translation.y);
		}

		var jump = false;

		var nxi = vx.indexOf(body[0].translation.x) + d[0];
		if (nxi<0){
			nxi = vx.length-1;
			jump = true;
		} else if (nxi >= vx.length){
			nxi=0;
			jump = true;
		}
		var nyi = vy.indexOf(body[0].translation.y) + d[1];
		if (nyi<0){
			nyi = vy.length-1;
			jump = true;
		} else if (nyi >= vy.length){
			nyi=0;
			jump = true;
		}
		history.push([vx[nxi], vy[nyi],jump]);
		if (history.length>body.length){
			history.shift();
		}
		new TWEEN.Tween(body[0].translation)
				.to({
					x:vx[nxi],
					y:vy[nyi]},throttle)
				.easing(jump ? step : TWEEN.Easing.Linear.None)
				.onComplete(calcMovement)
				.start();
			if (jump){
				headC.fill='rgba(0,0,0,0)';
			} else {
				headC.fill='#ffff00';
			}


	}

	function isInBody(x,y,start){
		for (var i=start||0;i<body.length;i++){
			var t = body[i].translation;
			if (t.x==x && t.y==y){
				return true;
			}
		}
		if (start==1){
			for (var i=0;i<releases.length;i++){
				var h = head.translation;
				if (releases[i][0]==h.x && releases[i][1]==h.y){
					return true;
				}
			}
		}
		return false;
	}


	function placeTarget(){

		var mb = _(body).map(function(b){
			return 1000000*b.translation.x+b.translation.y;
		});
		_(releases).each(function(r){
			mb.push(r[0]*1000000+r[1]);
		});

		var free = grid.filter(function(g){
			return mb.indexOf(g)==-1;
		});

		var i = Math.floor(Math.random()*free.length);

		target.translation.set(Math.floor(free[i]/1000000),free[i]%1000000);
		eaten++;

	}



	function calcMovement() {
		
		var l = body.length;


		if (isInBody(head.translation.x, head.translation.y, 1)){
			$('#score').html(eaten);
			$('#modal').modal();
			cycle.pause();
			window.addEventListener("keydown", function(){
				window.location.href = window.location.href;
			}, false);
		}

		if (isInBody(target.translation.x, target.translation.y)){
			placeTarget();
			growFactor += eaten;
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

	var cycle = two.bind('update',function(){
		TWEEN.update();
	});

	window.addEventListener('touchstart', touch, false);
	window.addEventListener("keydown", onKeyDown, false);

	placeTarget();
	cycle.play();
	calcMovement();

}).once();
