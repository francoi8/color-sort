/*
The MIT License (MIT)

Copyright (c) 2013 François Morvillier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

var collisionMatrix = [];

function initCollisionMatrix(size) {
	for(var i = 0; i < size; ++i) {
		var row = new Array(size);
		for(var j = 0; j < size; ++j) {
			row[j] = undefined;
		}
		collisionMatrix.push(row);
	}
	
}

function collision(a, b) {
	return sqrDistance(a.x, a.y, b.x, b.y) < sqr(a.radius + b.radius);
}

function getCollisionTime(a, b, maxTime) {
	var maxTime = maxTime || Infinity;
	// quick test
	//if (sqrNorm(a.x-b.x, a.y-b.y) - sqr(a.radius + b.radius) > sqrNorm(maxTime*(a.dx-b.dx), maxTime*(a.dy-b.dy))) {
		//return undefined;
	//}
	
	var dx = b.dx - a.dx;
	var dy = b.dy - a.dy;
	var x = b.x - a.x;
	var y = b.y - a.y;
	
	var aa = dx*dx + dy*dy;
	var bb = 2 * (x*dx + y*dy);
	var cc = x*x + y*y - sqr(a.radius + b.radius);
	
	var delta = bb*bb - 4*aa*cc;
	
	var t = undefined;
	
	if (delta < 0) {
		return undefined;
	}
	else if (delta == 0) {
		t = 0;
	}
	else {
		var t1 = (-bb + Math.sqrt(delta)) / (2 * aa);
		var t2 = (-bb - Math.sqrt(delta)) / (2 * aa);
		//console.log("collisiontimes:" + t1 + " " + t2 + " maxTime=" + maxTime);
		if (t1 < 0) {
			if (t2 < 0) {
				return undefined;
			}
			else {
				t = t2;
			}
		}
		else {
			if (t2 < 0) {
				t = t1; 
			}
			else {
				t = Math.min(t1, t2);
			}
		}
	}

	if (t == 0) {
			// will the items be closer after a infinitesimal time? if so return 0 otherwise return undefined
		var dt = 0.0000001;
		if (sqr(a.dx-b.dx) + sqr(a.dy-b.dy) == 0) { // no relative motion
			return undefined;
		}
		if (sqrNorm(a.x+dt*a.dx - b.x+dt*b.dx, a.y+dt*a.dy - b.y+dt*b.dy) < sqr(a.radius + b.radius)) {
			return 0;
		}
		else {
			return undefined;
		}
	}
	else {
		return t;
	}
}

// returns first collision {time, i, j} or undefined if none
// XXX: only compute invalidated (null?) rows
function computeCollisionMatrix(maxTime) {
	var firstCollisionTime = Infinity;
	var firstI = undefined;
	var firstJ = undefined;
	
	for(var i = 0; i < items.length; ++i) {
		for(var j = 0; j < i; ++j) {
			var collisionTime = getCollisionTime(items[i], items[j], maxTime);
//console.log("got collision time=" + collisionTime);
			collisionMatrix[i][j] = collisionTime;
			if (collisionTime < firstCollisionTime) {
				firstCollisionTime = collisionTime;
				firstI = i;
				firstJ = j;
			}
		}
	}
	
	return firstCollisionTime < maxTime ? {time: firstCollisionTime, i:firstI, j:firstJ} : undefined;
}

// applies the effect of a collision between items a and b
// code adapted from : http://blogs.msdn.com/b/faber/archive/2013/01/09/elastic-collisions-of-balls.aspx
function applyCollision(a, b) {
	var massA = a.mass || 1;
	var massB = b.mass || 1;
	
	var collisionisionAngle = Math.atan2((b.y - a.y), (b.x - a.x));        
	var speed1 = norm(a.dx, a.dy);
	var speed2 = norm(b.dx, b.dy);

	var direction1 = Math.atan2(a.dy, a.dx);
	var direction2 = Math.atan2(b.dy, b.dx);
	var new_xspeed_1 = speed1 * Math.cos(direction1 - collisionisionAngle);
	var new_yspeed_1 = speed1 * Math.sin(direction1 - collisionisionAngle);
	var new_xspeed_2 = speed2 * Math.cos(direction2 - collisionisionAngle);
	var new_yspeed_2 = speed2 * Math.sin(direction2 - collisionisionAngle);

	var final_xspeed_1 = ((massA - massB) * new_xspeed_1 + (massB + massB) * new_xspeed_2) / (massA + massB);
	var final_xspeed_2 = ((massA + massA) * new_xspeed_1 + (massB - massA) * new_xspeed_2) / (massA + massB);
	var final_yspeed_1 = new_yspeed_1;
	var final_yspeed_2 = new_yspeed_2;

	var cosAngle = Math.cos(collisionisionAngle);
	var sinAngle = Math.sin(collisionisionAngle);
	a.dx = cosAngle * final_xspeed_1 - sinAngle * final_yspeed_1;
	a.dy = sinAngle * final_xspeed_1 + cosAngle * final_yspeed_1;
	b.dx = cosAngle * final_xspeed_2 - sinAngle * final_yspeed_2;
	b.dy = sinAngle * final_xspeed_2 + cosAngle * final_yspeed_2;
}