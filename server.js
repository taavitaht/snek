import express from "express";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { Snake } from "./components/players.js";
import { placeFood, foodArray } from "./components/food.js";
import { globalSettings } from "./misc/gameSettings.js";

// Create an express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 5000;

// Game state variables
let serverSnakes = {}; // Object holding all snakes
let playerKeypresses = {};
let gameInterval;
//let tickInterval = 500; // Time between game ticks in milliseconds
let tickInterval = globalSettings.initialGameInterval;
let waitingTimer, startCountdownTimer, gameTimer;
let gameStarted = false;
const gameStatusUpdates = ["game-paused", "game-resumed", "game-quit"];
const activePauses = new Map();
const pauseTimers = new Map();

// Serve static files
app.use(express.static(path.resolve()));

app.get("/", (req, res) => {
  res.sendFile(path.resolve("index.html"));
});

io.on("connection", (socket) => {
  socket.on("newuser", (username) => {
    // io.of("/").sockets.size is number of connected sockets
    if (io.of("/").sockets.size <= 4) {
      if (startCountdownTimer || gameStarted) {
        socket.emit("connection-limit-reached", "Game Currently In Session");
        socket.disconnect(true);
      } else {
        const connectedSockets = io.sockets.sockets;
        socket.username = username;
        socket.playerNumber = findPlayerCount();
        const userObj = {
          username: socket.username,
          count: socket.playerNumber,
        };
        socket.broadcast.emit("waiting");

        connectedSockets.forEach((connected) => {
          const previouslyJoinedSocket = {
            username: connected.username,
            count: connected.playerNumber,
          };
          socket.emit("join-lobby", previouslyJoinedSocket);
        });
        socket.broadcast.emit("update", `${username} joined the lobby`);
      }
    } else {
      socket.emit(
        "connection-limit-reached",
        "Lobby is now full! Please Try Again Later"
      );
      socket.disconnect(true);
    }
  });

  socket.on("keypress", (arrow) => {
    if (socket.playerNumber >= 1 && socket.playerNumber <= 4) {
      playerKeypresses[socket.playerNumber] = arrow;
      //console.log(playerKeypresses);
    }
  });

  socket.on("game-over", (aliveCount) => {
    if (aliveCount.length === 1 && gameStarted) {
      io.emit("end-game", {
        event: "winner",
        playerNum: aliveCount[0].playerNum,
        name: aliveCount[0].name,
      });
    }
    if (aliveCount.length === 0 && gameStarted) {
      io.emit("end-game", { event: "draw" });
    }
  });

  socket.on("disconnect", (reason) => {
    if (socket.username) {
      socket.broadcast.emit("update", `${socket.username} has left the game`);
    }

    if (io.of("/").sockets.size < 2 && waitingTimer) {
      stopCountdown();
    } else if (io.of("/").sockets.size < 2 && startCountdownTimer) {
      stopGameCountdown();
    }

    socket.broadcast.emit("remove-waiting-player", socket.playerNumber);
    if (gameStarted && socket.playerNumber) {
      socket.broadcast.emit("remove-player", socket.playerNumber);
    }

    if (io.of("/").sockets.size === 0 && gameStarted) {
      gameStarted = false;
      resetGameState();
    }
  });

  socket.on("start-game-button", () => {
    gameStarted = true;
    startGameCountdown();
    resetGameState();
    // Create new snakes
    io.sockets.sockets.forEach((connected) => {
      const snake = new Snake(connected.playerNumber, connected.username);
      serverSnakes[connected.playerNumber] = snake;
      placeFood(2); //2 food items per snake
    });
  });

  gameStatusUpdates.forEach((event) => {
    socket.on(event, () => {
      const status = event.split("-")[1];
      const username = socket.username;
      let remainingTime = 60;

      handleGameStatus(socket, event, username, status, remainingTime);
    });
  });
});

function startGameTimer() {
  if (gameTimer) clearInterval(gameTimer);
  let gameTime = 60; //should be set in globalSettings

  gameTimer = setInterval(() => {
    if (gameTime > 0) {
      gameTime--;
      io.emit("game-timer-update", { remainingTime: gameTime });
    } else {
      clearInterval(gameTimer);
      io.emit("game-over", { reason: "time-up" });
    }
  }, 1000);
}

function pauseGameTimer() {
  clearInterval(gameTimer);
}

function resumeGameTimer() {
  gameTimer = setInterval(() => {
    if (gameTime > 0) {
      gameTime--;
      io.emit("game-timer-update", { remainingTime: gameTime });
    } else {
      clearInterval(gameTimer);
      io.emit("game-over", { reason: "time-up" });
    }
  });
}

// Start the game ticker
function startGameTicker() {
  console.log("Starting game");
  gameInterval = setInterval(() => {
    // Loop all snakes
    Object.values(serverSnakes).forEach((snake) => {
      // Stop rendering snakes that crashed during previous tick
      if (snake.crashed) {
        snake.kill();
      }
      // Update moving direction of snake if there is a keypress
      const direction = playerKeypresses[snake.playerNumber];
      if (direction) {
        snake.setDirection(direction);
      }
      // Update the position of each snake and check for food
      let foundFood = snake.move();
      // Speed up game if a snake found food
      if (foundFood && tickInterval > globalSettings.minGameInterval) {
        changeTickInterval(tickInterval - globalSettings.gameIntervalStep);
        console.log("tickInterval:", tickInterval);
      }
    });

    // Loop again to check for collision in new positions
    Object.values(serverSnakes).forEach((snake) => {
      snake.collisionCheck(serverSnakes);
      // Do stuff if snake collided
    });

    // Emit the updated state of all snakes to all connected clients
    io.emit("tick", serverSnakes, foodArray);
  }, tickInterval);
}

// Later in the game, you can change the tick interval
function changeTickInterval(newInterval) {
  tickInterval = newInterval;
  clearInterval(gameInterval); // Stop the current ticker
  startGameTicker(); // Restart the ticker with the new interval
}

// Stop the game ticker
function stopGameTicker() {
  clearInterval(gameInterval);
}

// Start the countdown before the game begins
function startGameCountdown() {
  let countdown = 3;
  let allPlayers = [];

  io.sockets.sockets.forEach((connected) => {
    allPlayers.push({
      username: connected.username,
      count: connected.playerNumber,
    });
  });

  function emitGameCountdown() {
    io.emit("start-game-countdown", countdown);

    if (countdown === 3) {
      io.emit("play-sound", { sound: "start-game-sound" });
    }

    if (countdown > 0) {
      countdown--;
      startCountdownTimer = setTimeout(emitGameCountdown, 1000);
    } else {
      startCountdownTimer = null;
      startGameTicker();
      startGameTimer();
      io.emit("start-game", { allPlayers });
      gameStarted = true;
    }
  }
  emitGameCountdown();
}

// Reset game state before new game is started
function resetGameState() {
  //console.log("Reset game state");
  stopGameTicker();
  tickInterval = globalSettings.initialGameInterval;
  playerKeypresses = {};
  serverSnakes = {};
  foodArray.length = 0;
}

// Handle game status updates (pause, resume, quit, restart)
function handleGameStatus(socket, event, username, status, remainingTime) {
  switch (status) {
    case "paused": {
      const playerPauseInfo = activePauses.get(username);

      if (playerPauseInfo.pauseUsed) {
        socket.emit("pause-rejected", {
          reason: "You've already used your pause in this game.",
        });
        return;
      }

      stopGameTicker();

      if (playerPauseInfo.paused) {
        socket.emit("pause-rejected", {
          reason: "You can only pause once per game.",
        });
        return;
      }

      activePauses.set(username, { paused: true, pauseUsed: true });

      io.emit("game-status-update", {
        status,
        username,
        remainingTime,
        message: `${username} paused the game`,
      });

      const interval = setInterval(() => {
        remainingTime--;
        io.emit("countdown-update", { username, remainingTime });

        if (remainingTime === 4) {
          io.emit("play-sound", { sound: "countdown-sound" });
        }

        if (remainingTime <= 0) {
          clearInterval(interval);
          pauseTimers.delete(username);

          activePauses.set(username, { paused: false, pauseUsed: true });

          io.emit("game-status-update", {
            status: "resumed",
            username,
            message: `${username}'s pause has ended.`,
          });
        }
      }, 1000);

      pauseTimers.set(username, interval);

      break;
    }

    case "resumed": {
      const playerPauseInfo = activePauses.get(username);

      if (!playerPauseInfo.paused) {
        socket.emit("pause-rejected", {
          reason: "You have used your pause already.",
        });
        return;
      }

      const interval = pauseTimers.get(username);
      if (interval) {
        clearInterval(interval);
        pauseTimers.delete(username);
      }

      activePauses.set(username, {
        paused: false,
        pauseUsed: playerPauseInfo.pauseUsed,
      });

      let resumeCountdown = 10;
      const countdownInterval = setInterval(() => {
        io.emit("resume-countdown", {
          username,
          remainingTime: resumeCountdown,
          message: `Game will resume in ${resumeCountdown} seconds`,
        });

        if (resumeCountdown === 4) {
          io.emit("play-sound", { sound: "countdown-sound" });
        }

        resumeCountdown--;

        if (resumeCountdown < 0) {
          clearInterval(countdownInterval);

          startGameTicker();

          io.emit("game-status-update", {
            status,
            username,
            message: `${username} resumed the game.`,
          });
        }
      }, 1000);

      break;
    }

    case "quit": {
      const interval = pauseTimers.get(username);
      if (interval) {
        clearInterval(interval);
        pauseTimers.delete(username);
      }
      activePauses.set(username, { paused: false });

      io.emit("game-status-update", {
        status,
        username,
        message: `${username} has quit the game.`,
      });
      break;
    }

    case "restart": {
      io.emit("game-status-update", {
        status,
        username,
        message: `${username} restarted the game.`,
      });
      break;
    }

    default:
      // Do nothing
      break;
  }
}
// Returns number of connected players
function findPlayerCount() {
  let smallestMissingValue = null;
  for (let n = 1; n <= 4; n++) {
    let found = false;

    for (let [id, socket] of io.sockets.sockets) {
      if (socket.playerNumber === n) {
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

// Start server
server.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
