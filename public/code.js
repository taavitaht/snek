// Game state management (updating positions, rendering visuals, etc)
// Communication with server for game updates

import { playerCard } from "../components/waitingRoom.js";
import { startAnimating } from "../misc/animationLoop.js";
import { createMap } from "../components/mapTemplate.js";
import { globalSettings } from "../misc/gameSettings.js";
import { drawFood } from "../components/food.js";
import { escapePressed, resetEscapePressed } from "../misc/input.js";
import { storeSnakes } from "../misc/animationLoop.js";

export let socket;
let uname;
let map;
export let snakes = {};
export let mySnake;
//let allUsernames = [];

export function startSockets() {
  const app = document.querySelector(".app");
  socket = io();
  // when the user presses join in the waiting room
  const joinUserButton = document.getElementById("join-user-button");
  joinUserButton.addEventListener("click", function () {
    // Request all connected usernames from server
    socket.emit("get-all-usernames");

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

// TODO: server full message

    socket.once("all-usernames", (receivedUsernames) => {
      if (receivedUsernames.includes(username)) {
        usernameMessage.textContent = "That username is already taken";
        return;
      }

      uname = username;
      // Add new user to game
      socket.emit("newuser", username);
      runSocket();
    });
  });

  // Start game button
  const startGameButton = document.getElementById("start-game-button");
  startGameButton.addEventListener("click", function () {
    socket.emit("start-game-button");
  });

  function runSocket() {
    // Add recently joined player-card to the waiting room
    socket.on("waiting", function (userObj) {
      const waitingContainer = document.querySelector(
        ".players-waiting-container"
      );
      waitingContainer.appendChild(playerCard(userObj));
    });

    // Retrieves and displays all connected users on recently joined user's waiting room
    socket.on("join-lobby", function (userObj) {
      if (Object.keys(userObj).length != 0)
        if (userObj.username == uname) {
          socket.username = uname;
          socket.playerNumber = userObj.count;
        }
      // Hide join screen
      const joinScreen = document.querySelector(".join-screen");
      joinScreen.style.display = "none";

      // Add new player card
      const waitingContainer = document.querySelector(
        ".players-waiting-container"
      );
      waitingContainer.appendChild(playerCard(userObj));
    });
    // TODO: Rewrite or delete this
    socket.on("remove-waiting-player", function (count) {
      // delete orbital.players[count];
      //document.querySelector(`.player-${count}-card`).remove();
      //document.querySelector(".players-waiting-counter").innerHTML =
      // Object.keys(orbital.players).length;
    });

    // display 10s countdown before game starts
    socket.on("start-game-countdown", function (countdown) {
      const startGameCountdown = app.querySelector(".countdown-container");
      startGameCountdown.classList.remove("waiting");
      startGameCountdown.innerHTML = `Game will start in ${countdown} !`;
    });

    // displays full lobby message on form
    socket.on("connection-limit-reached", function (message) {
      // Create full lobby message
      const fullLobbyMessage = document.createElement("p");
      fullLobbyMessage.classList.add("full-lobby-message");
      fullLobbyMessage.textContent = message;
      if (
        document.querySelector(".full-lobby-message") == null ||
        document.querySelector(".full-lobby-message") == undefined
      ) {
        const form = app.querySelector(".form");
        form.appendChild(fullLobbyMessage);
      }
      socket.close();
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
      console.log("tick", updatedSnakes, foodArray);
      // Send updated snakes to animation engine
      storeSnakes(updatedSnakes);
      Object.values(updatedSnakes).forEach((snake) => {
        //drawSnake(snake);
        if (snake.playerNumber === socket.playerNumber) {
          mySnake = snake;
        }
      });
      drawFood(foodArray);
    });

    socket.on("remove-player", function (userObj) {
      delete orbital.players[userObj.count];
      document.querySelector(`.player-${userObj.count}`).remove();
      document.querySelector(`#player-${userObj.count}-lives`).remove();
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
      console.log(`timer update: ${data.remainingTime}`);
      if (gameTimerElement) {
        const minutes = Math.floor(data.remainingTime / 60);
        const seconds = Math.floor(data.remainingTime % 60);
        gameTimerElement.textContent = `${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }
    });
    // Disable game end TODO: figure out how to handle game end
    /*
    socket.on("end-game", function (winner) {
      function startTimer(duration, display) {
        var timer = duration, minutes, seconds;
        setInterval(function () {
          minutes = parseInt(timer / 60, 10);
          seconds = parseInt(timer % 60, 10);

          minutes = minutes < 10 ? "0" + minutes : minutes;
          seconds = seconds < 10 ? "0" + seconds : seconds;

          display.textContent = minutes + ":" + seconds;

          if (--timer < 0) {
            // for refresh webpage
            window.location.reload()
            timer = duration;
          }
        }, 1000);
      }
      const congratulations = document.querySelector(".congratulations-container")
      if (congratulations.childElementCount == 0) {
        switch (winner.event) {
          case "draw":
            congratulations.innerHTML += `
            <div class="wrapper">
              <div class="modal modal--congratulations">
                <div class="modal-top">
                  <img class="modal-icon u-imgResponsive" src="https://emojiisland.com/cdn/shop/products/Emoji_Icon_-_Sad_Emoji_grande.png?v=1571606093" alt="Trophy" />
                  <div class="modal-header">Welp Your All Dead</div>
                  <div class="modal-subheader"> !!Have Fun with That!!!</div>
                  <div class="modal-subheader">The window will reload in:</div>
                  <div class="end-timer"></div>
                </div>
              </div>
            </div>`
            break
          case "winner":
            congratulations.innerHTML += `
            <div class="wrapper">
              <div class="modal modal--congratulations">
                <div class="modal-top">
                  <div class="modal-header">Congratulations ${winner.name} (player-${winner.playerNum})</div>
                  <img class="modal-icon u-imgResponsive" src="https://static.vecteezy.com/system/resources/previews/009/315/016/original/winner-trophy-in-flat-style-free-png.png" alt="Trophy" />
                  <div class="modal-subheader"> !!You Are The Last Man Standing!!!</div>
                  <div class="modal-subheader">The window will reload in:</div>
                  <div class="end-timer"></div>
                </div>
              </div>
            </div>`
            break
        }
      }
      changeStopValue()
      congratulations.classList.remove("hidden")
      startTimer(10, document.querySelector(".end-timer"))
    });

    */

    socket.on("game-status-update", function (data) {
      console.log(
        `[CLIENT] Game status updated: ${data.status} by ${data.username}`
      );
      const container = document.querySelector(".congratulations-container");
      const timerElement = container.querySelector(".pause-timer");
      if (!container) return;
      switch (data.status) {
        case "paused":
          container.classList.remove("hidden");
          container.querySelector("h1").textContent = `${data.message}`;
          if (timerElement) {
            timerElement.textContent = "60 seconds remaining";
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
          //TODO: AUTOMATICALLY AFTER COUPLE OF SECONDS REDIRECT TO MAIN LOBBY or disconnect?
          break;
        case "restart":
          // TODO: Implement restart logic
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
      const { username, remainingTime } = data;
      console.log(`${username} pause countdown: ${remainingTime} seconds`);

      const container = document.querySelector(".congratulations-container");
      const timerElement = container.querySelector(".pause-timer");
      if (timerElement) {
        timerElement.textContent = `${remainingTime} seconds remaining`;
      }
    });

    // TODO: popup message for pause-rejected w/o buttons?
    socket.on("pause-rejected", (data) => {
      const container = document.querySelector(".congratulations-container");
      const reasonElement = container.querySelector(".pause-reason");
      if (!reasonElement) return;

      reasonElement.textContent = data.reason;

      container.classList.remove("hidden");
      reasonElement.classList.remove("hidden");
      // for testing, later popup msg, but the user still should have the options to quit or restart? mby move buttons somewhere else
      setTimeout(() => {
        container.classList.add("hidden");
        reasonElement.classList.add("hidden");
      }, 3000);
    });

    socket.on("username-taken", function (msg) {
      const errorElement = document.getElementById("username-taken");
      if (errorElement) {
        errorElement.textContent = msg;
      }
    });

    socket.on("resume-countdown", function (data) {
      const container = document.querySelector(".congratulations-container");
      const reasonElement = container.querySelector(".pause-reason");

      if (reasonElement) {
        reasonElement.textContent = data.message;
      }

      const timerElement = container.querySelector(".pause-timer");
      if (timerElement) {
        timerElement.textContent = "";
      }
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
      console.log("[CLIENT] Resume button clicked -> Emitting 'game-resumed'");
      socket.emit("game-resumed");
    });
  }

  if (quitButton) {
    quitButton.addEventListener("click", () => {
      console.log("[CLIENT] Quit button clicked -> Emitting 'game-quit'");
      socket.emit("game-quit");
    });
  }
}

function checkForEscape() {
  if (escapePressed) {
    console.log("[CLIENT] 'escapePressed' is true -> Emitting 'game-paused'");
    socket.emit("game-paused");
    resetEscapePressed();
  }
  requestAnimationFrame(checkForEscape);
}
