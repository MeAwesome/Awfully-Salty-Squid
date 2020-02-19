Loader.loadImage('blueSquid', '../client/assets/blueSquid.png');
Loader.loadImage('redSquid', '../client/assets/redSquid.png');
Loader.loadImage('greenSquid', '../client/assets/greenSquid.png');
Loader.loadImage('yellowSquid', '../client/assets/yellowSquid.png');
Loader.loadImage('orangeSquid', '../client/assets/orangeSquid.png');
Loader.loadImage('pinkSquid', '../client/assets/pinkSquid.png');
Loader.loadImage('purpleSquid', '../client/assets/purpleSquid.png');
Loader.loadImage('greySquid', '../client/assets/greySquid.png');
Loader.loadImage('leftarrowICO', '../client/assets/leftarrow.png');
Loader.loadImage('rightarrowICO', '../client/assets/rightarrow.png');
Loader.loadImage('soundICO', '../client/assets/sound.jpg');
Loader.loadImage('muteICO', '../client/assets/mute.png');
Loader.loadImage('exitICO', '../client/assets/exit.svg');
Loader.loadImage('warningICO', '../client/assets/warning.png');
var squidIconList = ["blueSquid", "redSquid", "greenSquid", "yellowSquid", "orangeSquid", "pinkSquid", "purpleSquid", "greySquid"];

var socket = io();
var player = new Player();

Canvas.init(document.getElementById("screen"), $(window).width(), $(window).height());
Touch.init(document.getElementById("screen"));
Input.init(document.getElementById("textinput"), 0, Canvas.height/3 + 75);
//Debugger.init();

function homeScreen(){
	Canvas.fill("blue");
	Canvas.text("Awfully Salty Squid", "center", 50, "white", 50, "title");
	Canvas.box("center", 86, 150, 225, "white");
	Canvas.box("center", 98.5, 125, 200, "blue");
	Canvas.image(Loader.getImage(player.attributes.icon), "center", 100);
	if(player.attributes.icon != "blueSquid"){
		Canvas.image(Loader.getImage("leftarrowICO"), Canvas.width/4 - 100, 100, 100, 200);
		Touch.add("previousSquidColor", Canvas.width/4 - 100, 100, 100, 200, 1);
	}
	if(player.attributes.icon != "greySquid"){
		Canvas.image(Loader.getImage("rightarrowICO"), Canvas.width * 3/4, 100, 100, 200);
		Touch.add("nextSquidColor", Canvas.width * 3/4, 100, 100, 200, 1);
	}
	Input.attributes("Squid Name", 13);
	Input.size(13);
	if(player.attributes.name != null){
		Input.set(player.attributes.name);
	}
	Input.display(true);
	Canvas.button("JOIN", "center", Canvas.height - 200, 200, 100, "white", "blue", 50, "button", "joinWaiting");
}

function previousSquidColor(){
	player.attributes.icon = squidIconList[squidIconList.indexOf(player.attributes.icon) - 1];
	socket.emit("setPlayerInformation", player.attributes);
	homeScreen();
}

function nextSquidColor(){
	player.attributes.icon = squidIconList[squidIconList.indexOf(player.attributes.icon) + 1];
	socket.emit("setPlayerInformation", player.attributes);
	homeScreen();
}

function waitingScreen(players){
	delete Touch.areas1["toSelectGameMode"];
	Canvas.fill("blue");
	Canvas.box(0, 0, Canvas.width, 100, "#1212ED");
	Canvas.text("Drag 2 fingers down for settings", "center", 60, "white", 25, "button");
	Touch.addDrag("settingsScreen", 0, 0, Canvas.width, 100);
	Canvas.image(Loader.getImage(player.attributes.icon), "center", "center");
	Canvas.text(player.attributes.name, "center", Canvas.height/2 + 120, "white", 30, "button");
	if(players == "host"){
		Canvas.text("Waiting for a host!", "center", Canvas.height - 50, "white", 25, "button");
	} else if(players == "ready"){
		Canvas.button("START", "center", Canvas.height - 150, 200, 100, "white", "blue", 30, "button", "toSelectGameMode");
	} else {
		Canvas.text("Waiting for " + players + " player(s)!", "center", Canvas.height - 50, "white", 25, "button");
	}
	if(player.attributes.insettings){
		settingsScreen();
	}
}

function toSelectGameMode(){
	socket.emit("toSelectGameMode");
	selectGameMode();
}

function selectGameMode(){
	Touch.areas1 = {};
	Touch.drag2 = {};
	Canvas.fill("black");
	Canvas.button("CLASSIC", "center", 150, 250, 150, "blue", "white", 40, "title", "classicMode");
	Canvas.button("MINIGAMES", "center", Canvas.height - 350, 250, 150, "purple", "white", 40, "title", "minigameMode");
	Canvas.text("{In Development}", "center", Canvas.height - 225, "white", 25, "button");
}

function classicMode(){
	socket.emit("sendToHost", "gameModeType", "Classic");
	modeChanges("blue", 3);
}

function minigameMode(){
	Canvas.button("CLASSIC", "center", 150, 250, 150, "blue", "white", 40, "title", "classicMode");
	//socket.emit("sendToHost", "gameModeType", "Minigame");
	//modeChanges("purple", 3);
}

function modeChanges(theme, rounds){
	Touch.areas1 = {};
	if(theme == "Classic"){
		theme = "blue";
	} else if(theme == "Minigame"){
		theme = "purple";
	}
	Canvas.fill(theme);
	Canvas.text("Rounds", "center", 100, "white", 100, "title");
	if(rounds > 3){
		Canvas.image(Loader.getImage("leftarrowICO"), Canvas.width/4 - 100, 109, 100, 200);
		Touch.add("lessRounds", Canvas.width/4 - 100, 109, 100, 200, 1);
	}
	Canvas.text(rounds, "center", 250, "white", 100, "title");
	if(rounds < 5){
		Canvas.image(Loader.getImage("rightarrowICO"), Canvas.width * 3/4, 109, 100, 200);
		Touch.add("moreRounds", Canvas.width * 3/4, 109, 100, 200, 1);
	}
	Canvas.button("BEGIN", "center", Canvas.height - 200, 250, 150, "white", theme, 40, "title", "beginGame");
}

function lessRounds(){
	socket.emit("sendToHost", "gameModeRounds", {client:player.attributes.id, amount:-1});
}

function moreRounds(){
	socket.emit("sendToHost", "gameModeRounds", {client:player.attributes.id, amount:1});
}

function beginGame(){
	socket.emit("startGame");
}

function settingsScreen(){
	Touch.areas1 = {};
	player.attributes.insettings = true;
	socket.emit("setPlayerInformation", player.attributes);
	Canvas.fill("grey", 0.5);
	Canvas.box(0, 0, Canvas.width, 200, "black");
	Canvas.button("", Canvas.width/4 - 50, 50, 100, 100, "white", "blue", 30, "button", "toggleSound");
	Canvas.image(Loader.getImage("muteICO"), Canvas.width/4 - 50, 50, 100, 100);
	Canvas.button("", Canvas.width * 3/4 - 50, 50, 100, 100, "red", "blue", 30, "button", "exitLobby");
	Canvas.image(Loader.getImage("exitICO"), Canvas.width * 3/4 - 50, 50, 100, 100);
	Touch.add("exitSettingsScreen", 0, 200, Canvas.width, Canvas.height - 200, 1);
}

function toggleSound(){

}

function exitLobby(){
	Touch.areas1 = {};
	player.attributes.insettings = false;
	player.attributes.inlobby = false;
	socket.emit("setPlayerInformation", player.attributes);
	socket.emit("sendToHost", "lostPlayerConnection", player.attributes);
	homeScreen();
}

function exitSettingsScreen(){
	Touch.areas1 = {};
	player.attributes.insettings = false;
	socket.emit("setPlayerInformation", player.attributes);
	socket.emit("retreiveHostInfo", "playersNeededToStart", "playersInLobby");
}

function joinWaiting(){
	if(Input.read() != null){
		delete Touch.areas1["previousSquidColor"];
		delete Touch.areas1["nextSquidColor"];
		Input.display(false);
		player.attributes.name = Input.read();
		player.attributes.name = player.attributes.name.trim();
		Input.set(player.attributes.name);
		player.attributes.inlobby = true;
		socket.emit("setPlayerInformation", player.attributes);
		socket.emit("sendToHost", "playerJoinedLobby", player.attributes);
		waitingScreen("host");
	} else {
		Canvas.button("JOIN", "center", Canvas.height - 200, 200, 100, "white", "blue", 50, "button", "joinWaiting");
	}
}

function roundInput(data, part){
	Canvas.fill("blue");
	var position = 0;
	for(id in data.players){
		if(data.players[id].id == player.attributes.id){
			Canvas.text(data.roundpackage[part][position], "center", 75, "white", 40, "button");
			player.attributes.question[part] = data.roundpackage[part][position];
		}
		position++;
	}
	socket.emit("setPlayerInformation", player.attributes);
	Input.clear();
	Input.attributes("Enter A Response", 75);
	Input.display(true);
	Canvas.button("SUBMIT", "center", Canvas.height - 200, 200, 100, "white", "blue", 50, "button", "submitAnswerText");
}

function submitAnswerText(){
	if(Input.read() != null){
		Canvas.fill("blue");
		Input.display(false);
		if(player.attributes.answer[0] == false){
			player.attributes.answer[0] = Input.read();
			player.attributes.answer[0] = player.attributes.answer[0].trim();
			Canvas.text("Waiting for Host", "center", "center", "white", 40, "title");
		} else {
			player.attributes.answer[1] = Input.read();
			player.attributes.answer[1] = player.attributes.answer[1].trim();
			roundWaitingScreen();
		}
		socket.emit("setPlayerInformation", player.attributes);
		socket.emit("sendToHost", "newAnswerSubmitted", player.attributes);
	} else {
		Canvas.button("SUBMIT", "center", Canvas.height - 200, 200, 100, "white", "blue", 50, "button", "submitAnswerText");
	}
}

function roundDraw(data, part){
	Canvas.fill("blue");
	var position = 0;
	for(id in data.players){
		if(data.players[id].id == player.attributes.id){
			Canvas.text(data.roundpackage[part][position], "center", 75, "white", 40, "button");
			player.attributes.question[part] = data.roundpackage[part][position];
		}
		position++;
	}
	socket.emit("setPlayerInformation", player.attributes);
	Canvas.button("SUBMIT", "center", Canvas.height - 200, 200, 100, "white", "blue", 50, "button", "submitAnswerText");
}

function roundWaitingScreen(){
	Canvas.fill("blue");
	Canvas.text("Hold On! Other players are finishing up!", "center", 75, "white", 40, "button");
	Canvas.image(Loader.getImage(player.attributes.icon), "center", "center");
}

function roundVotingAnswers(answers){
	Touch.areas1 = {};
	Input.display(false);
	Canvas.fill("blue");
	Canvas.button(answers.one, "center", 25, Canvas.width - 50, (Canvas.height/2) - 50, "white", "black", 40, "button", "chooseAnswerOne");
	Canvas.button(answers.two, "center", (Canvas.height/2) + 25, Canvas.width - 50, (Canvas.height/2) - 50, "white", "black", 40, "button", "chooseAnswerTwo");
}

function chooseAnswerOne(){
	socket.emit("sendToHost", "answerChoosen", 1);
	roundWaitingScreen();
}

function chooseAnswerTwo(){
	socket.emit("sendToHost", "answerChoosen", 2);
	roundWaitingScreen();
}

socket.on("setSocketInformation", function(data){
	player.attributes.id = data.id;
	player.attributes.ip = data.ip;
	player.attributes.inlobby = data.inlobby;
	socket.emit("setPlayerInformation", player.attributes);
	Canvas.text("LOADING...", "center", "center", "white", 50, "title");
	window.onload = setTimeout(function(){
		homeScreen();
	}, 1000);
});

socket.on("playersNeededToStart", function(data){
	if(player.attributes.inlobby){
		if(data < 2){
			waitingScreen(2 - data);
		} else {
			waitingScreen("ready");
		}
	}
});

socket.on("hostQuit", function(){
	if(player.attributes.inlobby){
		Touch.areas1 = {};
		Touch.drag2 = {};
		Input.display(false);
		player.attributes.resetData();
		player.attributes.inlobby = true;
		waitingScreen("host");
	} else if(player.attributes.ingame){
		Touch.areas1 = {};
		Touch.drag2 = {};
		Input.display(false);
		player.resetData();
		player.attributes.inlobby = true;
		if(data < 2){
			waitingScreen(2 - data);
		} else {
			waitingScreen("ready");
		}
		socket.emit("setPlayerInformation", player.attributes);
		socket.emit("sendToHost", "playerJoinedLobby", player.attributes);
	}
});

socket.on("selectGameMode", function(data){
	player.attributes.inlobby = false;
	player.attributes.insettings = false;
	player.attributes.ingame = true;
	socket.emit("setPlayerInformation", player.attributes);
	document.querySelector('meta[name="theme-color"]').setAttribute("content", "#000000");
	if(data != "hoster"){
		Touch.areas1 = {};
		Touch.drag2 = {};
		Canvas.fill("black");
	}
});

socket.on("roundChange", function(data){
	modeChanges(data.theme, data.rounds);
});

socket.on("beginGame", function(){
	Touch.areas1 = {};
	Canvas.fill("black");
	Canvas.circle("center", "center", 150, "blue");
	Canvas.image(Loader.getImage(player.attributes.icon), "center", "center");
	Canvas.text(player.attributes.points, "center", Canvas.height - 100, "white", 40, "title");
	player.attributes.answer = [false, false];
});

socket.on("roundExplanation", function(data){
	Canvas.fill("black");
	Canvas.text(data.roundtype, "center", "center", "white", 50, "title");
});

socket.on("roundStart", function(data){
	roundInput(data.pack, data.part);
});

socket.on("blankScreen", function(){
	Touch.areas1 = {};
	Input.display(false);
	Canvas.fill("blue");
});

socket.on("votingAnswers", function(data){
	roundVotingAnswers(data);
});

socket.on("pointChange", function(data){
	player.attributes.points += data.points;
});

socket.on("backToLobby", function(data){
	Touch.areas1 = {};
	Touch.drag2 = {};
	Input.display(false);
	player.resetData();
	player.attributes.inlobby = true;
	if(data < 2){
		waitingScreen(2 - data);
	} else {
		waitingScreen("ready");
	}
	socket.emit("setPlayerInformation", player.attributes);
	socket.emit("sendToHost", "playerJoinedLobby", player.attributes);
});

socket.on("disconnect", function(){
	Touch = {};
	Input.display(false);
	document.querySelector('meta[name="theme-color"]').setAttribute("content", "#FF0000");
	Canvas.fill("red");
	Canvas.image(Loader.getImage('warningICO'), "center", 100, 200, 200);
	Canvas.text("Connection Lost", "center", "center", "white", 40, "button");
	Canvas.text("Things To Try:", "center", Canvas.height/2 + 60, "white", 30, "button");
	Canvas.text("~Check Internet Connection", "center", Canvas.height/2 + 80, "white", 20, "button");
	Canvas.text("~Check If Server Is Running", "center", Canvas.height/2 + 100, "white", 20, "button");
	Canvas.text("~Refresh The Page", "center", Canvas.height/2 + 120, "white", 20, "button");
	socket.disconnect();
});