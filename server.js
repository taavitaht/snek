const express = require("express");
const path = require("path");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);
const port = 5000;

// Serve static files
app.use(express.static(__dirname));

// Serve index.html for all routes
app.get('/', (req, res) => {
	res.sendFile(__dirname, 'index.html');
});

let waitingTimer, startGameTimer, cells;
let gameStarted = false
let gameMap = []

io.on("connection", function (socket) {
	socket.on("newuser", function (username) {

		if (io.sockets.sockets.size <= 4) {
			if (startGameTimer || gameStarted) {
				socket.emit("connection-limit-reached", "Game Currently In Session");
				socket.disconnect(true);
			} else {
				const connectedSockets = io.sockets.sockets;
				socket.username = username
				socket.playerCount = findPlayerCount()
				userObj = { "username": socket.username, "count": socket.playerCount }
				socket.broadcast.emit("waiting", userObj);

				// Start with 2 or more players
				if (io.sockets.sockets.size >= 2 && !startGameTimer) {
					startGameCountdown();
				}

				connectedSockets.forEach(connected => {
					const previouslyJoinedSocket = { "username": connected.username, "count": connected.playerCount }
					socket.emit("join-lobby", previouslyJoinedSocket)
				});
				socket.broadcast.emit("update", username + " joined the lobby");
			}
		} else {
			socket.emit("connection-limit-reached", "Lobby is now full! Please Try Again Later");
			socket.disconnect(true);
		}
	});


	socket.on("generate-map", function (mapCells) {
		 gameMap.push(mapCells)
	});

	socket.on("player-movement", function (movingObj) {
		io.sockets.emit("player-moving", movingObj)
	});

	socket.on("drop-bomb", async function (movingObj) {
		io.sockets.emit("bomb-dropped", movingObj)
	});

	socket.on("update-cells", function (updatedCells) {
		cells = updatedCells
	});



	socket.on("player-killed", function (playerKilledObj) {
		io.sockets.emit("game-update", { "event": "player-killed", "playerKilled": playerKilledObj.playerKilled, "bomber": playerKilledObj.bomber })
		io.sockets.emit("player-death", playerKilledObj)
	})

	socket.on("cannot-drop-bomb", function (count) {
		socket.emit("game-update", { "event": "cannot-drop-bomb", "playerCount": count })
	})

	socket.on("game-over", function (aliveCount) {
		if (aliveCount.length == 1 && gameStarted) {
			// one player remaining
			io.sockets.emit("end-game", { "event": "winner", "playerNum": aliveCount[0].playerNum, "name": aliveCount[0].name })
		}
		if (aliveCount.length == 0 && gameStarted) {
			// draw no winner
			io.sockets.emit("end-game", { "event": "draw" })
		}
	})

	socket.on("disconnect", function (reason) {
		if (socket.username != undefined) {
			socket.broadcast.emit("update", socket.username + " has left the conversation")
		}
		// if the length of connections=1, that player wins, send out game over with winner
		if (io.sockets.sockets.size < 2 && waitingTimer) {
			stopCountdown();
		} else if (io.sockets.sockets.size < 2 && startGameTimer) {
			stopGameCountdown();
		}
		socket.broadcast.emit("remove-waiting-player", socket.playerCount)
		if (gameStarted && socket.playerCount != undefined) {
			socket.broadcast.emit("remove-player", socket.playerCount)
		}

		if (io.sockets.sockets.size == 0 && gameStarted) {
			gameStarted = false
		}
	})

	socket.on("start-game-button", function () {
		startGameCountdown();
	});
});

server.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});

// Game start timer
function startGameCountdown() {
	let countdown = 1;
	let allPlayers = []
	io.sockets.sockets.forEach(connected => {
		allPlayers.push({ "username": connected.username, "count": connected.playerCount })
	});
	function emitGameCountdown() {
		io.sockets.emit("start-game-countdown", countdown);

		if (countdown > 0) {
			countdown--;
			startGameTimer = setTimeout(emitGameCountdown, 1000);
		} else {
			startGameTimer = null;
			io.sockets.emit("start-game", { gameMap, allPlayers });
			gameStarted = true
		}
	}
	emitGameCountdown();
}



function findPlayerCount() {
	let smallestMissingValue = null;
	for (let n = 1; n <= 4; n++) {
		let found = false;

		for (let [id, socket] of io.sockets.sockets) {
			if (socket.playerCount === n) {
				found = true;
				break;
			}
		}

		if (!found) {
			smallestMissingValue = n;
			break;
		}
	}

	return smallestMissingValue;
}

