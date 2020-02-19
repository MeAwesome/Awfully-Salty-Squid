var express = require("express");
var app = express();
var serv = require("http").Server(app);
var port = process.env.PORT;

app.get("/", function(req, res){
	res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));

serv.listen(port || 2000);
console.log("--> Server started on - " + __ConnectTo__);

var SOCKET_LIST = {}, PLAYER_LIST = {}, HOST = null;

var io = require("socket.io")(serv,{});
io.on("connection", function(socket){
	if(Object.keys(SOCKET_LIST).length < 9){

	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	console.log("**A NEW CONNECTION WAS ESTABLISHED**\n		-->" + socket.request.connection.remoteAddress);

	socket.on("disconnect", function(){
		if(socket.id in PLAYER_LIST){
			if((PLAYER_LIST[socket.id].inlobby == true || PLAYER_LIST[socket.id].ingame == true) && HOST != null){
				SOCKET_LIST[HOST.id].emit("lostPlayerConnection", PLAYER_LIST[socket.id]);
			}
			console.log("**" + PLAYER_LIST[socket.id].name + " Disconnected From The Server**\n		-->" + PLAYER_LIST[socket.id].ip);
		} else if (HOST != null && socket.id == HOST.id){
			console.log("**HOST Disconnected From the Server**\n		-->" + HOST.ip);
			HOST = null;
			for(person in PLAYER_LIST){
				SOCKET_LIST[person].emit("hostQuit");
			}
		}
		delete PLAYER_LIST[socket.id];
		delete SOCKET_LIST[socket.id];
		//console.log(PLAYER_LIST);
	});

	socket.emit("setSocketInformation", {id:socket.id, ip:socket.request.connection.remoteAddress, inlobby:false, serveraddress:__ConnectTo__});

	socket.on("setPlayerInformation", function(data){
		PLAYER_LIST[socket.id] = data;
		//console.log(PLAYER_LIST);
	});

	socket.on("setHostInformation", function(data){
		HOST = data;
		//console.log(HOST);
	});

	socket.on("sendToHost", function(name, data){
		if(HOST != null){
			SOCKET_LIST[HOST.id].emit(name, data);
		}
	});

	socket.on("sendToClient", function(client, name, data){
		SOCKET_LIST[client].emit(name, data);
	});

	socket.on("sendToClients", function(name, data){
		for(person in PLAYER_LIST){
			SOCKET_LIST[person].emit(name, data);
		}
	});

	socket.on("retreiveHostInfo", function(name, data){
		if(HOST != null){
			SOCKET_LIST[HOST.id].emit("resendInformation", name, data);
		}
	});

	socket.on("retreivePlayerInfo", function(){
		for(person in PLAYER_LIST){
			if(PLAYER_LIST[person].inlobby && HOST != null){
				SOCKET_LIST[HOST.id].emit("playerJoinedLobby", PLAYER_LIST[person]);
			}
		}
	});

	socket.on("toSelectGameMode", function(){
		SOCKET_LIST[HOST.id].emit("selectGameMode");
		for(person in PLAYER_LIST){
			if(PLAYER_LIST[person].inlobby && (socket.id != person)){
				SOCKET_LIST[person].emit("selectGameMode");
			}
		}
	});

	socket.on("startGame", function(){
		for(person in SOCKET_LIST){
			SOCKET_LIST[person].emit("beginGame");
		}
	});

	}
});
