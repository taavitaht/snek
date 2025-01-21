// Game state management (updating positions, rendering visuals, etc)
// Communication with server for game updates

import RJNA from "../rjna/engine.js";
import { playerCard } from "../components/waitingRoom.js";
import { startAnimating } from "../misc/animationLoop.js";
import { createMap } from "../components/mapTemplate.js";
import { globalSettings } from "../misc/gameSetting.js";
import { drawFood } from "../components/food.js";
import { escapePressed, resetEscapePressed } from "../misc/input.js";
import {
  drawSnake,
} from "../components/players.js";

export let socket;
let uname;

let snakes = []
export let mySnake;

export function startSockets() {
  const app = document.querySelector(".app");
  // when the user presses join in the waiting room
  const joinUserButton = RJNA.getObjByAttrsAndPropsVal(
    orbital.obj,
    "join-user-button"
  );
  joinUserButton.setProp("onclick", function () {
    let username = app.querySelector(".join-screen #username").value;
    if (username.length == 0) {
      // TODO: also check that name is unique
      return;
    }
    socket = io();
    socket.emit("newuser", username);
    uname = username;
    runSocket();
  });

  // Start game button
  const startGameButton = RJNA.getObjByAttrsAndPropsVal(
    orbital.obj,
    "start-game-button"
  );
  startGameButton.setProp("onclick", function () {
    socket.emit("start-game-button");
  });

  function runSocket() {
    // adds recently joined player-card to the waiting room
    socket.on("waiting", function (userObj) {
      RJNA.getObjByAttrsAndPropsVal(
        orbital.obj,
        "players-waiting-container"
      ).setChild(playerCard(userObj));
      //updatePlayerOrbital(userObj);
      document.querySelector(".players-waiting-counter").innerHTML =  // TODO: this line gives error when joining lobby
        Object.keys(orbital.players).length;
    });

    // retrieves and displays all connected users on recently joined user's waiting room
    socket.on("join-lobby", function (userObj) {
      if (Object.keys(userObj).length != 0)
        if (userObj.username == uname) {
          socket.username = uname;
          socket.playerNumber = userObj.count;
        }
      RJNA.getObjByAttrsAndPropsVal(orbital.obj, "join-screen").removeAttr(
        "class",
        "active",
        ""
      );

      RJNA.getObjByAttrsAndPropsVal(
        orbital.obj,
        "players-waiting-container"
      ).setChild(playerCard(userObj));
      // Create map
      socket.emit("generate-map");
      //updatePlayerOrbital(userObj);
    });

    socket.on("remove-waiting-player", function (count) {
      delete orbital.players[count];
      document.querySelector(`.player-${count}-card`).remove();
      document.querySelector(".players-waiting-counter").innerHTML =
        Object.keys(orbital.players).length;
    });

    // display 10s countdown before game starts
    socket.on("start-game-countdown", function (countdown) {
      const startGameCountdown = app.querySelector(".countdown-container");
      startGameCountdown.classList.remove("waiting");
      startGameCountdown.innerHTML = `Game will start in ${countdown} !`;
    });

    // displays full lobby message on form
    socket.on("connection-limit-reached", function (message) {
      const fullLobbyMessage = RJNA.tag.p(
        { class: "full-lobby-message" },
        {},
        {},
        message
      );
      if (
        document.querySelector(".full-lobby-message") == null ||
        document.querySelector(".full-lobby-message") == undefined
      ) {
        RJNA.getObjByAttrsAndPropsVal(orbital.obj, "form").setChild(
          fullLobbyMessage
        );
      }
      socket.emit("exituser", uname);
      socket.close();
    });

    // Game start
    socket.on("start-game", function (obj) {
      // Create the map
      let map = createMap();
      const gameContainer = document.getElementById("game-container");
      gameContainer.appendChild(map);

      // Hide waiting room
      const waitingRoomContainer = RJNA.getObjByAttrsAndPropsVal(
        orbital.obj,
        "waiting-room-container"
      );
      waitingRoomContainer.removeAttr("style", "", { display: "none" });

      // Begin
      startAnimating(globalSettings.fps);
    });

    // Listen for updated snake positions on the client
    socket.on("tick", function (updatedSnakes, foodArray) {
      console.log("tick", updatedSnakes, foodArray);
      snakes = updatedSnakes;
      updatedSnakes.forEach((snake) => {
        drawSnake(snake);
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
    socket.on("receive-cells", function () {
      socket.emit("update-cells", orbital.cells);
    });

    // Messages on game update display on left of game area
    socket.on("game-update", function (message) {
      let updateMessage;
      switch (message.event) {
        case "player-killed":
          let playerNumber = parseInt(message.playerKilled);
          let deathMessageArr = [
            `${orbital["players"][`${playerNumber}`].name} was caught in  ${orbital["players"][`${message.bomber}`].name
            }'s explosion`,
            `${orbital["players"][`${playerNumber}`].name} GOT MERKED by ${orbital["players"][`${message.bomber}`].name
            }`,
            `${orbital["players"][`${playerNumber}`].name
            } has met Allah!! Thanks  ${orbital["players"][`${message.bomber}`].name
            }`,
            `${orbital["players"][`${message.bomber}`].name} says "RIP ${orbital["players"][`${playerNumber}`].name
            }"`,
            `${orbital["players"][`${playerNumber}`].name
            } sadly passed away- Thanks ${orbital["players"][`${message.bomber}`].name
            }`,
          ];
          let finalDeathMessage = `${orbital["players"][`${message.bomber}`].name
            } has ELIMINATED ${orbital["players"][`${playerNumber}`].name}`;
          if (orbital["players"][`${playerNumber}`].lives != 0) {
            updateMessage = RJNA.createNode(
              RJNA.tag.p(
                { class: "live-updates-message" },
                {},
                {},
                deathMessageArr[
                Math.floor(Math.random() * deathMessageArr.length)
                ]
              )
            );
          } else {
            updateMessage = RJNA.createNode(
              RJNA.tag.p(
                { class: "live-updates-message" },
                {},
                {},
                finalDeathMessage
              )
            );
          }
          break;
      }
      appendLiveUpdateMessage(updateMessage);
    });

    socket.on("game-timer-update", function (data) {
      const gameTimerElement = document.querySelector(".game-updates-container .timer");
      console.log(`timer update: ${data.remainingTime}`);
      if (gameTimerElement) {
        const minutes = Math.floor(data.remainingTime / 60);
        const seconds = Math.floor(data.remainingTime % 60);
        gameTimerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }
    })
    // Disable game end
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

    // start countdown
    socket.on("countdown-update", function (data) {
      const { username, remainingTime } = data;
      console.log(`${username} pause countdown: ${remainingTime} seconds`);

      const container = document.querySelector(".congratulations-container");
      const timerElement = container.querySelector(".pause-timer");
      if (timerElement) {
        timerElement.textContent = `${remainingTime} seconds remaining`;
      }
    });

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
  if (gameUpdatesContainer.childNodes.length != 0) {
    gameUpdatesContainer.insertBefore(
      updateMessage,
      gameUpdatesContainer.firstChild
    );
  } else {
    gameUpdatesContainer.appendChild(updateMessage);
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
