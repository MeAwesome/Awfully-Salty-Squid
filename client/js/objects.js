//ASSET LOADER
var Loader = {
    images: {}
};

Loader.loadImage = function (key, src) {
    var img = new Image();
	img.src = src;
	this.images[key] = img;
	img.onload = function(){
		console.log("Image '" + key + "' has loaded successfully");
	}
	img.onerror = function(){
		console.log("Error trying to load image '" + key + "' (" + src + ")");
	}
};

Loader.getImage = function (key) {
    return this.images[key];
};

var Files = {
	texts: {}
}

Files.loadFile = function(key, src){
	fetch('http://' + host.attributes.serveraddress + src)
		.then(response => response.text())
		.then((data) => {
		Files.texts[key] = data;
	});
}

Files.getFile = function(key){
	return this.texts[key];
}

//KEYBOARD HANDLING
var Keyboard = {};

Keyboard.LEFT = 37;
Keyboard.RIGHT = 39;
Keyboard.UP = 38;
Keyboard.DOWN = 40;
Keyboard.W = 87;
Keyboard.A = 65;
Keyboard.S = 83;
Keyboard.D = 68;
Keyboard.E = 69;
Keyboard.SPACE = 32;

Keyboard._keys = {};

Keyboard.init = function(keys){
    window.addEventListener('keydown', this._onKeyDown.bind(this));
    window.addEventListener('keyup', this._onKeyUp.bind(this));
	
    keys.forEach(function (key) {
        this._keys[key] = false;
    }.bind(this));
}

Keyboard._onKeyDown = function (event) {
    var keyCode = event.keyCode;
    if (keyCode in this._keys) {
        event.preventDefault();
        this._keys[keyCode] = true;
    }
};

Keyboard._onKeyUp = function (event) {
    var keyCode = event.keyCode;
    if (keyCode in this._keys) {
        event.preventDefault();
        this._keys[keyCode] = false;
    }
};

Keyboard.isDown = function (keyCode) {
    if (!keyCode in this._keys) {
        throw new Error('Keycode ' + keyCode + ' is not being listened to');
    }
    return this._keys[keyCode];
};

Keyboard.setFunction = function(funct, keyCode){
	this.thing = setInterval(function(){
		if(Keyboard.isDown(keyCode)){
			clearInterval(Keyboard.thing);
			eval(funct + "();");
		}
	}, 100);
}

Keyboard.stopListening = function(keys){
	keys.forEach(function(key){
		delete this._keys[key];
	}.bind(this));
}

//TOUCH HANDLER
var Touch = {};
Touch.areas1 = {};
Touch.areas2 = {};
Touch.drag2 = {};

Touch.init = function(surface){
	surface.addEventListener("touchstart", function(e){
		e.preventDefault();
		Touch._run(e);
		Touch._drag(e);
	}, false);
	surface.addEventListener("touchmove", function(e){
		e.preventDefault();
		Touch._run(e);
		Touch._drag(e);
	}, false);
	surface.addEventListener("touchend", function(e){
		e.preventDefault();
		Touch._run(e, true);
		Touch._drag(e, true);
	}, false);
	surface.addEventListener("touchcancel", function(e){
		e.preventDefault();
		Touch._run(e);
		Touch._drag(e, true);
	}, false);
}

Touch._run = function(e, ended){
	if(ended == undefined){
		if(e.touches.length == 1){
			for(funct in this.areas1){
				if(this.areas1[funct].type == "touch"){
					if((e.touches[0].clientX >= this.areas1[funct].x) && (e.touches[0].clientX <= this.areas1[funct].x + this.areas1[funct].width)){
						if((e.touches[0].clientY >= this.areas1[funct].y) && (e.touches[0].clientY <= this.areas1[funct].y + this.areas1[funct].height)){
							this.areas1[funct].active = true;
						} else {
							this.areas1[funct].active = false;
						}
					} else {
						this.areas1[funct].active = false;
					}
				}
			}
		} else if(e.touches.length == 2){
			for(funct in this.areas2){
				if(this.areas2[funct].type == "touch"){
					if((e.touches[0].clientX >= this.areas2[funct].x) && (e.touches[0].clientX <= this.areas2[funct].width) && (e.touches[1].clientX >= this.areas2[funct].x) && (e.touches[1].clientX <= this.areas2[funct].width)){
						if((e.touches[0].clientY >= this.areas2[funct].y) && (e.touches[0].clientY <= this.areas2[funct].height) && (e.touches[1].clientY >= this.areas2[funct].y) && (e.touches[1].clientY <= this.areas2[funct].height)){
							this.areas2[funct].active = true;
						} else {
							this.areas2[funct].active = false;
						}
					} else {
						this.areas2[funct].active = false;
					}
				}
			}
		}
	} else {
		for(funct in this.areas1){
			if(this.areas1[funct] && this.areas1[funct].active){
				delete this.areas1[funct];
				eval(funct + "();");
			}
		}
		for(funct in this.areas2){
			if(this.areas2[funct] && this.areas2[funct].active){
				delete this.areas2[funct];
				eval(funct + "();");
			}
		}
	}
}

Touch._drag = function(e, ended){
	if(ended){
		for(funct in this.drag2){
			this.drag2[funct].inbounds = false;
		}
	}
	if(e.touches.length == 2){
		for(funct in this.drag2){
			if(this.drag2[funct].type == "drag"){
				if((e.touches[0].clientX >= this.drag2[funct].x) && (e.touches[0].clientX <= this.drag2[funct].width) && (e.touches[1].clientX >= this.drag2[funct].x) && (e.touches[1].clientX <= this.drag2[funct].width)){
					if((e.touches[0].clientY >= this.drag2[funct].y) && (e.touches[0].clientY <= this.drag2[funct].height) && (e.touches[1].clientY >= this.drag2[funct].y) && (e.touches[1].clientY <= this.drag2[funct].height)){
						this.drag2[funct].inbounds = true;
					} else {
						if(this.drag2[funct].inbounds == true){
							delete this.drag2[funct];
							eval(funct + "();");
						}
					}
				} else {
					this.drag2[funct].inbounds = false;
				}
			}
		}
	}
}

Touch.add = function(funct, x, y, width, height, fingers){
	if(fingers == 1){
		this.areas1[funct] = {
			x:x,
			y:y,
			width:width,
			height:height,
			type:"touch",
			active:false
		};
	} else if(fingers == 2){
		this.areas2[funct] = {
			x:x,
			y:y,
			width:width,
			height:height,
			type:"touch",
			active:false
		};
	}
}

Touch.addDrag = function(funct, x, y, width, height){
	this.drag2[funct] = {
		x:x,
		y:y,
		width:width,
		height:height,
		inbounds:false,
		type:"drag"
	};
}

//TEXT INPUT
var Input = {
	text:null
};

Input.init = function(input, x, y){
	this.field = input;
	if(x == "center"){
		this.field.style.left = Canvas.width/2 - 25 + "px";
	} else {
		this.field.style.left = x + "px";
	}
	if(y == "center"){
		this.field.style.top = Canvas.height/2 - 25 + "px";
	} else {
		this.field.style.top = y + "px";
	}
	this.field.style.width = window.innerWidth;
	this.field.onfocus = function(){
		window.scrollTo(0, 0);
		document.body.scrollTop = 0;
	}
	this.field.onblur = function(){
		window.scrollTo(0, 0);
		document.body.scrollTop = 0;
	}
	window.onresize = function(){
		window.scrollTo(0, 0);
		document.body.scrollTop = 0;
	}
}

Input._crop = function(){
	window.scrollTo(0, 0);
	document.body.scrollTop = 0;
	if(Input.field.value.length > Input.field.maxLength){
		Input.field.value = Input.field.value.slice(0, Input.field.maxLength);
	}
}

Input.display = function(type){
	if(type == true){
		this.field.style.display = "block";
	} else if(type == false){
		this.field.style.display = "none";
	} else {
		this.field.style.display = type;
	}
}

Input.size = function(width){
	this.field.size = width;
}

Input.attributes = function(placeholder, maxlength){
	if(typeof placeholder == "string"){
		this.field.placeholder = placeholder;
	} else {
		this.field.maxLength = placeholder;
		this.field.addEventListener('input', this._crop);
	}
	if(maxlength != undefined){
		this.field.maxLength = maxlength;
		this.field.addEventListener('input', this._crop);
	}
	if(maxlength == "none"){
		 this.field.removeAttribute('maxLength');
		 this.field.removeEventListener('input', this._crop);
	}
}

Input.read = function(){
	if(this.field.value.length > 0){
		this.text = this.field.value;
	} else {
		this.text = null;
	}
	return this.text;
}

Input.set = function(text){
	this.field.value = text;
	this.text = text;
}

Input.clear = function(){
	this.field.value = "";
	this.text = null;
}

//CANVAS CONTROLLER
var Canvas = {};
Canvas.colors = {
	"blue":"#0000FF",
	"lightblue":"#00FFFF",
	"white":"#FFFFFF",
	"black":"#000000",
	"grey":"#222222",
	"red":"#FF0000",
	"purple":"#8B008B"
};
Canvas.fonts = {
	"title":"Pattaya",
	"button":"Impact"
};

Canvas.init = function(canvas, width, height){
	this.canvas = canvas;
	this.context = canvas.getContext("2d");
	this.width = width;
	this.height = height;
	canvas.width = width;
	canvas.height = height;
}

Canvas.fill = function(color, transparency){
	var oldColor = this.context.fillStyle;
	var oldAlpha = this.context.globalAlpha;
	if(transparency != undefined){
		this.context.globalAlpha = transparency;
	}
	if(color in this.colors){
		this.context.fillStyle = this.colors[color];
	} else {
		this.context.fillStyle = color;
	}
	this.context.fillRect(0, 0, this.width, this.height);
	this.context.fillStyle = oldColor;
	this.context.globalAlpha = oldAlpha;
}

Canvas.box = function(x, y, width, height, color){
	var oldColor = this.context.fillStyle;
	if(x == "center"){
		x = this.canvas.width/2 - width/2;
	}
	if(y == "center"){
		y = this.canvas.height/2 - height/2;
	}
	if(color == undefined){
		color = "black";
	}
	if(color in this.colors){
		this.context.fillStyle = this.colors[color];
	} else {
		this.context.fillStyle = color;
	}
	this.context.fillRect(x, y, width, height);
	this.context.fillStyle = oldColor;
}

Canvas.circle = function(x, y, radius, color){
	var oldColor = this.context.fillStyle;
	if(x == "center"){
		x = this.canvas.width/2;
	}
	if(y == "center"){
		y = this.canvas.height/2;
	}
	if(radius == undefined){
		radius = 10;
	}
	if(color == undefined){
		color = "black";
	}
	this.context.fillStyle = color;
	this.context.beginPath();
	this.context.arc(x, y, radius, 0, 2 * Math.PI);
	this.context.fill();
	this.context.fillStyle = oldColor;
}

Canvas.text = function(text, x, y, color, size, font, maxwidth, centeredX, centeredY){
	var oldFont = this.context.font;
	var oldColor = this.context.fillStyle;
	var oldAlign = this.context.textAlign;
	var oldBase = this.context.textBaseline;
	if(maxwidth == undefined || maxwidth == "none"){
		maxwidth = this.width;
	}
	if(centeredX == undefined){
		centeredX = false;
	}
	if(centeredY == undefined){
		centeredY = false;
	}
	if(x == "center"){
		this.context.textAlign = "center";
		x = this.canvas.width/2;
	} else if(centeredX != false){
		this.context.textAlign = "center";
		//x = x/2;
	}
	if(y == "center"){
		this.context.textBaseline = "middle";
		y = this.canvas.height/2;
	} else if(centeredY != false){
		this.context.textBaseline = "middle";
		//y = y/2;
	}
	if(size == undefined){
		size = 20;
	}
	if(font != undefined){
		if(font in this.fonts){
			this.context.font = size + "px " + this.fonts[font];
		} else {
			this.context.font = font;
		}
	} else {
		this.context.font = oldFont;
	}
	if(color != undefined){
		if(color in this.colors){
			this.context.fillStyle = this.colors[color];
		} else {
			this.context.fillStyle = color;
		}
	} else {
		this.context.fillStyle = oldColor;
	}
	if(isNaN(text) && text.indexOf(" ") >= 0){
		var lines = text.split(" ");
		var layout = [];
		var line = "";
		for(var i = 0; i<lines.length; i++){
			if((this.context.measureText(line).width <= maxwidth) && (this.context.measureText(line + " " + lines[i]).width <= maxwidth)){
				if(line != ""){
					line += (" " + lines[i]);
				} else {
					line += lines[i];
				}
			} else {
				layout.push(line);
				line = lines[i];
			}
		}
		layout.push(line);
		if(centeredY != false){
			y = y - ((layout.length - 1) * (size/2));
		}
		for (var i = 0; i < layout.length; i++){
			this.context.fillText(layout[i], x, y);
			y += size;
		}
	} else {
		this.context.fillText(text, x, y);
	}
	this.context.font = oldFont;
	this.context.fillStyle = oldColor;
	this.context.textAlign = oldAlign;
	this.context.textBaseline = oldBase;
}

Canvas.button = function(text, x, y, width, height, colorButton, colorText, size, font, funct){
	this.box(x, y, width, height, colorButton);
	var oldFont = this.context.font;
	var oldColor = this.context.fillStyle;
	var oldAlign = this.context.textAlign;
	var oldBase = this.context.textBaseline;
	if(x == "center"){
		x = this.canvas.width/2 - width/2;
	}
	if(y == "center"){
		y = this.canvas.height/2 - height/2;
	}
	var touchpoints = [x, y, width, height];
	this.context.textAlign = "center";
	x = x + width/2;
	this.context.textBaseline = "middle";
	y = y + height/2;
	if(size == undefined){
		size = 20;
	}
	if(font != undefined){
		if(font in this.fonts){
			this.context.font = size + "px " + this.fonts[font];
		} else {
			this.context.font = font;
		}
	} else {
		this.context.font = oldFont;
	}
	if(colorText != undefined){
		if(colorText in this.colors){
			this.context.fillStyle = this.colors[colorText];
		} else {
			this.context.fillStyle = colorText;
		}
	} else {
		this.context.fillStyle = oldColor;
	}
	this.text(text, x, y, colorText, size, font, width, "center", "center");
	this.context.font = oldFont;
	this.context.fillStyle = oldColor;
	this.context.textAlign = oldAlign;
	this.context.textBaseline = oldBase;
	Touch.add(funct, touchpoints[0], touchpoints[1], touchpoints[2], touchpoints[3], 1);
}

Canvas.image = function(image, x, y, width, height){
	if(width == undefined){
		width = image.width;
	}
	if(height == undefined){
		height = image.height;
	}
	if(x == "center"){
		x = this.canvas.width/2 - width/2;
	}
	if(y == "center"){
		y = this.canvas.height/2 - height/2;
	}
	this.context.drawImage(image, x, y, width, height);
}

//DEBUG
var Debugger = {};

Debugger.init = function(){
	setInterval(function(){
		Canvas.context.moveTo(Canvas.canvas.width/2, 0);
		Canvas.context.lineTo(Canvas.canvas.width/2, Canvas.canvas.height);
		Canvas.context.stroke();
		Canvas.context.moveTo(0, Canvas.canvas.height/2);
		Canvas.context.lineTo(Canvas.canvas.width, Canvas.canvas.height/2);
		Canvas.context.stroke();
	}, 100);
}

//Randomizer
Array.prototype.pickValue = function(){
  return this[Math.floor(Math.random()*this.length)];
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

var alreadyChoosen = [];
function generatePrompts(type){
	var questions, chosen = [[],[]], prev;
	if(type == "Response"){
		questions = Files.getFile("responseQs").split("\n");
	} else if(type == "Draw"){
		questions = Files.getFile("drawQs").split("\n");
	} else if(type == "Blank"){
		questions = Files.getFile("blankQs").split("\n");
	}
	for(var i = 0;i<Object.keys(host.attributes.players).length;i++){
		var q = questions.pickValue();
		if(!chosen[0].includes(q) && !alreadyChoosen.includes(q)){
			chosen[0].push(q);
			chosen[1].push(q);
			alreadyChoosen.push(q);
		} else {
			i--;
		}
	}
	shuffle(chosen[1]);
	for(var i = 0;i<chosen[0].length;i++){
		if(chosen[0][i] == chosen[1][i]){
			shuffle(chosen[1]);
			i = -1;
		}
	}
	return chosen;
}

//Sorting
function objectSortBy(object, property){
	var sortable = [];
	for(obj in object){
		sortable.push([obj, eval("object[obj]." + property)]);
	}
	sortable.sort(function(a, b){
		return a[1] - b[1];
	});
	return sortable;
}

//Speech
var announcement = false;
var nextFunction = null;
function volume_switcher(){
	if(responsiveVoice.isPlaying()){
		document.getElementById("sound").volume = 0.1;
		return true;
	} else {
		document.getElementById("sound").volume = 1.0;
		announcement = false;
		return false;
	}
}

function talk(message){
	announcement = true;
	responsiveVoice.speak(message, "UK English Male", {onstart:volume_switcher,onend:volume_switcher});
}

function afterdone(funct, data) {
    if(!announcement){
		if(data == undefined){
			eval(funct + "();");
		} else {
			eval(funct + "(" + data + ");");
		}
		nextFunction = null;
    } else {
		nextFunction = window.setTimeout(function(){
			afterdone(funct, data);
		}, 100);
    }
}

//PLAYER CREATION
class Player{
	constructor(){
		this.attributes = {
			name:null,
			icon:"blueSquid",
			points:0,
			answer:[false, false],
			id:null,
			ip:null,
			inlobby:false,
			insettings:false,
			ingame:false,
			question:[false, false]
		}
	}
	resetData(){
		this.attributes.points = 0;
		this.attributes.answer = [false, false];
		this.attributes.inlobby = false;
		this.attributes.insettings = false;
		this.attributes.ingame = false;
		this.attributes.question = [false, false];
	}
}

//HOST CREATION
class Host{
	constructor(){
		this.attributes = {
			ip:null,
			id:null,
			serveraddress:null,
			players:{},
			playersInLobby:0,
			inFullscreen:false,
			gamemode:null,
			rounds:3,
			allowbonus:false,
			currentround:1,
			roundtype:null,
			timeleft:null,
			roundpackage:null,
			votes:[0, 0],
			roundlevel:0,
			ingame:false
		}
	}
	resetData(){
		this.attributes.players = {};
		this.attributes.playersInLobby = 0;
		this.attributes.gamemode = null;
		this.attributes.rounds = 3;
		this.attributes.allowbonus = false;
		this.attributes.currentround = 1;
		this.attributes.roundtype = null;
		this.attributes.timeleft = null;
		this.attributes.roundpackage = null;
		this.attributes.votes = [0, 0];
		this.attributes.roundlevel = 0;
		this.attributes.ingame = false;
		clearTimeout(nextFunction);
		nextFunction = null;
		alreadyChoosen = [];
	}
}