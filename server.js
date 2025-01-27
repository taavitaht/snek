import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { Snake } from "./components/snakes.js";
import { placeFood, foodArray } from "./components/food.js";
import { globalSettings } from "./misc/gameSettings.js";

// Create an express app and HTTP server
const app = express();
const server = http.createServer(app);
const port = globalSettings.port;
let link = globalSettings.ngrok;
if (!link) {
  link = `http://localhost:${port}`;
}
const io = new Server(server, {
  cors: {
    origin: link,
    methods: ["GET", "POST"],
  },
});

// Game state variables
const players = {
  1: null, // Player 1
  2: null, // Player 2
  3: null, // Player 3
  4: null, // Player 4
};
let serverSnakes = {}; // Object holding all snakes
let playerKeypresses = {};
let gameInterval;
let gameTime = globalSettings.gameTime; //should be set in globalSettings

let tickInterval = globalSettings.initialGameInterval;
let waitingTimer, startCountdownTimer, gameTimer;
let gameStarted = false;
const gameStatusUpdates = ["game-paused", "game-resumed", "game-quit"];
const activePauses = new Map();
const pauseTimers = new Map();

// Cors TODO: Remove?
const corsOptions = {
  origin: link,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
//app.use(cors(corsOptions));
app.use(cors());

// Serve static files
app.use(express.static(path.resolve()));

// Handle socket connections
io.on("connection", (socket) => {
  // Add new player
  socket.on("newuser", (username) => {
    // No more than 4 connections allowed (io.of("/").sockets.size is number of connected sockets)
    if (io.of("/").sockets.size <= 4) {
      // Add to players object
      let number = assignPlayerNumber();
      players[number] = {
        username: username,
      };
      // Add to socket
      socket.username = username;
      socket.playerNumber = number;

      // Broadcast new player to all connected sockets
      io.emit("player-new", number, username, players);
    } else {
      socket.disconnect(true);
    }
  });

  // Request to connect. Respond with all connected usernames and game running status
  socket.on("join-request", () => {
    const usernames = [];
    // Iterate through all connected sockets
    for (const [id, clientSocket] of io.sockets.sockets) {
      if (clientSocket.username) {
        usernames.push(clientSocket.username);
      }
    }
    socket.emit("join-response", usernames, gameStarted);
  });

  // User disconnected
  socket.on("disconnect", (reason) => {
    if (socket.username) {
      io.emit("user-disconnect", socket.playerNumber, socket.username);
      io.emit("live-game-update", {
        event: "player-disconnect",
        username: socket.username,
        remainingTime: gameTime,
      });
      players[socket.playerNumber] = null;
      if (gameStarted && socket.playerNumber) {
        if (serverSnakes[socket.playerNumber]) {
          serverSnakes[socket.playerNumber].kill();
          serverSnakes[socket.playerNumber].crashed = "disconnected";
        }
      }
    }

    // Check if game end condition is now met
    gameEndCheck();

    // If that was the only connected socket reset game
    if (io.of("/").sockets.size === 0 && gameStarted) {
      gameStarted = false;
      resetGameState();
    }
    refreshPlayers();
  });

  // Player pressed an arrow key
  socket.on("keypress", (arrow) => {
    if (socket.playerNumber >= 1 && socket.playerNumber <= 4) {
      playerKeypresses[socket.playerNumber] = arrow;
    }
  });

  // Start game button was pressed
  socket.on("start-game-button", () => {
    if (!gameStarted) {
      gameStarted = true;
      resetGameState();
      startGameCountdown();
      // Create new snakes
      io.sockets.sockets.forEach((connected) => {
        // Make sure connection is properly initialized
        if (connected.playerNumber && connected.username) {
          const snake = new Snake(connected.playerNumber, connected.username);
          serverSnakes[connected.playerNumber] = snake;
          placeFood(globalSettings.food.count); //X food items per snake
        }
      });
    }
  });

  // Handle game status updates
  gameStatusUpdates.forEach((event) => {
    socket.on(event, () => {
      const status = event.split("-")[1];
      const username = socket.username;

      handleGameStatus(socket, event, username, status, gameTime);
    });
  });
});

function startGameTimer() {
  gameTime = globalSettings.gameTime;
  console.log("starting game timer: ", gameTime);
  runGameTimer();
}

function pauseGameTimer() {
  console.log("pausing game timer: ", gameTime);
  clearInterval(gameTimer);
}

function resumeGameTimer() {
  console.log("resuming game timer: ", gameTime);
  runGameTimer();
}

function runGameTimer() {
  if (gameTimer) clearInterval(gameTimer);
  gameTimer = setInterval(() => {
    if (gameTime > 0) {
      gameTime--;
      io.emit("game-timer-update", { remainingTime: gameTime });
    } else {
      clearInterval(gameTimer);
      stopGameTicker();
      io.emit("end-game", { serverSnakes });
    }
  }, 1000);
}

// Start the game ticker
function startGameTicker() {
  gameInterval = setInterval(() => {
    let scoreboard = [];

    // Check end game conditions
    gameEndCheck();

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
      if (foundFood) {
        // Interval step size and fastest speed are dependent on number of players
        let numOfPlayers = playerCountCheck();
        if (tickInterval > globalSettings.minGameInterval + numOfPlayers * 10) {
          tickInterval =
            tickInterval - globalSettings.gameIntervalStep / numOfPlayers;
          if (tickInterval < globalSettings.minGameInterval) {
            tickInterval = globalSettings.minGameInterval;
          }
          changeTickInterval(tickInterval);
          console.log("tickInterval:", tickInterval);
        }
      }

      snake.collisionCheck(serverSnakes);
      // Do stuff if snake collided

      scoreboard.push({
        username: snake.username,
        score: snake.score,
        crashed: snake.crashed,
      });
    });

    io.emit("score-update", scoreboard);
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
      playerNumber: connected.playerNumber,
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
      console.log("Game started");
    }
  }
  emitGameCountdown();
}

// Reset game state before new game is started
function resetGameState() {
  //console.log("Reset game state");
  stopGameTicker();
  pauseGameTimer();
  tickInterval = globalSettings.initialGameInterval;
  playerKeypresses = {};
  serverSnakes = {};
  foodArray.length = 0;
  //gameStarted = false;
  activePauses.clear();
  pauseTimers.clear();
}

// Handle game status updates (pause, resume, quit, restart)
function handleGameStatus(socket, event, username, status, remainingTime) {
  switch (status) {
    case "paused": {
      let playerPauseInfo = activePauses.get(username) || {
        paused: false,
        pauseUsed: false,
      };

      if (playerPauseInfo.pauseUsed) {
        socket.emit("pause-rejected", {
          reason: "You've already used your pause in this game.",
        });
        return;
      }

      stopGameTicker();
      pauseGameTimer();

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

      io.emit("live-game-update", {
        event: "player-paused",
        username,
        remainingTime,
      });

      let pauseCountdown = 30;
      const interval = setInterval(() => {
        io.emit("countdown-update", { username, pauseCountdown });
        if (pauseCountdown === 3 && gameStarted) {
          io.emit("play-sound", { sound: "countdown-sound" });
        }

        if (pauseCountdown <= 0) {
          clearInterval(interval);
          pauseTimers.delete(username);

          activePauses.set(username, { paused: false, pauseUsed: true });
          startGameTicker();
          resumeGameTimer();

          io.emit("game-status-update", {
            status: "resumed",
            username,
            message: `${username}'s pause has ended.`,
          });
        }
        pauseCountdown--;
      }, 1000);

      pauseTimers.set(username, interval);

      break;
    }

    case "resumed": {
      const playerPauseInfo = activePauses.get(username);

      if (playerPauseInfo) {
        if (!playerPauseInfo.paused) {
          socket.emit("pause-rejected", {
            reason: "You have used your pause already.",
          });
          return;
        }
      }

      const interval = pauseTimers.get(username);
      if (interval) {
        clearInterval(interval);
        pauseTimers.delete(username);
      }

      if (playerPauseInfo) {
        activePauses.set(username, {
          paused: false,
          pauseUsed: playerPauseInfo.pauseUsed,
        });
      }

      let resumeCountdown = 5;
      const countdownInterval = setInterval(() => {
        io.emit("resume-countdown", {
          username,
          remainingTime: resumeCountdown,
          message: `Game will resume in ${resumeCountdown} seconds`,
        });

        if (resumeCountdown === 4 && gameStarted) {
          io.emit("play-sound", { sound: "countdown-sound" });
        }

        resumeCountdown--;

        if (resumeCountdown < 0) {
          clearInterval(countdownInterval);

          startGameTicker();
          resumeGameTimer();

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
        //clearInterval(interval);
        pauseTimers.delete(username);
      }
      activePauses.set(username, { paused: false });

      io.emit("game-status-update", {
        status,
        username,
        message: `${username} has quit the game.`,
      });

      io.emit("live-game-update", {
        event: "player-quit",
        username,
        remainingTime,
      });
      serverSnakes[socket.playerNumber].crashed = "quit";
      socket.disconnect();
      break;
    }

    default:
      // Do nothing
      break;
  }
}

// Return number of alive snakes, apply crashed "reason" to alive snakes
function playerCountCheck(crash) {
  let count = 0;
  Object.values(serverSnakes).forEach((snake) => {
    if (!snake.crashed) {
      count++;
      if (crash) {
        snake.crashed = crash;
      }
    }
  });
  return count;
}

// Function to find the first unused player number
function assignPlayerNumber() {
  refreshPlayers();
  for (let i = 1; i <= 4; i++) {
    if (!players[i]) {
      //console.log("assignPlayerNumber", i);
      return i;
    }
  }
  return null; // Return null if no free player number
}

// Refresh local players object based on socket connections
function refreshPlayers() {
  // Loop all 4 player slots
  for (let i = 1; i <= 4; i++) {
    players[i] = null;
    // Loop socket connections
    for (let [id, socket] of io.sockets.sockets) {
      let pNumber = socket.playerNumber;
      let pName = socket.username;
      // If socket with same player number is found refill player slot
      if (pNumber == i) {
        players[i] = pName;
        break;
      }
    }
  }
}

// Check if conditions are met to end game
function gameEndCheck() {
  let snakesLeft = playerCountCheck();
  // Multiplayer
  if (
    Object.entries(serverSnakes).length > 1 &&
    (snakesLeft == 1 || snakesLeft == 0)
  ) {
    gameStarted = false;
    io.emit("end-game", { serverSnakes });
    console.log("Game over, no more competitors left");
    stopGameTicker();
    resetGameState();
  }
  // Singleplayer
  if (Object.entries(serverSnakes).length == 1 && snakesLeft == 0) {
    gameStarted = false;
    io.emit("end-game", { serverSnakes });
    console.log("Game over, you died");
    stopGameTicker();
    resetGameState();
  }
  // Time runs out
  if (gameStarted && gameTime <= 0) {
    gameStarted = false;
    playerCountCheck("time");
    io.emit("end-game", { serverSnakes });
    console.log("Game over, time ran out");
    stopGameTicker();
    resetGameState();
  }
}

// Start server

// Clear connected sockets before starting the server
io.on("connection", (socket) => {});
io.sockets.sockets.forEach((socket) => {
  socket.disconnect(true);
});

// Start server
server.listen(port, () => {
  //console.log(`App listening at http://localhost:${port}`);
  console.log(`Server running at ${link}`);
});
