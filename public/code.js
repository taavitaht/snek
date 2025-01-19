import RJNA from "../rjna/engine.js";
import { playerCard } from "../components/waitingRoom.js";
import { movePlayers, updateSnakeVisual } from "../components/players.js";
import { startAnimating } from "../misc/script.js";
import { createMap } from "../components/mapTemplate.js";
import { globalSettings } from "../misc/gameSetting.js";
import { placeFood } from "../components/food.js";
import { escapePressed, resetEscapePressed } from "../misc/input.js";

export let socket;
let uname;

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
      updatePlayerOrbital(userObj);
      document.querySelector(".players-waiting-counter").innerHTML =
        Object.keys(orbital.players).length;
    });

    // retrieves and displays all connected users on recently joined user's waiting room
    socket.on("join-lobby", function (userObj) {
      if (Object.keys(userObj).length != 0)
        if (userObj.username == uname) {
          socket.username = uname;
          socket.playerCount = userObj.count;
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
      updatePlayerOrbital(userObj);
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

    // draw map with all connected players and start game
    socket.on("start-game", function (obj) {
      orbital.cells = obj.cells;
      let map = createMap(obj.cells);
      let gameContainer = RJNA.getObjByAttrsAndPropsVal(
        orbital.obj,
        "game-container"
      );
      //console.log(orbital.cells);
      gameContainer.setChild(map);
      const gameWrapper = gameContainer.children[0];
      updateSnakeVisual();
      /*for (const player of obj.allPlayers) {
        switch (player.count) {
          case 1:
            gameWrapper.setChild(placePlayer(1, "one", player.username));
            break;
          case 2:
            gameWrapper.setChild(placePlayer(2, "ghost", player.username));
            break;
          case 3:
            gameWrapper.setChild(placePlayer(3, "lad", player.username));
            break;
          case 4:
            gameWrapper.setChild(placePlayer(4, "wario", player.username));
            break;
        }
      }*/

      const waitingRoomContainer = RJNA.getObjByAttrsAndPropsVal(
        orbital.obj,
        "waiting-room-container"
      );
      waitingRoomContainer.removeAttr("style", "", { display: "none" });
      startAnimating(globalSettings.fps);

      // Place food on the gamefield
      for (let i = 0; i < globalSettings.food.count; i++) {
        placeFood();
      }
    });

    socket.on("player-moving", function (obj) {
      for (let [key, value] of Object.entries(obj)) {
        if (key != "myPlayerNum") {
          orbital.players[obj.myPlayerNum][key] = value;
        }
      }
      // movePlayers();
      //checkFood();
    });

    socket.on("remove-player", function (userObj) {
      delete orbital.players[userObj.count];
      document.querySelector(`.player-${userObj.count}`).remove();
      document.querySelector(`#player-${userObj.count}-lives`).remove();
    });
    socket.on("receive-cells", function () {
      socket.emit("update-cells", orbital.cells);
    });

    socket.on("game-update", function (message) {
      let updateMessage;
      switch (message.event) {
        case "player-killed":
          let playerNumber = parseInt(message.playerKilled);
          let deathMessageArr = [
            `${orbital["players"][`${playerNumber}`].name} was caught in  ${
              orbital["players"][`${message.bomber}`].name
            }'s explosion`,
            `${orbital["players"][`${playerNumber}`].name} GOT MERKED by ${
              orbital["players"][`${message.bomber}`].name
            }`,
            `${
              orbital["players"][`${playerNumber}`].name
            } has met Allah!! Thanks  ${
              orbital["players"][`${message.bomber}`].name
            }`,
            `${orbital["players"][`${message.bomber}`].name} says "RIP ${
              orbital["players"][`${playerNumber}`].name
            }"`,
            `${
              orbital["players"][`${playerNumber}`].name
            } sadly passed away- Thanks ${
              orbital["players"][`${message.bomber}`].name
            }`,
          ];
          let finalDeathMessage = `${
            orbital["players"][`${message.bomber}`].name
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
        case "cannot-drop-bomb":
          if (socket.playerCount == message.playerCount)
            updateMessage = RJNA.createNode(
              RJNA.tag.p(
                { class: "live-updates-message" },
                {},
                {},
                "Soz!! you cannot drop a bomb rn!!!!"
              )
            );
      }
      appendLiveUpdateMessage(updateMessage);
    });

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
          //TODO: AUTOMATICALLY AFTER COUPLE OF SECONDS REDIRECT TO MAIN LOBBY
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
    });

    socket.on("username-taken", function (msg) {
      const errorElement = document.getElementById("username-taken");
      if (errorElement) {
        errorElement.textContent = msg;
      }
    });

    requestAnimationFrame(checkForEscape);
  }
}

function updatePlayerOrbital(userObj) {
  orbital["players"][`${userObj["count"]}`] = {
    name: userObj.username,
    _lives: 3, // Add the underlying property _lives to store the actual value
    "power-ups": [],
    numOfBombs: 1,
    immune: false,
  };
  Object.defineProperty(orbital["players"][`${userObj["count"]}`], "lives", {
    get: function () {
      return this._lives; // Return the value from the underlying property _lives
    },
    set: function (v) {
      let playerLives = document.querySelector(
        `#player-${userObj["count"]}-lives`
      );
      this._lives = v; // Update the value of the underlying property _lives
      if (playerLives !== undefined && playerLives !== null) {
        const lifeElements = playerLives.children[0].children;
        if (this._lives < lifeElements.length && lifeElements.length > 0) {
          Array.from(lifeElements).shift().remove();
        } else if (
          this._lives > lifeElements.length &&
          lifeElements.length > 0
        ) {
          // Code to add new life elements if needed.
        } else {
          // Code to handle other cases or errors.
        }
      } else {
        let lives = Array.from(
          document.querySelector(".lives-container").children[0].children
        );
        if (lives.length > this._lives) {
          lives.shift().remove();
        }
      }
    },
  });

  // coordinates are [row][col]
  switch (userObj.count) {
    case 1:
      orbital["players"][`${userObj["count"]}`]["row"] = 1;
      orbital["players"][`${userObj["count"]}`]["col"] = 1;
      break;
    case 2:
      orbital["players"][`${userObj["count"]}`]["row"] = 1;
      orbital["players"][`${userObj["count"]}`]["col"] = 13;
      break;
    case 3:
      orbital["players"][`${userObj["count"]}`]["row"] = 11;
      orbital["players"][`${userObj["count"]}`]["col"] = 13;
      break;
    case 4:
      orbital["players"][`${userObj["count"]}`]["row"] = 11;
      orbital["players"][`${userObj["count"]}`]["col"] = 1;
      break;
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
