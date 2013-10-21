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

// math

function rnd(n) {
	return Math.floor((Math.random() * n));
}

function rndRange(a, b) {
	return a + rnd(b - a);
}

function rndReal(x) {
	return Math.random() * x;
}

function rndRealRange(a, b) {
	return a + rndReal(b - a);
}

function sqr(x) {
	return x*x;
}

function distance(x1, y1, x2, y2) {
	return Math.sqrt(sqr(x1-x2) + sqr(y2-y1));
}

function sqrDistance(x1, y1, x2, y2) {
	return sqr(x1-x2) + sqr(y2-y1);
}

function norm(x, y) {
	return Math.sqrt(x*x + y*y);
}

function sqrNorm(x, y) {
	return x*x + y*y;
}

function counterClockWise(p1, p2, p3) {
    return (p2.x - p1.x)*(p3.y - p1.y) - (p2.y - p1.y)*(p3.x - p1.x)
}

function getCenterOfMassEnclosingCircle(points) {
	var sumX = 0;
	var sumY = 0;
	for(var i = 0; i < points.length; ++i) {
		sumX += points[i].x;
		sumY += points[i].y;
	}
	var centerX = sumX / points.length;
	var centerY = sumY / points.length;
	
	var maxD2 = -Infinity;
	for(var i = 0; i < points.length; ++i) {
		var d2 = sqrDistance(centerX, centerY, points[i].x, points[i].y);
		if (d2 > maxD2) {
			maxD2 = d2;
		}
	}
	
	return {
		x : centerX,
		y : centerY,
		radius : Math.sqrt(maxD2)
	}
}


// returns a list of ordered points forming the convex hull of the list of points passed as arguments
function getConvexHull(points) {
	var N = points.length;
	
	var sortedPoints = new Array(N);
	
	var minY = Infinity;
	var minX = Infinity;
	var minI = -1;
	
	for(var i = 0; i < N; ++i) {
		if (points[i].y < minY) {
			minY = points[i].y;
			minX = points[i].x;
			minI = i;
		}
		else if (points[i].y == minY) {
			if (points[i].x < minX) {
				minX = points[i].x;
				minI = i;
			}
		}
		sortedPoints[i] = points[i];
	}
	sortedPoints[0] = points[minI];
	sortedPoints[minI] = points[0];
	
	if (N <= 3) {
		return sortedPoints;
	}
	
	// sort points by angle they and sortedPoints[0] make with the x axis
	var getAngle = function(p) {
		var p0 = sortedPoints[0];
		if (p.x==p0.x && p.y==p0.y) {
			return -1;
		}
		else {
			return Math.acos((p.x - p0.x)/distance(p0.x, p0.y, p.x, p.y));
		}			
	};
	sortedPoints.sort(function(p1, p2) {
		return getAngle(p1) - getAngle(p2);
	});
		
	var currentHullIndex = 2;
	
	var hullPoints = [sortedPoints[0], sortedPoints[1]];
	while(currentHullIndex != 0) {
		var currentConsideredIndex = (currentHullIndex + 1) % N;
		while (counterClockWise(hullPoints[hullPoints.length-1], sortedPoints[currentHullIndex], sortedPoints[currentConsideredIndex]) >= 0) {
			if (currentConsideredIndex == 0) {
				hullPoints.push(sortedPoints[currentHullIndex]);
				break;
			}
			currentConsideredIndex = (currentConsideredIndex + 1) % N;
		}
		currentHullIndex = (currentHullIndex + 1) % N;
	}
	
	return hullPoints;
}

function pointInsidePolygon(point, polygon) {
	var sign1 = (point.x - polygon[0].x) * (polygon[1].y - polygon[0].y) - (point.y - polygon[0].y) * (polygon[1].x - polygon[0].x);
	if (sign1 == 0) return true;
	for(var i = 1; i < polygon.length; ++i) {
		var sign2 = 
			(point.x - polygon[i].x) * (polygon[(i+1)%polygon.length].y - polygon[i].y) 
			- (point.y - polygon[i].y) * (polygon[(i+1)%polygon.length].x - polygon[i].x);
		
		if (sign2 == 0) {
			return true;
		}
		else if (sign1 * sign2 < 0) {
			return false;
		}
	}
	return true;
}


// graphics
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(/* function */callback, /* DOMElement */element) {
		window.setTimeout(callback, 1 / 60);
	}
})();

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke == "undefined" ) {
		stroke = true;
	}
	if (typeof radius === "undefined") {
		radius = 5;
	}
	
	if (2 * radius > width) {
		radius = width / 2;
	}
	if (2 * radius > height) {
		radius = height / 2;
	}
	
	ctx.beginPath();
	ctx.moveTo(x+radius, y);
	ctx.arcTo(x+width, y,   x+width, y+height, radius);
	ctx.arcTo(x+width, y+height, x,   y+height, radius);
	ctx.arcTo(x,   y+height, x,   y,   radius);
	ctx.arcTo(x,   y,   x+width, y,   radius);
	ctx.closePath();
	
	if (stroke) {
		ctx.stroke();
	}
	if (fill) {
		ctx.fill();
	}        
}

function getNumericStyleProperty(style, prop){
    return parseInt(style.getPropertyValue(prop),10) ;
}

function elementPosition(e) {
    var x = 0, y = 0;
    var inner = true ;
    do {
        x += e.offsetLeft;
        y += e.offsetTop;
        var style = getComputedStyle(e,null) ;
        var borderTop = getNumericStyleProperty(style,"border-top-width") ;
        var borderLeft = getNumericStyleProperty(style,"border-left-width") ;
        y += borderTop ;
        x += borderLeft ;
        if (inner){
			var paddingTop = getNumericStyleProperty(style,"padding-top") ;
			var paddingLeft = getNumericStyleProperty(style,"padding-left") ;
			y += paddingTop ;
			x += paddingLeft ;
        }
        inner = false ;
    } while (e = e.offsetParent);
    return { x: x, y: y };
}
