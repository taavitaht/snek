// Game state management (updating positions, rendering visuals, etc)
// Communication with server for game updates

import { playerCard } from "../components/waitingRoom.js";
import { startAnimating } from "../misc/animationLoop.js";
import { createMap } from "../components/mapTemplate.js";
import { globalSettings } from "../misc/gameSettings.js";
import { drawFood } from "../components/food.js";
import { escapePressed, resetEscapePressed } from "../misc/input.js";
import { storeSnakes } from "../misc/animationLoop.js";
import {
  makeEndContainer,
  removeEndContainer,
} from "../components/gameEndContainer.js";
import { playSound } from "../utils/sounds.js";

export let socket;
let link;
if (!globalSettings.ngrok) {
  link = `http://localhost:${globalSettings.port}`;
} else {
  link = globalSettings.ngrok;
}
let myUsername;
let myPlayerNumber;
let map;
export let mySnake;
let numOfPlayers;
let numOfHumans;
let oldFood = [];
export let isPaused = false;
let gameEnd = false;

// Connect to server
export function startSockets() {
  const app = document.querySelector(".app");
  socket = io(link, {
    reconnection: false, // Disable auto-reconnection
  });

  pauseMenuBtns();

  // Bots
  addBotButton();
  removeBotButton();

  // Join button in the waiting room
  const joinUserButton = document.getElementById("join-user-button");
  joinUserButton.addEventListener("click", function () {
    socket.emit("join-request");

    let username = app.querySelector(".join-screen #username").value.trim();
    const usernameMessage = document.getElementById("username-message");

    if (username.length == 0) {
      usernameMessage.textContent = "Username cannot be empty";
      return;
    }
    if (username.length > 10) {
      usernameMessage.textContent =
        "Username must be between 1 and 10 characters";
      return;
    }

    // Make sure server has responded and continue processing
    socket.once("join-response", (receivedUsernames, gameStarted) => {
      if (gameStarted) {
        usernameMessage.textContent =
          "Game is already started. Try again later";
        return;
      }
      if (receivedUsernames.length >= 4) {
        usernameMessage.textContent = "Game is full. Try again later";
        return;
      }
      if (receivedUsernames.includes(username)) {
        usernameMessage.textContent = "That username is already taken";
        return;
      }

      // Passed all checks, add new user to the game
      myUsername = username;
      socket.emit("newuser", username);
      runSocket();
    });
  });

  function runSocket() {
    // Handle connectiong and disconnecting users
    // Add recently joined player to the waiting room
    socket.on("player-new", function (playerNumber, playerName, allPlayers) {
      const waitingPlayerContainer = document.getElementById(
        `player-${playerNumber}-card`
      );
      waitingPlayerContainer.textContent = playerName;
      // If new player is this user
      if (playerName == myUsername) {
        myPlayerNumber = playerNumber;
        // Hide join screen
        const joinScreen = document.querySelector(".join-screen");
        joinScreen.style.display = "none";
        // Fill other players cards
        const playersWaitingContainer = document.getElementById(
          "players-waiting-container"
        );
        for (let i = 1; i <= 4; i++) {
          if (i != myPlayerNumber) {
            let otherPlayer = allPlayers[i];
            if (otherPlayer) {
              const waitingPlayerContainer = document.getElementById(
                `player-${i}-card`
              );
              waitingPlayerContainer.textContent = otherPlayer.username;
            }
          }
        }

        // Start game
        startButton();
      }

      // Show bot div?
      numOfHumans = Object.values(allPlayers).filter(
        (player) =>
          player && player.username && !player.username.startsWith("BOT-")
      ).length;

      const botDiv = document.querySelector(".play-against-bots-div");
      if (numOfHumans === 1) {
        // Show bot div
        botDiv.style.display = "flex";
      } else {
        // Hide bot div
        botDiv.style.display = "none";
      }

      numOfPlayers = Object.values(allPlayers).filter((value) => value).length;
      //console.log("numOfPlayers", numOfPlayers);
      //console.log(allPlayers);
      startButton();
    });

    socket.on("user-disconnect", function (pNum, pName) {
      // Clear card in waiting room
      const waitingPlayerContainer = document.getElementById(
        `player-${pNum}-card`
      );
      waitingPlayerContainer.textContent = "";
      startButton();
    });

    // Start game button
    function startButton() {
      let enabled = false;
      const startGameButton = document.getElementById("start-game-button");
      startGameButton.addEventListener("click", function () {
        if (enabled) {
          socket.emit("start-game-button");
        }
      });
      if (numOfPlayers < 2 && !globalSettings.singlePlayerEnabled) {
        startGameButton.textContent = "";
        enabled = false;
      }
      if (
        (numOfPlayers >= 2 && myPlayerNumber == 1) ||
        globalSettings.singlePlayerEnabled
      ) {
        startGameButton.textContent = "Start game!";
        enabled = true;
      }
    }

    // display 10s countdown before game starts
    socket.on("start-game-countdown", function (countdown) {
      const startGameCountdown = app.querySelector(".countdown-container");
      startGameCountdown.classList.remove("waiting");
      startGameCountdown.textContent = `Game will start in ${countdown} !`;
    });

    // Game start
    socket.on("start-game", function (obj) {
      // Create the map
      if (!map) {
        map = createMap();
        const gameContainer = document.getElementById("game-container");
        gameContainer.appendChild(map);
      }
      // Hide waiting room
      const waitingRoom = app.querySelector(".waiting-room-container");
      waitingRoom.style.display = "none";

      // Begin
      startAnimating(globalSettings.fps);
    });

    // Listen for updated snake positions on the client
    socket.on("tick", function (updatedSnakes, foodArray) {
      //console.log("tick", updatedSnakes, foodArray);
      // Send updated snakes to animation engine
      storeSnakes(updatedSnakes);
      Object.values(updatedSnakes).forEach((snake) => {
        if (snake.playerNumber === myPlayerNumber) {
          mySnake = snake;
        }
      });
      drawFood(foodArray);
      // Was food eaten?
      if (!oldFood || oldFood.length === 0) {
        // Initialize oldFood if it's undefined or empty
        oldFood = [...foodArray];
      } else {
        let arraysEqual = foodArray.every(
          (item, index) =>
            oldFood[index] &&
            item.x === oldFood[index].x &&
            item.y === oldFood[index].y
        );
        if (!arraysEqual) {
          playSound("/sounds/ding.mp3");
        }
        // Deep copy foodArray
        oldFood = JSON.parse(JSON.stringify(foodArray));
      }
    });

    // Messages on game update display on left of game area
    socket.on("live-game-update", function (message) {
      let updateMessage;
      const minutes = Math.floor(message.remainingTime / 60);
      const seconds = Math.floor(message.remainingTime % 60);
      const timeStamp = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

      switch (message.event) {
        case "player-killed":
          updateMessage = `${timeStamp}: ${message.username} died`;
          break;
        case "player-quit":
          updateMessage = `${timeStamp}: ${message.username} quit`;
          break;
        case "player-paused":
          updateMessage = `${timeStamp}: ${message.username} paused`;
          break;
        case "player-disconnect":
          updateMessage = `${timeStamp}: ${message.username} disconnected`;
          break;
        case "player-resumed":
          updateMessage = `${timeStamp}: ${message.username} resumed the game`;
          break;
        case "player-restart":
          updateMessage = `${timeStamp}: ${message.username} requested a restart`;
          break;
        default:
          updateMessage = `${timeStamp}: Unknown event occurred.`;
          break;
      }
      appendLiveUpdateMessage(updateMessage);
    });

    socket.on("game-timer-update", function (data) {
      const gameTimerElement = document.querySelector(
        ".game-updates-container .timer"
      );
      //console.log(`timer update: ${data.remainingTime}`);
      if (gameTimerElement) {
        const minutes = Math.floor(data.remainingTime / 60);
        const seconds = Math.floor(data.remainingTime % 60);
        gameTimerElement.textContent = `${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }
    });

    socket.on("end-game", function (snakes) {
      // Genereate game over div
      gameEnd = true;
      makeEndContainer(snakes);
      // After timeout reset game
      setTimeout(() => {
        resetGame();
        gameEnd = false;
      }, 5000);
    });

    socket.on("game-status-update", function (data) {
      const pauseContainer = document.querySelector(".pause-container");
      const pauseContainerMain = pauseContainer.querySelector(
        ".pause-container-main"
      );
      const restartContainer =
        pauseContainer.querySelector(".restart-container");
      const restartTitle = restartContainer.querySelector(".restart-title");
      const timerElement = pauseContainer.querySelector(".pause-timer");
      const titleElement = pauseContainer.querySelector("h1");
      const pauseTimer = restartContainer.querySelector(".restart-timer");

      if (!pauseContainer) return;

      resetPauseUI();

      switch (data.status) {
        case "paused":
          isPaused = true;
          pauseContainer.classList.remove("hidden");
          pauseContainerMain.classList.remove("hidden");
          restartContainer.classList.add("hidden");

          titleElement.textContent = data.message || "Game Paused";
          timerElement.style.display = "block";

          if (data.pausedBy === myUsername) {
            pauseContainer
              .querySelector(".resume-button")
              .classList.remove("hidden");
          } else {
            pauseContainer
              .querySelector(".resume-button")
              .classList.add("hidden");
          }
          break;

        case "resumed":
          pauseContainer.classList.add("hidden");
          if (timerElement) {
            timerElement.style.display = "none";
          }
          isPaused = false;
          break;

        case "quit":
          pauseContainer.classList.remove("hidden");
          pauseContainer.querySelector("h1").textContent = `${data.message} `;

          break;

        case "restart": {
          //console.log("Data: " + JSON.stringify(data));

          restartTitle.textContent = data.message;

          isPaused = false;
          pauseContainer.classList.remove("hidden");
          pauseContainerMain.classList.add("hidden");
          restartContainer.classList.remove("hidden");

          const buttons = pauseContainer.querySelectorAll("button");
          buttons.forEach((btn) => (btn.disabled = false));

          isPaused = false;
        }
      }
    });

    // for sound effects
    socket.on("play-sound", (data) => {
      if (data.sound === "start-game-sound") {
        playSound("/sounds/start.mp3");
      }
    });

    socket.on("play-sound", (data) => {
      if (data.sound === "countdown-sound") {
        playSound("/sounds/pause-end.mp3");
      }
    });

    // start countdown on main screen
    socket.on("countdown-update", function (data) {
      const { pauseCountdown } = data;

      const container = document.querySelector(".pause-container");
      const timerElement = container.querySelector(".pause-timer");

      if (timerElement) {
        timerElement.textContent = `${pauseCountdown} seconds remaining in pause`;
      }
    });

    socket.on("pause-rejected", (data) => {
      const container = document.querySelector(".pause-container");
      const reasonElement = container.querySelector(".pause-reason");
      const resumeButton = container.querySelector(".resume-button");
      const pauseTitle = container.querySelector("h1");

      if (!reasonElement || !resumeButton || !pauseTitle) return;

      isPaused = false;
      reasonElement.textContent = data.reason;

      pauseTitle.classList.add("hidden");
      resumeButton.classList.add("hidden");

      container.classList.remove("hidden");
      reasonElement.classList.remove("hidden");

      setTimeout(() => {
        container.classList.add("hidden");
        reasonElement.classList.add("hidden");
      }, 3000);
    });

    socket.on("resume-countdown", function (data) {
      const container = document.querySelector(".pause-container");
      const reasonElement = container.querySelector(".pause-reason");
      const timerElement = container.querySelector(".pause-timer");
      const resumeButton = container.querySelector(".resume-button");

      if (resumeButton) {
        resumeButton.classList.add("hidden");
      }

      if (reasonElement) {
        reasonElement.classList.remove("hidden");
        reasonElement.textContent = data.message;
      }

      if (timerElement) {
        timerElement.textContent = "";
      }
    });

    socket.on("restart-countdown", function (data) {
      const pauseContainer = document.querySelector(".pause-container");
      const restartContainer =
        pauseContainer.querySelector(".restart-container");
      const titleElement = pauseContainer.querySelector("h1");
      let pauseTimer = restartContainer.querySelector(".restart-timer");

      pauseContainer.classList.remove("hidden");
      restartContainer.classList.remove("hidden");

      if (!pauseTimer) {
        pauseTimer = document.createElement("p");
        pauseTimer.classList.add("restart-timer");
        restartContainer.appendChild(pauseTimer);
      }

      pauseTimer.textContent = `${data.message}`;

      const buttons = pauseContainer.querySelectorAll("button");
      buttons.forEach((btn) => (btn.disabled = true));
      restartGame();
    });

    socket.on("score-update", function (scoreboard) {
      const scoreboardList = document.querySelector(".scoreboard-list");

      scoreboardList.innerHTML = "";

      scoreboard.sort((a, b) => {
        if (a.crashed === b.crashed) {
          return b.score - a.score; // Sort by score if neither/both are crashed
        }
        return a.crashed - b.crashed; // Put non-crashed players first
      });

      scoreboard.forEach((player) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${player.username}: ${player.score}`;
        if (player.crashed) {
          listItem.style.textDecoration = "line-through";
          listItem.style.color = "grey";
        }

        scoreboardList.appendChild(listItem);
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("Lost connection to server");
      // Create error message
      const errorDiv = document.createElement("div");
      errorDiv.className = "server-disconnect-error-message";
      errorDiv.textContent = "Lost connection to server. Page will reload";
      document.body.appendChild(errorDiv);
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    });

    requestAnimationFrame(checkForEscape);
  }
}

export function appendLiveUpdateMessage(updateMessage) {
  let gameUpdatesContainer = document.querySelector(".live-updates");

  const messageElement = document.createElement("div");
  messageElement.classList.add("update-message");
  messageElement.textContent = updateMessage;

  if (gameUpdatesContainer.childNodes.length != 0) {
    gameUpdatesContainer.insertBefore(
      messageElement,
      gameUpdatesContainer.firstChild
    );
  } else {
    gameUpdatesContainer.appendChild(messageElement);
  }
}

// checks needed if the game is running or not
function pauseMenuBtns() {
  const resumeButton = document.querySelector(".resume-button");
  const quitButton = document.querySelector(".quit-button");
  const restartButton = document.querySelector(".restart-button");

  if (resumeButton) {
    resumeButton.addEventListener("click", () => {
      resumeButton.classList.add("c");
      socket.emit("game-resumed");
    });
  }

  if (quitButton) {
    quitButton.addEventListener("click", () => {
      socket.emit("game-quit");
    });
  }

  if (restartButton) {
    restartButton.addEventListener("click", () => {
      socket.emit("game-restart");
    });
  }
}

function checkForEscape() {
  if (escapePressed) {
    // Check that we're not in the lobby
    const waitingRoom = document.querySelector(".waiting-room-container");
    if (!gameEnd && !isPaused && waitingRoom.style.display == "none") {
      socket.emit("game-paused");
      isPaused = true;
    }
    resetEscapePressed();
  }
  requestAnimationFrame(checkForEscape);
}

function resetPauseUI() {
  const container = document.querySelector(".pause-container");
  if (!container) return;

  container.classList.add("hidden");

  const reasonElement = container.querySelector(".pause-reason");
  if (reasonElement) {
    reasonElement.textContent = "";
    reasonElement.classList.add("hidden");
  }

  const pauseTitle = container.querySelector("h1");
  if (pauseTitle) {
    pauseTitle.classList.remove("hidden");
    pauseTitle.textContent = "";
  }

  const resumeButton = container.querySelector(".resume-button");
  if (resumeButton) {
    resumeButton.classList.remove("hidden");
    resumeButton.textContent = "Resume";
  }

  const timerElement = container.querySelector(".pause-timer");
  if (timerElement) {
    timerElement.textContent = "";
    timerElement.style.display = "none";
  }
}

// Reset game without disconnecting from server
function resetGame() {
  const app = document.querySelector(".app");
  const startGameCountdown = app.querySelector(".countdown-container");
  startGameCountdown.classList.add("waiting");
  startGameCountdown.textContent = "Snek";
  // Show waiting room
  removeEndContainer();
  resetPauseUI();
  resetEscapePressed();
  isPaused = false;
  const waitingRoom = app.querySelector(".waiting-room-container");
  waitingRoom.style.display = "grid";
  setTimeout(() => {
    // Erase all snakes
    let SnakeHeads = app.querySelectorAll(".snake-head");
    SnakeHeads.forEach((element) => {
      element.remove();
    });
    let SnakeBodys = app.querySelectorAll(".snake-body");
    SnakeBodys.forEach((element) => {
      element.remove();
    });
    // Clear game updates
    let updates = app.querySelectorAll(".update-message");
    updates.forEach((element) => {
      element.remove();
    });

    pauseMenuBtns();
  }, 100);
}
// Restart game without leaving game
function restartGame() {
  const app = document.querySelector(".app");
  isPaused = false;

  setTimeout(() => {
    // Erase all snakes
    let snakeHeads = app.querySelectorAll(".snake-head");
    //console.log(":", snakeHeads.length);
    snakeHeads.forEach((element) => {
      element.remove();
    });

    let snakeBodies = app.querySelectorAll(".snake-body");
    //console.log("SnakeBodies:", snakeBodies.length);
    snakeBodies.forEach((element) => {
      element.remove();
    });

    // Clear game updates
    let updates = app.querySelectorAll(".update-message");
    updates.forEach((element) => {
      element.remove();
    });

    resetPauseUI();
    pauseMenuBtns();
    enablePauseMenuButtons();
  }, 800);
}
function enablePauseMenuButtons() {
  const buttons = document.querySelectorAll(
    ".resume-button, .quit-button, .restart-button"
  );
  buttons.forEach((btn) => {
    btn.disabled = false;
  });
}

// Handle bot buttons
export function addBotButton() {
  const addBotButton = document.getElementById("add-bot-button");
  addBotButton.addEventListener("click", function () {
    let botLevel = {
      targeting: "easy",
      movement: "easy",
    };

    // Get the difficulty level
    const difficulty = document.querySelector(
      'input[name="difficulty"]:checked'
    ).value;

    if (difficulty === "easy") {
      botLevel.targeting = "easy";
      botLevel.movement = "easy";
    } else if (difficulty === "medium") {
      botLevel.targeting = "medium";
      botLevel.movement = "medium";
    } else if (difficulty === "hard") {
      botLevel.targeting = "hard";
      botLevel.movement = "hard";
    } else if (difficulty === "custom") {
      // For custom, get the selected targeting and movement strategies
      botLevel.targeting = document.querySelector(
        'input[name="targeting"]:checked'
      ).value;
      botLevel.movement = document.querySelector(
        'input[name="movement"]:checked'
      ).value;
    }

    socket.emit("add-bot-button", botLevel);
  });
}
export function removeBotButton() {
  const removeBotButton = document.getElementById("remove-bot-button");
  removeBotButton.addEventListener("click", function () {
    socket.emit("remove-bot-button");
  });
}
