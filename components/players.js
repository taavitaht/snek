import { globalSettings } from "../misc/gameSetting.js";
import RJNA from "../rjna/engine.js";
import {
  leftPressed,
  rightPressed,
  upPressed,
  downPressed,
  falseKeyBool,
  bombDropped,
} from "../misc/input.js";
import {
  checkWallCollision,
  touchExplosion
} from "../misc/collision.js";

export function placePlayer(number, character, username) {
  let topPosition =
    orbital["players"][`${number}`]["row"] * globalSettings.wallHeight +
    globalSettings.wallHeight * 0.1;
  let leftPosition =
    orbital["players"][`${number}`]["col"] * globalSettings.wallWidth +
    globalSettings.wallWidth * 0.1;
  return RJNA.tag.div(
    {
      class: `player-${number}`,
      style: {
        top: topPosition + "px",
        left: leftPosition + "px",
        width: `${globalSettings.players.width}px`,
        height: `${globalSettings.players.height}px`,
      },
    },
    {},
    {},
    RJNA.tag.p({}, {}, {}, username),
    RJNA.tag.img(
      {
        style: {
          width: "100%",
          height: "100%",
        },
      },
      {},
      { src: globalSettings.players[character] }
    )
  );
}
let isTouchingExplosion = false
export function PlayerMovement(socket) {
  let moving = {
    myPlayerNum: socket.playerCount,
    row: orbital["players"][`${socket.playerCount}`]["row"],
    col: orbital["players"][`${socket.playerCount}`]["col"],
    flames: orbital["players"][`${socket.playerCount}`]["flames"] || globalSettings.flames.normal,
    bombs: orbital["players"][`${socket.playerCount}`]["bombs"] || globalSettings.bombs.normal,
  };
  //drop player's bomb when they press 'w'
  if (bombDropped) {
    falseKeyBool("bombs-dropped");
    //send to everyone bomb has been dropped
    socket.emit("drop-bomb", moving);
    moving.flames = globalSettings.flames.normal
  }
  // move when the button is pressed and the next block is empty
  if (
    leftPressed &&
    !checkWallCollision("left", socket.playerCount, orbital["players"][`${socket.playerCount}`]["speed"])
  ) {
    moving.col = parseFloat((moving.col - orbital["players"][`${socket.playerCount}`]["speed"]).toFixed(2));
    socket.emit("player-movement", moving);
  } else if (
    rightPressed &&
    !checkWallCollision("right", socket.playerCount, orbital["players"][`${socket.playerCount}`]["speed"])
  ) {
    moving.col = parseFloat((moving.col + orbital["players"][`${socket.playerCount}`]["speed"]).toFixed(2));
    socket.emit("player-movement", moving);
  } else if (
    upPressed &&
    !checkWallCollision("up", socket.playerCount, orbital["players"][`${socket.playerCount}`]["speed"])
  ) {
    moving.row = parseFloat((moving.row - orbital["players"][`${socket.playerCount}`]["speed"]).toFixed(2));
    socket.emit("player-movement", moving);
  } else if (
    downPressed &&
    !checkWallCollision("down", socket.playerCount, orbital["players"][`${socket.playerCount}`]["speed"])
  ) {
    moving.row = parseFloat((moving.row + orbital["players"][`${socket.playerCount}`]["speed"]).toFixed(2));
    socket.emit("player-movement", moving);
  }


  const touchingExplosion = touchExplosion(moving);
  // Check if touchExplosion is true and the event hasn't been emitted yet
  if (touchingExplosion && !isTouchingExplosion && !orbital["players"][`${touchingExplosion.playerKilled}`].immune) {
    // Set the flag to true to prevent further requests
    isTouchingExplosion = true;

    // Emit the "player-killed" event
    socket.emit("player-killed", touchingExplosion);

    setTimeout(() => {
      isTouchingExplosion = false;
    }, 67);

    moving = resetMovingCoords(moving.myPlayerNum);
    socket.emit("player-movement", moving);
  }
}



export function movePlayers() {
  for (let [playerNum, playerObj] of Object.entries(orbital.players)) {
    document.querySelector(`.player-${playerNum}`).style.top =
      playerObj.row * globalSettings.wallHeight +
      globalSettings.wallHeight * 0.1 +
      "px";
    document.querySelector(`.player-${playerNum}`).style.left =
      playerObj.col * globalSettings.wallWidth +
      globalSettings.wallWidth * 0.1 +
      "px";
  }
}

function resetMovingCoords(count) {
  let moving = {
    myPlayerNum: count,
    speed: globalSettings.speed.normal,
    flames: globalSettings.flames.normal,
    bombs: globalSettings.bombs.normal,
    immune: true
  }
  switch (count) {
    case 1:
      moving.row = 1;
      moving.col = 1;
      break;
    case 2:
      moving.row = 1;
      moving.col = 13;
      break;
    case 3:
      moving.row = 11;
      moving.col = 13;
      break;
    case 4:
      moving.row = 11;
      moving.col = 1;
      break;
  }
  return moving
}
