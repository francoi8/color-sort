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

var globals = {
	levels : [
		{
			groundFriction : 10,
			itemRadius : 20,
			availableBrushSizes : [35, 55, 80],
			itemCounts : [5, 5, 5]
		},
		{
			groundFriction : 10,
			itemRadius : 15,
			availableBrushSizes : [25, 40, 80],
			itemCounts : [10, 10, 10]
		},
		{
			groundFriction : 2,
			itemRadius : 15,
			availableBrushSizes : [25, 40, 80],
			itemCounts : [15, 15, 15]
		},
		{
			groundFriction : 10,
			itemRadius : 15,
			availableBrushSizes : [25, 40, 80],
			itemCounts : [20, 20, 20, 20]
		},
		{
			groundFriction : 2,
			itemRadius : 15,
			availableBrushSizes : [25, 40, 80],
			itemCounts : [20, 20, 20, 20]
		}		
	],
	
	gameParameters : {
		groundFriction : 2,
		itemRadius : 15,
		availableBrushSizes : [25, 40, 80],
		//itemCounts : [5, 5, 5]
		itemCounts : [10, 10, 10, 10]
	},
	
	game : { // variables that will be updated during the game
		state : -1, // -1 : introduction, 0: game initializing, 1: game running, 2: game over/inter-level
		convexHulls : [],
		enclosingCircles : [],
		typeCount : undefined,
		level : 0,
		currentBrush : 0
	},
	
	clock : {
		lastTick : Date.now(),
		dt : 0,
		
		game : {
			time : 0
		}
	},
	
	layout : {
		game : {
			width : 800,
			height : 600,
			startButton : {
				x : 300,
				y : 350,
				width : 200,
				height : 50
			},
			replayLevelButton : {
				x : 80,
				y : 410,
				width : 300,
				height : 50
			},
			nextLevelButton : {
				x : 420,
				y : 410,
				width : 300,
				height : 50
			},
			STARTBUTTONREGION : 100,
			REPLAYLEVELBUTTONREGION : 101,
			NEXTLEVELBUTTONREGION : 102
		},
		
		header : {
			width : 800,
			height : 60,
			brushSizeIcons : [],
			BRUSHSIZEBUTTONREGIONOFFSET : 0,
			LEVELBUTTONREGIONOFFSET : 20
		},
		
		canvas : {
		}
	}
}

function start() {
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	
	initLayout();
	
	initColors();
	
	initEvents();
	
	generateAnimFrame();

	//startGame(); 	
}

function initLayout() {
	globals.layout.canvas.width = globals.layout.game.width;
	globals.layout.canvas.height = globals.layout.game.height + globals.layout.header.height;
	
	canvas.width = globals.layout.canvas.width;
	canvas.height = globals.layout.canvas.height;
	
	initButtonsLayout();
	
	initBrushSizeButtonsLayout();
	
	initLevelButtonsLayout();
}

function initButtonsLayout() {
	var margin = globals.layout.header.height / 6;
	var iconSize = globals.layout.header.height - margin * 2;
	globals.layout.header.margin = margin;
	globals.layout.header.iconSize = iconSize;
}

function initBrushSizeButtonsLayout() {
	var margin = globals.layout.header.margin;
	var iconSize = globals.layout.header.iconSize;
	
	globals.layout.header.iconSize = iconSize;
	var leftMargin = globals.layout.header.brushSizesButtonsLeftMargin = globals.layout.header.width - globals.gameParameters.availableBrushSizes.length * (iconSize + margin);
		
	globals.layout.header.brushSizeIcons = [];
	for(var i = 0; i < globals.gameParameters.availableBrushSizes.length; ++i) {
		globals.layout.header.brushSizeIcons[i] = { x : leftMargin, y : margin, width : iconSize, height : iconSize };
		leftMargin += margin + iconSize;
	}
}

function initLevelButtonsLayout() {
	var margin = globals.layout.header.margin;
	var iconSize = globals.layout.header.iconSize;
	
	var leftMargin = globals.layout.header.levelsButtonsLeftMargin = globals.layout.header.width - globals.gameParameters.availableBrushSizes.length * (iconSize + margin) - 4 * margin - globals.levels.length * (iconSize + margin);
	
	globals.layout.header.levelIcons = [];
	for(var i = 0; i < globals.levels.length; ++i) {
		globals.layout.header.levelIcons[i] = { x : leftMargin, y : margin, width : iconSize, height : iconSize };
		leftMargin += margin + iconSize;
	}
}

function initColors() {
	var grd1 = context.createLinearGradient(0, -10, 0, 20);
	grd1.addColorStop(0, "rgb(255, 0, 0)");
	grd1.addColorStop(1,"rgb(120, 0, 0)");

	var grd2 = context.createLinearGradient(0, -10, 0, 20);
	grd2.addColorStop(0, "rgb(0, 0, 255)");
	grd2.addColorStop(1,"rgb(0, 0, 120)");

	var grd3 = context.createLinearGradient(0, -10, 0, 20);
	grd3.addColorStop(0, "rgb(0, 220, 0)");
	grd3.addColorStop(1,"rgb(0, 128, 0)");

	var grd4 = context.createLinearGradient(0, -10, 0, 20);
	grd4.addColorStop(0, "rgb(255, 255, 0)");
	grd4.addColorStop(1,"rgb(100, 100, 0)");

	var grd5 = context.createLinearGradient(0, -10, 0, 20);
	grd5.addColorStop(0, "rgb(120, 120, 120)");
	grd5.addColorStop(1,"rgb(0, 0, 0)");

	colors = [grd1, grd2, grd3, grd4, grd5];
}


function initEvents() {
	var capture = function() {
		mouse.captured = [];
		for(var j = 0; j < items.length; ++j) {
			var item = items[j];
			if (collision(item, mouse)) {
				mouse.captured.push(j);
			}
		}
	}
	
	mouse.overBrushSizeIcon = function(brushIndex) {
		return mouse.overRegion[globals.layout.header.BRUSHSIZEBUTTONREGIONOFFSET + brushIndex];
	}
	
	mouse.overLevelIcon = function(levelIndex) {
		return mouse.overRegion[globals.layout.header.LEVELBUTTONREGIONOFFSET + levelIndex];
	}
	
	
	canvas.addEventListener("mousemove", function(ev) {
		var now = Date.now();
		
		// header area
		//var x = ev.offsetX;
		//var y = ev.offsetY;
		var canvasPos = elementPosition(canvas);
		var x = ev.pageX - canvasPos.x;
		var y = ev.pageY - canvasPos.y;
		
		for(var i = 0; i < globals.layout.header.brushSizeIcons.length; ++i) {
			var icon = globals.layout.header.brushSizeIcons[i];
			if ((x >= icon.x) && (x <= icon.x + icon.width) && (y >= icon.y) && (y <= icon.y + icon.height)) {
				mouse.overRegion[globals.layout.header.BRUSHSIZEBUTTONREGIONOFFSET+i] = true;
			}
			else {
				mouse.overRegion[globals.layout.header.BRUSHSIZEBUTTONREGIONOFFSET+i] = false;
			}
		}
		
		for(var i = 0; i < globals.layout.header.levelIcons.length; ++i) {
			var icon = globals.layout.header.levelIcons[i];
			if ((x >= icon.x) && (x <= icon.x + icon.width) && (y >= icon.y) && (y <= icon.y + icon.height)) {
				mouse.overRegion[globals.layout.header.LEVELBUTTONREGIONOFFSET+i] = true;
			}
			else {
				mouse.overRegion[globals.layout.header.LEVELBUTTONREGIONOFFSET+i] = false;
			}
		}
		
		
		// game area
		x = ev.pageX - canvasPos.x;
		y = ev.pageY - canvasPos.y - globals.layout.header.height;
		
		if (globals.game.state == -1) {
			var startButton = globals.layout.game.startButton;
			if ((x >= startButton.x) && (x <= startButton.x + startButton.width) && (y >= startButton.y) && (y <= startButton.y + startButton.height)) {
				mouse.overRegion[globals.layout.game.STARTBUTTONREGION] = true;
			}
			else {
				mouse.overRegion[globals.layout.game.STARTBUTTONREGION] = false;
			}			
		}
		else if (globals.game.state == 1) {		
			if (mouse.captured) {
				capture();
			}
		}
		else if (globals.game.state == 2) {
			var replayLevelButton = globals.layout.game.replayLevelButton;
			if ((x >= replayLevelButton.x) && (x <= replayLevelButton.x + replayLevelButton.width) && (y >= replayLevelButton.y) && (y <= replayLevelButton.y + replayLevelButton.height)) {
				mouse.overRegion[globals.layout.game.REPLAYLEVELBUTTONREGION] = true;
			}
			else {
				mouse.overRegion[globals.layout.game.REPLAYLEVELBUTTONREGION] = false;
			}			
			
			var nextLevelButton = globals.layout.game.nextLevelButton;
			if ((x >= nextLevelButton.x) && (x <= nextLevelButton.x + nextLevelButton.width) && (y >= nextLevelButton.y) && (y <= nextLevelButton.y + nextLevelButton.height)) {
				mouse.overRegion[globals.layout.game.NEXTLEVELBUTTONREGION] = true;
			}
			else {
				mouse.overRegion[globals.layout.game.NEXTLEVELBUTTONREGION] = false;
			}			
		}
		
		mouse.x = x;
		mouse.y = y;
	}, false);
	
	canvas.addEventListener("mousedown", function(ev) {
		// header
		for(var i = 0; i < globals.layout.header.brushSizeIcons.length; ++i) {
			if (mouse.overBrushSizeIcon(i)) {
				selectBrush(i);
			}
		}
		
		for(var i = 0; i < globals.levels.length; ++i) {
			if (mouse.overLevelIcon(i)) {
				globals.game.level = i;
				startGame();
			}
		}
		
		if (mouse.overRegion[globals.layout.game.STARTBUTTONREGION]) {
			mouse.overRegion[globals.layout.game.STARTBUTTONREGION] = false;
			startGame();
		}
		
		else if (mouse.overRegion[globals.layout.game.NEXTLEVELBUTTONREGION]) {
			mouse.overRegion[globals.layout.game.NEXTLEVELBUTTONREGION] = false;
			globals.game.level = (globals.game.level + 1) % globals.levels.length;
			startGame();
		}
		
		else if (mouse.overRegion[globals.layout.game.REPLAYLEVELBUTTONREGION]) {
			mouse.overRegion[globals.layout.game.REPLAYLEVELBUTTONREGION] = false;
			startGame();
		}
		
		capture();
	}, false);
	
	canvas.addEventListener("mousewheel", function(ev) {
		var ev = window.event || ev; // old IE support
		var delta = Math.max(-1, Math.min(1, (ev.wheelDelta || -ev.detail)));
		
		selectBrush((globals.game.currentBrush + delta + globals.gameParameters.availableBrushSizes.length) % globals.gameParameters.availableBrushSizes.length);
		
		return true;
	}, false);
	
	canvas.addEventListener("mouseup", function(ev) {
		mouse.captured = undefined;
	}, false);
	
	document.body.style.overflow="hidden";
}


function startGame() {
	globals.gameParameters = globals.levels[globals.game.level];
	
	globals.game.state = 0;
	globals.clock.game.time = 0;
	
	//initItems([100, 100, 100, 100]);
	//initItems([20, 20, 20, 20]);
	//initItems([5, 5, 5]);
	//initItems([1, 1]);
	initItems(globals.gameParameters.itemCounts);
	
	globals.game.typeCount = itemsByType.length;
	
	globals.game.state = 1;
	
	selectBrush(0);
}

function endGameCondition() {
	return !enclosingCirclesIntercept();
}

function selectBrush(brushIndex) {
	mouse.radius = globals.gameParameters.availableBrushSizes[brushIndex];
	globals.game.currentBrush = brushIndex;
}

function enclosingCirclesIntercept() {
	for(var type1 = 0; type1 < globals.game.typeCount; ++type1) {
		var circle1 = globals.game.enclosingCircles[type1];
		for(var type2 = type1 + 1; type2 < globals.game.typeCount; ++type2) {
			var circle2 = globals.game.enclosingCircles[type2];
			if (sqrDistance(circle1.x, circle1.y, circle2.x, circle2.y) < sqr(circle1.radius + circle2.radius)) {
				return true;
			}
		}
	}
	return false;
}

function convexHullsIntercept() {
	for(var type = 0; type < globals.game.typeCount; ++type) {
		var hullLowX = Infinity;
		var hullHighX = -Infinity;
		var hullLowY = Infinity;
		var hullHighY = -Infinity;
		
		var hull = globals.game.convexHulls[type];
		for(var i = 0; i < hull.length; ++i) {
			var point = hull[i];
			if (point.x < hullLowX) hullLowX = point.x;
			if (point.x > hullHighX) hullHighX = point.x;
			if (point.y < hullLowY) hullLowY = point.y;
			if (point.y > hullHighY) hullHighY = point.y;			
		}
		
		for(var i = 0; i < items.length; ++i) {
			var item = items[i];
			if (item.type != type) {
				if (item.x>=hullLowX && item.x<=hullHighX && item.y>=hullLowY && item.y<=hullHighY) {
					if (pointInsidePolygon(item, hull)) {
						return true;
					}
				}
			}
		}
	}
	
	return false;
}

function initItems(counts) {
	var width = globals.layout.game.width;
	var height = globals.layout.game.height;
	
	items = [];
	itemsByType = [];
	
	for(var type = 0; type < counts.length; ++type) {
		var count = counts[type];
		itemsByType[type] = [];
		for(var i = 0; i < count; ++i) {
			var collision, x, y, radius;
			do {
				collision = false;
				radius = globals.gameParameters.itemRadius;
				x = rndRealRange(radius, width - radius);
				y = rndRealRange(radius, height - radius);
				for(var j = 0; j < items.length; ++j) {
					var item = items[j];
					if (sqrDistance(item.x, item.y, x, y) < sqr(item.radius + radius)) {
						//console.log("collision " + type + "/" + i);
						collision = true;
						break;
					}
				}
			} while (collision);
			
			var item = new Item(x, y, type, radius);
			items.push(item);
			itemsByType[type].push(item);
		}
	}
	
	//globals.game.convexHulls = new Array(counts.length);
	globals.game.enclosingCircles = new Array(counts.length);
	
	initCollisionMatrix(items.length);
}


function update(dt) {
	if (globals.game.state == 1) {
		// update game clock
		globals.clock.game.time += dt;
		
		// mouse action
		if (mouse.lastX && mouse.lastY && mouse.x && mouse.y && mouse.captured) {
			var dx = dt ? (mouse.x - mouse.lastX) / dt : 0;
			var dy = dt ? (mouse.y - mouse.lastY) / dt : 0;
			var mouseSpeed = Math.sqrt(sqr(dx)+sqr(dy));
				
			for(var i = 0; i < mouse.captured.length; ++i) {
				var item = items[mouse.captured[i]];
				var friction = Math.pow(Math.max(0, (mouse.radius - Math.min(mouse.radius, distance(mouse.lastX, mouse.lastY, item.x, item.y))) / mouse.radius), 0.9);
				//console.log("friction=" + friction + " distance=" + distance(mouse.x, mouse.y, item.x, item.y));
				item.dx = friction * dx + (1 - friction) * item.dx;
				item.dy = friction * dy + (1 - friction) * item.dy;
			}
		}
		mouse.lastX = mouse.x;
		mouse.lastY = mouse.y;
		
		/*
		// finer way of handling collisions but unfortunately doesn't work well, probably because of effects of multiple collisions because of a lack of stepping out of a collision?
		var currentT = 0; // measure of time inside [0, dt]
		var iter = 0;
		do {
			var nextCollision = computeCollisionMatrix(dt-currentT);
			
			var dt2 = nextCollision ? nextCollision.time : dt - currentT;
			
			applySpeedAndBorderCollisions(dt2);
			
			if (nextCollision) {
				console.log("applying collision");
				// XXX: invalidate rows i+j of collisionMatrix
				applyCollision(items[nextCollision.i], items[nextCollision.j]);
			}
			
			currentT += dt2;
			
			if (iter++ > 10) {
				console.log("stuck in collision loop??");
			}
		} while (nextCollision != undefined);
		*/
		
		// simpler way of handling collisions:
		for(var i = 0; i < items.length; ++i) {
			for(var j = 0; j < i; ++j) {
				if (collision(items[i], items[j])) {
					// exclude both items
					applyExclusionForce(items[i], items[j]);
					
					applyCollision(items[i], items[j]);
				}
				else if (getCollisionTime(items[i], items[j]) < dt) {
					applyCollision(items[i], items[j]);
				}			
			}
		}
		
		applySpeedAndBorderCollisions(dt);
		
		//applySpeedAndBorderCollisions(dt);
		
		// compute convex hulls
		for(var type = 0; type < globals.game.typeCount; ++type) {
			//globals.game.convexHulls[type] = getConvexHull(itemsByType[type]);
			globals.game.enclosingCircles[type] = getCenterOfMassEnclosingCircle(itemsByType[type]);
		}
		
		// end game?
		if (endGameCondition()) {
			globals.game.state = 2;
			
		}

	}
	
}

function applyExclusionForce(item1, item2) {
	var centerX = (item1.x + item2.x) / 2;
	var centerY = (item1.y + item2.y) / 2;
	
	var radiiSum = item1.radius + item2.radius;
	
	if (item1.x==item2.x && item1.y==item2.y) {
		item1.x = centerX - radiiSum / 2;
		item2.x = centerX + radiiSum / 2;
		item2.y = item1.y = centerY;
	}
	else {
		var ix = item1.x - centerX;
		var iy = item1.y - centerY;
		var inorm = norm(ix, iy);
		var jx = item2.x - centerX;
		var jy = item2.y - centerY;
		var jnorm = norm(jx, jy);
		
		item1.x = centerX + ix/inorm * radiiSum / 2;
		item1.y = centerY + iy/inorm * radiiSum / 2;
		item2.x = centerX + jx/jnorm * radiiSum / 2;
		item2.y = centerY + jy/jnorm * radiiSum / 2;
	}	
}

function applySpeedAndBorderCollisions(dt) {
	//console.log("forward dt=" + dt);
	for(var j = 0; j < items.length; ++j) {
		var item = items[j];
		
		var newX = item.x + item.dx * dt;
		var newY = item.y + item.dy * dt;

		if (newX < item.radius) {
			item.x = 2 * item.radius - newX;
			item.dx = -item.dx;
		}
		else if (newX > globals.layout.game.width - item.radius) {
			item.x = 2 * (globals.layout.game.width -  item.radius) - newX;
			item.dx = -item.dx;			
		}
		else {
			item.x = newX;
		}
		
		if (newY < item.radius) {
			item.y = 2 * item.radius - newY;
			item.dy = -item.dy;
		}
		else if (newY > globals.layout.game.height - item.radius) {
			item.y = 2 * (globals.layout.game.height -  item.radius) - newY;
			item.dy = -item.dy;			
		}
		else {
			item.y = newY;
		}
		
		var groundFriction = globals.gameParameters.groundFriction;
		item.dx = item.dx - item.dx * (groundFriction * dt);
		item.dy = item.dy - item.dy * (groundFriction * dt);
	}

}

function draw() {
	drawHeader();
	
	drawGame();
}

function drawHeader() {
	// background
	context.fillStyle = "#BBBBCC";
	context.fillRect(0, 0, globals.layout.game.width, globals.layout.game.height);
	
	// game clock
	//context.font = "20pt Impact";
	context.font = "30pt Impact";
	context.fillStyle = "#444488";
	context.fillText("time: " + globals.clock.game.time.toFixed(0), 40, 45);

	// draw brush size icons
	var size = globals.gameParameters.availableBrushSizes[i];
	var margin = globals.layout.header.margin;
	var iconSize = globals.layout.header.iconSize;
	var leftMargin = globals.layout.header.brushSizesButtonsLeftMargin;

	for(var i = 0; i < globals.gameParameters.availableBrushSizes.length; ++i) {
		var size = globals.gameParameters.availableBrushSizes[i];
		
		context.save();
		context.translate(leftMargin, margin);
		
		context.strokeStyle = "#444488"; 
		context.fillStyle = mouse.overBrushSizeIcon(i) && globals.game.state==1 ? "#444488" : "#E0E0F0"; 

		context.lineWidth = 1;
		roundRect(context, 0, 0, iconSize, iconSize, margin, true, true);
		
		var radius = Math.min(iconSize / 2.2, iconSize / 2.2 * size / 100);
		context.fillStyle = mouse.overBrushSizeIcon(i) && globals.game.state==1  ? "#E0E0F0" : "#444488";
		context.translate(iconSize / 2, iconSize / 2);
		context.beginPath();
		context.arc(0, 0, radius, 0, 2 * Math.PI, false);
		context.closePath();
		context.fill();
		
		
		context.restore();
		
		leftMargin += iconSize + margin;
	}
	
	leftMargin = globals.layout.header.levelsButtonsLeftMargin;
	for(var i = 0; i < globals.levels.length; ++i) {
		context.save();
		context.translate(leftMargin, margin);
		
		context.strokeStyle = "#444488"; 
		context.fillStyle = mouse.overLevelIcon(i) ? "#444488" : "#E0E0F0"; 

		context.lineWidth = 1;
		roundRect(context, 0, 0, iconSize, iconSize, margin, true, true);
		
		context.fillStyle = mouse.overLevelIcon(i)  ? "#E0E0F0" : "#444488";
		var fontSize = 18;
		context.font = fontSize + "pt Impact";
		var text = (i+1).toFixed(0);
		context.fillText(text, (iconSize - context.measureText(text).width) / 2, (iconSize + fontSize) / 2);
		
		
		context.restore();
		
		leftMargin += iconSize + margin;
	}
}

function drawGame() {	
	
	context.save();
	context.translate(0, globals.layout.header.height);
	
	context.beginPath();
	context.rect(0, 0, globals.layout.game.width, globals.layout.game.height);
	context.closePath();
	context.clip();
	
	// background
	context.fillStyle = "white";
	context.fillRect(0, 0, globals.layout.game.width, globals.layout.game.height);
	
	if (globals.game.state > 0) {
		// convex hulls
		for(var type = 0; type < itemsByType.length; ++type) {
			//drawConvexHull(type);
			drawEnclosingCircle(type);
		}
		
		// items
		for(var j = 0; j < items.length; ++j) {
			var item = items[j];
			context.save();
			context.translate(item.x, item.y);
			
			context.fillStyle = colors[item.type];
			context.beginPath();
			context.arc(0, 0, item.radius, 0, 2 * Math.PI, false);
			context.closePath();
			context.fill();
			
			context.fillStyle = "white";
			context.globalAlpha = 0.75;
			context.beginPath();
			context.arc(0, - item.radius * 2/3, item.radius * 0.25, 0, 2 * Math.PI, false);
			context.closePath();
			context.fill();
			
			context.restore();
		}
	}
		
	if (globals.game.state == -1) {
		context.globalAlpha = 0.7;
		context.fillStyle = "#BBBBCC"
		context.fillRect(0, 225, globals.layout.game.width, 210);
		context.globalAlpha = 1.0;
		
		context.font = "40pt Raleway";
		context.fillStyle = "#444488";
		
		var text = "Make piles of the same color.";
		context.fillText(text, (globals.layout.game.width - context.measureText(text).width) / 2, 300);
		
		context.fillStyle = mouse.overRegion[globals.layout.game.STARTBUTTONREGION] ? "#444488": "#E0E0F0";
		context.strokeStyle = "#444488";
		context.lineWidth = 3;
		roundRect(context, globals.layout.game.startButton.x, globals.layout.game.startButton.y, globals.layout.game.startButton.width, globals.layout.game.startButton.height, 10, true, true);
		context.font = "30pt Impact";
		context.fillStyle = mouse.overRegion[globals.layout.game.STARTBUTTONREGION] ? "#E0E0F0" : "#444488";
		text ="Start!";
		context.fillText(text, (globals.layout.game.width - context.measureText(text).width) / 2, globals.layout.game.startButton.y + 40);
	}
	else if (globals.game.state == 1) {
		// mouse
		if (mouse.x != undefined && mouse.y != undefined) {
			context.globalAlpha = 0.3;
			context.fillStyle = "rgb(0, 0, 50)";
			context.beginPath();
			context.arc(mouse.x, mouse.y, mouse.radius, 0, 2 * Math.PI, false);
			context.closePath();
			context.fill();
			context.globalAlpha = 1;
		}
	}
	else if (globals.game.state == 2) {
		context.globalAlpha = 0.8;
		context.fillStyle = "#BBBBCC"
		context.fillRect(0, 225, globals.layout.game.width, 270);
		context.globalAlpha = 1.0;
		
		context.font = "50pt Impact";
		context.fillStyle = "#444488";
		
		var text = "Sorted!";
		context.fillText(text, (globals.layout.game.width - context.measureText(text).width) / 2, 300);
		
		text = "in " + Math.floor(globals.clock.game.time) + "s";
		context.fillText(text, (globals.layout.game.width - context.measureText(text).width) / 2, 360);

		context.fillStyle = mouse.overRegion[globals.layout.game.REPLAYLEVELBUTTONREGION] ? "#444488": "#E0E0F0";
		context.strokeStyle = "#444488";
		context.lineWidth = 3;
		roundRect(context, globals.layout.game.replayLevelButton.x, globals.layout.game.replayLevelButton.y, globals.layout.game.replayLevelButton.width, globals.layout.game.replayLevelButton.height, 10, true, true);
		context.font = "30pt Impact";
		context.fillStyle = mouse.overRegion[globals.layout.game.REPLAYLEVELBUTTONREGION] ? "#E0E0F0" : "#444488";
		text ="Replay level";
		context.fillText(text, globals.layout.game.replayLevelButton.x + (globals.layout.game.replayLevelButton.width - context.measureText(text).width) / 2, globals.layout.game.replayLevelButton.y + 40);

		context.fillStyle = mouse.overRegion[globals.layout.game.NEXTLEVELBUTTONREGION] ? "#444488": "#E0E0F0";
		context.strokeStyle = "#444488";
		context.lineWidth = 3;
		roundRect(context, globals.layout.game.nextLevelButton.x, globals.layout.game.nextLevelButton.y, globals.layout.game.nextLevelButton.width, globals.layout.game.nextLevelButton.height, 10, true, true);
		context.font = "30pt Impact";
		context.fillStyle = mouse.overRegion[globals.layout.game.NEXTLEVELBUTTONREGION] ? "#E0E0F0" : "#444488";
		text ="Next level";
		context.fillText(text, globals.layout.game.nextLevelButton.x + (globals.layout.game.nextLevelButton.width - context.measureText(text).width) / 2, globals.layout.game.nextLevelButton.y + 40);
		
	}

	
	context.restore();
}

function drawConvexHull(type) {
	var hull = globals.game.convexHulls[type];
	
	context.strokeStyle = colors[type];
	var milliseconds = globals.clock.game.time - Math.floor(globals.clock.game.time);
	
	context.globalAlpha = Math.floor(globals.clock.game.time) % 3 ? 0 : 0.25 * (1 + Math.cos((milliseconds + 0.5) * 2 * Math.PI));
	if (globals.game.state == 2) context.globalAlpha = 0.5;
	
	context.lineWidth = 4;
	context.beginPath();
	context.moveTo(hull[hull.length-1].x, hull[hull.length-1].y);
	for(var i = 0; i < hull.length; ++i) {
		context.lineTo(hull[i].x, hull[i].y);
	}
	context.closePath();
	context.stroke();
	context.globalAlpha = 1;
}

function drawEnclosingCircle(type) {
	var circle = globals.game.enclosingCircles[type];
	
	context.strokeStyle = colors[type];
	var milliseconds = globals.clock.game.time - Math.floor(globals.clock.game.time);
	
	//context.globalAlpha = ( Math.floor(globals.clock.game.time) % 3 ? 0 : 0.25 * (1 + Math.cos((milliseconds + 0.5) * 2 * Math.PI)));
	context.globalAlpha = Math.min(0.5, 2000 / Math.pow(circle.radius, 1.8))
	if (globals.game.state == 2) context.globalAlpha = 0.5;
	
	context.lineWidth = 4;
	context.beginPath();
	context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
	context.closePath();
	context.stroke();
	context.globalAlpha = 1;
	
}

function generateAnimFrame() {
	globals.clock.dt = (Date.now() - globals.clock.lastTick) / 1000;
	update(globals.clock.dt);
	
	draw();
	
	globals.clock.lastTick = Date.now();
	
	requestAnimFrame(generateAnimFrame);
}


