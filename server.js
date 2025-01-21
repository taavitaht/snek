import express from "express";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { Snake } from "./components/players.js";
import { Food, placeFood, foodArray } from "./components/food.js";

// Create an express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 5000;

// Game state variables
let serverSnakes = []; // Array holding all snakes
let playerKeypresses = {};
let gameInterval;
//let foodArray = [];

let waitingTimer, startGameTimer, cells;
let gameStarted = false;
let gameMap = [];
const gameStatusUpdates = ["game-paused", "game-resumed", "game-quit"];
const activePauses = new Map();
const pauseTimers = new Map();

// Serve static files
app.use(express.static(path.resolve()));

app.get("/", (req, res) => {
  res.sendFile(path.resolve("index.html")); // Path to your index.html file
});

io.on("connection", (socket) => {
  socket.on("newuser", (username) => {
    if (io.of("/").sockets.size <= 4) {
      if (startGameTimer || gameStarted) {
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
        socket.broadcast.emit("waiting", userObj);

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

  socket.on("player-movement", (newSnake) => {
    updateSnakeArray(newSnake);
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
      socket.broadcast.emit(
        "update",
        `${socket.username} has left the conversation`
      );
    }

    if (io.of("/").sockets.size < 2 && waitingTimer) {
      stopCountdown();
    } else if (io.of("/").sockets.size < 2 && startGameTimer) {
      stopGameCountdown();
    }

    socket.broadcast.emit("remove-waiting-player", socket.playerNumber);
    if (gameStarted && socket.playerNumber) {
      socket.broadcast.emit("remove-player", socket.playerNumber);
    }

    if (io.of("/").sockets.size === 0 && gameStarted) {
      gameStarted = false;
    }
  });

  socket.on("start-game-button", () => {
    startGameCountdown();
    resetGameState();
    gameStarted = true;
  });

  gameStatusUpdates.forEach((event) => {
    socket.on(event, () => {
      const status = event.split("-")[1];
      const username = socket.username;
      let remainingTime = 60;

      handleGameStatus(event, username, status, remainingTime);
    });
  });
});

// Update snake array with the latest snake positions
function updateSnakeArray(newSnake) {
  const index = serverSnakes.findIndex(
    (snake) => snake.playerNumber === newSnake.playerNumber
  );

  if (index === -1) {
    serverSnakes.push(newSnake);
  } else {
    serverSnakes[index] = newSnake;
  }
}

// Start the game ticker
function startGameTicker() {
  console.log("Starting game");
  gameInterval = setInterval(() => {
    // Update the position of each snake
    serverSnakes.forEach((snake) => {
      const direction = playerKeypresses[snake.playerNumber];

      // Update moving direction of snake if there is a keypress
      if (direction) {
        snake.setDirection(direction);
      }
      // Move the snake
      snake.move();
    });
    //console.log("foodArray:", foodArray)
    // Emit the updated state of all snakes to all connected clients
    io.emit("tick", serverSnakes, foodArray); // Send the state of all snakes and food items to all clients
  }, 500);
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
      startGameTimer = setTimeout(emitGameCountdown, 1000);
    } else {
      startGameTimer = null;
      startGameTicker();
      io.emit("start-game", { allPlayers });
      gameStarted = true;
    }
  }
  emitGameCountdown();
}

// Reset game state
function resetGameState() {
  playerKeypresses = {};
  serverSnakes.length = 0;
  foodArray.length = 0;
  // Create new snakes
  io.sockets.sockets.forEach((connected) => {
    const snake = new Snake(connected.playerNumber, connected.username);
    serverSnakes.push(snake);
  });
  // Place food items
  placeFood(5);
  //console.log("Foods: ", foodArray);
}

// Handle game status updates (pause, resume, quit, restart)
function handleGameStatus(event, username, status, remainingTime) {
  switch (status) {
    case "paused": {
      const playerPauseInfo = activePauses.get(username) || {
        paused: false,
        pauseUsed: false,
      };

      if (playerPauseInfo.paused) {
        socket.emit("pause-rejected", {
          reason: "You can only pause once per game.",
        });
        return;
      }

      activePauses.set(username, { paused: true });

      io.emit("game-status-update", {
        status,
        username,
        remainingTime,
        message: `${username} paused the game.`,
      });

      const interval = setInterval(() => {
        remainingTime--;
        io.emit("countdown-update", { username, remainingTime });

        if (remainingTime <= 0) {
          clearInterval(interval);
          pauseTimers.delete(username);
          activePauses.set(username, { paused: false });

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
      const interval = pauseTimers.get(username);
      if (interval) {
        clearInterval(interval);
        pauseTimers.delete(username);
      }

      activePauses.set(username, { paused: false });

      io.emit("game-status-update", {
        status,
        username,
        message: `${username} resumed the game.`,
      });
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
