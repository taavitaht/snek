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
export let snakes = {};
export let mySnake;
let numOfPlayers;
let oldFood = [];

// Connect to server
export function startSockets() {
  const app = document.querySelector(".app");
  socket = io(link, {
    reconnection: false, // Disable auto-reconnection
  });
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
              waitingPlayerContainer.textContent = otherPlayer;
            }
          }
        }
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
          const audio = new Audio("/sounds/ding.mp3");
          audio.play();
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
      makeEndContainer(snakes);
      // After timeout reset game
      setTimeout(() => {
        resetGame();
      }, 5000);
    });

    socket.on("game-status-update", function (data) {
      const container = document.querySelector(".pause-container");
      const timerElement = container.querySelector(".pause-timer");
      if (!container) return;
      switch (data.status) {
        case "paused":
          container.classList.remove("hidden");
          container.querySelector("h1").textContent = `${data.message}`;
          if (timerElement) {
            timerElement.style.display = "block";
          }
          break;

        case "resumed":
          container.classList.add("hidden");
          if (timerElement) {
            timerElement.style.display = "none";
          }
          break;

        case "quit":
          container.classList.remove("hidden");
          container.querySelector("h1").textContent = `${data.message} `;

          break;
      }
    });

    pauseMenu(socket);
    // for sound effects
    socket.on("play-sound", (data) => {
      if (data.sound === "start-game-sound") {
        const audio = new Audio("/sounds/start.mp3");
        audio.play();
      }
    });

    socket.on("play-sound", (data) => {
      if (data.sound === "countdown-sound") {
        const audio = new Audio("/sounds/pause-end.mp3");
        audio.play();
      }
    });

    // start countdown on main screen
    socket.on("countdown-update", function (data) {
      const { username, pauseCountdown } = data;

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

      if (reasonElement) {
        reasonElement.classList.remove("hidden");
        reasonElement.textContent = data.message;
      }

      if (timerElement) {
        timerElement.textContent = "";
      }
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
function pauseMenu(socket) {
  const resumeButton = document.querySelector(".resume-button");
  const quitButton = document.querySelector(".quit-button");

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
}

function checkForEscape() {
  if (escapePressed) {
    socket.emit("game-paused");
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
  const waitingRoom = app.querySelector(".waiting-room-container");
  waitingRoom.style.display = "grid";
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

}
