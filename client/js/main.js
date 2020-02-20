Loader.loadImage('blueSquid', '../client/assets/blueSquid.png');
Loader.loadImage('redSquid', '../client/assets/redSquid.png');
Loader.loadImage('greenSquid', '../client/assets/greenSquid.png');
Loader.loadImage('yellowSquid', '../client/assets/yellowSquid.png');
Loader.loadImage('orangeSquid', '../client/assets/orangeSquid.png');
Loader.loadImage('pinkSquid', '../client/assets/pinkSquid.png');
Loader.loadImage('purpleSquid', '../client/assets/purpleSquid.png');
Loader.loadImage('greySquid', '../client/assets/greySquid.png');
Loader.loadImage('warningICO', '../client/assets/warning.png');

var socket = io();
var host = new Host();

Canvas.init(document.getElementById("screen"), $(window).width(), $(window).height());
Keyboard.init([Keyboard.SPACE]);
//Debugger.init();

function initialStart(){
	var elem = document.documentElement;
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.mozRequestFullScreen) { /* Firefox */
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) { /* IE/Edge */
		elem.msRequestFullscreen();
	}
	setTimeout(function(){
		Canvas.init(document.getElementById("screen"), $(window).width(), $(window).height());
		homeScreen();
		host.attributes.inFullscreen = true;
	}, 300);
}

function titleScreen(){
	Files.loadFile('responseQs', '/client/assets/responseQs.txt');
	Files.loadFile('drawQs', '/client/assets/drawQs.txt');
	Files.loadFile('blankQs', '/client/assets/blankQs.txt');
	Canvas.fill("blue");
	Canvas.text("Awfully Salty Squid", "center", 100, "white", 100, "title");
	Canvas.image(Loader.getImage("blueSquid"), "center", "center");
	Canvas.text("Press Space", "center", Canvas.height - 100, "white", 40, "title");
	Keyboard.setFunction("initialStart", Keyboard.SPACE);
	document.getElementById("sound").play();
}

function homeScreen(){
	Canvas.fill("blue");
	Canvas.text("Awfully Salty Squid", "center", 100, "white", 100, "title");
	Canvas.image(Loader.getImage("blueSquid"), Canvas.width/4 - 45.5, "center");
	Canvas.box(Canvas.width/2, "center", Canvas.width/2, 400, "white");
	Canvas.text("Connect To:", "center", Canvas.height - 100, "black", 40, "button");
	Canvas.text(host.attributes.serveraddress, "center", Canvas.height - 50, "white", 40, "button");
	var counter = 0;
	for(player in host.attributes.players){
		Canvas.image(Loader.getImage(host.attributes.players[player].icon), Canvas.width/2 + 5, 160 + counter, 20, 30);
		Canvas.text(host.attributes.players[player].name, Canvas.width/2 + 30, 185 + counter, "black", 30, "button");
		counter = counter + 40;
	}
}

function selectGameMode(){
	Canvas.fill("black");
	Canvas.text("Select A Game Mode", "center", "center", "white", 40, "title");
}

function gameStartScreen(){
	host.attributes.ingame = true;
	Canvas.fill("black");
	Canvas.circle("center", "center", 150, "blue");
	Canvas.image(Loader.getImage("blueSquid"), "center", "center");
	var message = ["Welcome to Awfully Salty Squid! Let's start, shall we?", "Welcome to Awfully Salty Squid! Let's begin with round one."].pickValue();
	talk(message);
	afterdone("roundExplanationScreen");
}

function roundExplanationScreen(){
	document.getElementById("sound").volume = 0.1;
	host.attributes.roundtype = ["Response", "Blank"].pickValue();	//"Draw"
	socket.emit("setHostInformation", host.attributes);
	socket.emit("sendToClients", "roundExplanation", host.attributes);
	Canvas.fill("black");
	Canvas.text("Round " + host.attributes.currentround, "center", 150, "white", 100, "title");
	Canvas.text(host.attributes.roundtype, "center", Canvas.height - 100, "white", 70, "button");
	if(host.attributes.roundtype == "Response"){
		talk("For round " + host.attributes.currentround + ", a prompt will be shown on your device. Answer it the best you can to gain points from other players. Or don't. It's up to you.");
	} else if(host.attributes.roundtype == "Draw"){
		talk("For round " + host.attributes.currentround + ", a phrase will be given to your device. Just try to draw it the best you can.");
	} else if(host.attributes.roundtype == "Blank"){
		talk("For round " + host.attributes.currentround + ", a sentence will show up on your device with a blank space in it. Do what you want with it.");
	}
	var pack = generatePrompts(host.attributes.roundtype);
	host.attributes.roundpackage = pack;
	var position = 0;
	for(id in host.attributes.players){
		host.attributes.players[id].question = [host.attributes.roundpackage[0][position], host.attributes.roundpackage[1][position]];
		position++;
	}
	host.attributes.timeleft = 60;
	document.getElementById("waiting").currentTime = 0;
	afterdone("timerScreen");
}

function timerScreen(){
	if(socket != false && host.attributes.ingame){
		document.getElementById("sound").pause();
		document.getElementById("waiting").play();
		if(host.attributes.timeleft == 60){
			socket.emit("sendToClients", "roundStart", {pack:host.attributes, part:0});
		}
		Canvas.fill("blue");
		if(host.attributes.timeleft < 1){
			document.getElementById("waiting").pause();
			socket.emit("sendToClients", "blankScreen");
			talk("Time is up! Let's see what you came up with");
			afterdone("votingScreen");
		} else {
			Canvas.text(host.attributes.timeleft, "center", "center", "white", 300, "title");
			setTimeout(function(){
				host.attributes.timeleft--;
				timerScreen();
			}, 1000);
		}
	} else {
		document.getElementById("waiting").pause();
	}
}

function smallerTimer(people){
	if(socket != false && host.attributes.ingame){
		Canvas.box("center", 350, 200, 200, "blue");
		if(host.attributes.timeleft < 1){
			document.getElementById("voting").pause();
			socket.emit("sendToClients", "blankScreen");
			socket.emit("sendToClient", host.attributes.players[people[0]].id, "pointChange", {points:host.attributes.votes[0]});
			host.attributes.players[people[0]].points += host.attributes.votes[0];
			socket.emit("sendToClient", host.attributes.players[people[1]].id, "pointChange", {points:host.attributes.votes[1]});
			Canvas.text(host.attributes.players[people[0]].name, 300, 650, "black", 40, "button", 400, "center");
			Canvas.text(host.attributes.players[people[1]].name, Canvas.width - 300, 650, "black", 40, "button", 400, "center");
			host.attributes.players[people[1]].points += host.attributes.votes[1];
			var winner = 2;
			if(host.attributes.votes[0] > host.attributes.votes[1]){
				winner = 0
			} else if(host.attributes.votes[1] > host.attributes.votes[0]){
				winner = 1;
			}
			if(winner != 2){
				talk("And the winner is " + host.attributes.players[people[winner]].name + " with " + host.attributes.votes[winner] + " points!");
			} else {
				talk("There is a tie between " + host.attributes.players[people[0]].name + " and " + host.attributes.players[people[1]].name + " with a score of " + host.attributes.votes[0] + "!");
			}
			host.attributes.roundlevel++;
			host.attributes.votes = [0, 0];
			if(host.attributes.roundlevel == host.attributes.roundpackage[0].length){
				afterdone("roundEndScreen");
			} else {
				afterdone("votingScreen", host.attributes.roundlevel);
			}
		} else {
			Canvas.text(host.attributes.timeleft, "center", 500, "white", 125, "title");
			setTimeout(function(){
				host.attributes.timeleft--;
				smallerTimer(people);
			}, 1000);
		}
	} else {
		document.getElementById("voting").pause();
	}
}

function showVotingAnswers(num){
	document.getElementById("voting").currentTime = 0;
	document.getElementById("voting").play();
	var alreadyChosen;
	var pack = [];
	var people = [];
	Canvas.box(100, 300, 400, 300, "white");
	for(id in host.attributes.players){
		if(host.attributes.players[id].question.indexOf(host.attributes.roundpackage[0][num]) >=0){
			alreadyChosen = id;
			if(host.attributes.players[id].answer[host.attributes.players[id].question.indexOf(host.attributes.roundpackage[0][num])] == false){
				host.attributes.players[id].answer[host.attributes.players[id].question.indexOf(host.attributes.roundpackage[0][num])] = "[NO ANSWER]";
			}
			Canvas.text(host.attributes.players[id].answer[host.attributes.players[id].question.indexOf(host.attributes.roundpackage[0][num])], 300, 450, "black", 40, "button", 400, "center", "center");
			pack.push(host.attributes.players[id].answer[host.attributes.players[id].question.indexOf(host.attributes.roundpackage[0][num])]);
			people.push(id);
			break;
		}
	}
	Canvas.box(Canvas.width - 500, 300, 400, 300, "white");
	for(id in host.attributes.players){
		if(host.attributes.players[id].question.indexOf(host.attributes.roundpackage[0][num]) >=0 && host.attributes.players[id].id != alreadyChosen){
			if(host.attributes.players[id].answer[host.attributes.players[id].question.indexOf(host.attributes.roundpackage[0][num])] == false){
				host.attributes.players[id].answer[host.attributes.players[id].question.indexOf(host.attributes.roundpackage[0][num])] = "[NO ANSWER]";
			}
			Canvas.text(host.attributes.players[id].answer[host.attributes.players[id].question.indexOf(host.attributes.roundpackage[0][num])], Canvas.width - 300, 450, "black", 40, "button", 400, "center", "center");
			pack.push(host.attributes.players[id].answer[host.attributes.players[id].question.indexOf(host.attributes.roundpackage[0][num])]);
			people.push(id);
			break;
		}
	}
	socket.emit("sendToClients", "votingAnswers", {one:pack[0],two:pack[1]});
	host.attributes.timeleft = 15;
	smallerTimer(people);
}

function votingScreen(num){
	if(num == undefined){
		num = 0;
	}
	Canvas.fill("blue");
	Canvas.text(host.attributes.roundpackage[0][num], "center", 75, "white", 50, "button");
	if(host.attributes.roundtype == "Response"){
		talk(host.attributes.roundpackage[0][num]);
	} else if(host.attributes.roundtype == "Blank"){
		talk(host.attributes.roundpackage[0][num].split("___")[0] + " BLANK " + host.attributes.roundpackage[0][num].split("___")[1]);
	}
	afterdone("showVotingAnswers", num);
}

function roundEndScreen(){
	socket.emit("sendToClients", "beginGame");
	Canvas.fill("black");
	var y = 75;
	var highest = objectSortBy(host.attributes.players, "points");
	var peopleInFirst = 1;
	for(var i = highest.length - 1;i>=0;i--){
		Canvas.text(host.attributes.players[highest[i][0]].name, 300, y, "white", 50, "button", "none", "center");
		Canvas.text(highest[i][1], Canvas.width - 300, y, "white", 50, "button", "none", "center");
		y += 60;
		if(highest[i][1] == highest[highest.length - 1][1] && highest[i][0] != highest[highest.length - 1][0]){
			peopleInFirst++;
		}
	}
	if(host.attributes.currentround == host.attributes.rounds){
		document.getElementById("victory").currentTime = 0;
		document.getElementById("victory").play();
		host.attributes.currentround = 1;
		if(peopleInFirst == 1){
			talk("Here are the final results for the game! Congrats to " + host.attributes.players[highest[highest.length - 1][0]].name + " for winning the game! Sending you back to the lobby now! Thanks for playing!");
		} else {
			talk("Here are the final results for the game! Congrats to our " + peopleInFirst + " winners! Sending you back to the lobby now! Thanks for playing!");
		}
		afterdone("backToLobby");
	} else {
		document.getElementById("sound").currentTime = 0;
		document.getElementById("sound").play();
		if(peopleInFirst == 1){
			talk("Here are the results at the end of round " + host.attributes.currentround + ". Right now, " + host.attributes.players[highest[highest.length - 1][0]].name + " is in the lead!");
		} else {
			talk("Here are the results at the end of round " + host.attributes.currentround + ". There are currently " + peopleInFirst + " players in first place!");
		}
		host.attributes.currentround++;
		host.attributes.roundlevel = 0;
		for(id in host.attributes.players){
			host.attributes.players[id].answer = [false, false];
		}
		afterdone("roundExplanationScreen");
	}
}

function backToLobby(){
	document.getElementById("waiting").pause();
	document.getElementById("voting").pause();
	document.getElementById("victory").pause();
	document.getElementById("sound").currentTime = 0;
	document.getElementById("sound").play();
	host.resetData();
	socket.emit("sendToClients", "backToLobby", host.attributes.playersInLobby);
	homeScreen();
}

socket.on("setSocketInformation", function(data){
	host.attributes.id = data.id;
	host.attributes.ip = data.ip;
	host.attributes.serveraddress = data.serveraddress;
	host.attributes.inFullscreen = false;
	socket.emit("setHostInformation", host.attributes);
	socket.emit("retreivePlayerInfo");
	Canvas.text("LOADING...", "center", "center", "white", 40, "title");
	window.onload = setTimeout(function(){
		titleScreen();
	}, 1000);
});

socket.on("playerJoinedLobby", function(data){
	host.attributes.playersInLobby++;
	host.attributes.players[data.id] = data;
	socket.emit("setHostInformation", host.attributes);
	socket.emit("sendToClients", "playersNeededToStart", host.attributes.playersInLobby);
	if(host.attributes.inFullscreen){
		homeScreen();
	}
});

socket.on("lostPlayerConnection", function(data){
	host.attributes.playersInLobby--;
	host.attributes.timeleft = 0;
	delete host.attributes.players[data.id];
	if(host.attributes.playersInLobby < 0){
		host.attributes.playersInLobby = 0;
	}
	socket.emit("setHostInformation", host.attributes);
	socket.emit("sendToClients", "playersNeededToStart", host.attributes.playersInLobby);
	if(host.attributes.ingame){
		host.resetData();
		socket.emit("sendToClients", "backToLobby", host.attributes.playersInLobby);
		document.getElementById("victory").pause();
		document.getElementById("sound").currentTime = 0;
		document.getElementById("sound").play();
		talk("A player disconnected during the game. Game has been ended.");
	}
	if(host.attributes.inFullscreen){
		homeScreen();
	}
});

socket.on("resendInformation", function(name, data){
	socket.emit("sendToClients", name, host.attributes[data]);
});

socket.on("selectGameMode", function(){
	selectGameMode();
});

socket.on("gameModeType", function(data){
	host.attributes.gamemode = data;
	socket.emit("setHostInformation", host.attributes);
	Canvas.fill("black");
	Canvas.text(data, "center", 150, "white", 100, "title");
	Canvas.circle("center", "center", 150, "blue");
	Canvas.text(host.attributes.rounds, "center", "center", "white", 150, "title");
});

socket.on("gameModeRounds", function(data){
	host.attributes.rounds = host.attributes.rounds + data.amount;
	socket.emit("setHostInformation", host.attributes);
	socket.emit("sendToClient", data.client, "roundChange", {theme:host.attributes.gamemode, rounds:host.attributes.rounds});
	Canvas.fill("black");
	Canvas.text(host.attributes.gamemode, "center", 150, "white", 100, "title");
	Canvas.circle("center", "center", 150, "blue");
	Canvas.text(host.attributes.rounds, "center", "center", "white", 150, "title");
});

socket.on("beginGame", function(){
	gameStartScreen();
});

socket.on("newAnswerSubmitted", function(data){
	host.attributes.players[data.id].answer = data.answer;
	//host.attributes.players[data.id].question = data.question;
	socket.emit("setHostInformation", host.attributes);
	if(host.attributes.players[data.id].answer[1] == false){
		socket.emit("sendToClient", data.id, "roundStart", {pack:host.attributes, part:1});
	}
	var counter = 0;
	for(player in host.attributes.players){
		if(host.attributes.players[player].answer[1] != false){
			counter++;
		}
	}
	if(counter == Object.keys(host.attributes.players).length){
		host.attributes.timeleft = 0;
	}
});

socket.on("answerChoosen", function(data){
	host.attributes.votes[data - 1]++;
	if(host.attributes.votes[0] + host.attributes.votes[1] == Object.keys(host.attributes.players).length){
		host.attributes.timeleft = 0;
	}
});

socket.on("disconnect", function(){
	clearInterval(Keyboard.thing);
	Keyboard = {};
	document.querySelector('meta[name="theme-color"]').setAttribute("content", "#FF0000");
	Canvas.fill("red");
	Canvas.image(Loader.getImage('warningICO'), "center", 100, 200, 200);
	Canvas.text("Connection Lost", "center", "center", "white", 40, "button");
	Canvas.text("Things To Try:", "center", Canvas.height/2 + 60, "white", 30, "button");
	Canvas.text("~Check Internet Connection", "center", Canvas.height/2 + 80, "white", 20, "button");
	Canvas.text("~Check If Server Is Running", "center", Canvas.height/2 + 100, "white", 20, "button");
	Canvas.text("~Refresh The Page", "center", Canvas.height/2 + 120, "white", 20, "button");
	socket.disconnect();
	socket = false;
});
