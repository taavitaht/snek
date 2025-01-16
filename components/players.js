import { globalSettings } from "../misc/gameSetting.js";
import RJNA from "../rjna/engine.js";
import { arrow } from "../misc/input.js";


export function placePlayer(number, character, username) {
  let topPosition =
    orbital["players"][`${number}`]["row"] * globalSettings.wallHeight;
  let leftPosition =
    orbital["players"][`${number}`]["col"] * globalSettings.wallWidth;
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
export function PlayerMovement(socket) {
  let moving = {
    myPlayerNum: socket.playerCount,
    row: orbital["players"][`${socket.playerCount}`]["row"],
    col: orbital["players"][`${socket.playerCount}`]["col"],
  };

  // Move according to button
  if (
    arrow == "Left"
  ) {
    moving.col = parseFloat((moving.col - orbital["players"][`${socket.playerCount}`]["speed"]).toFixed(2));
    socket.emit("player-movement", moving);
  } else if (
    arrow == "Right"
  ) {
    moving.col = parseFloat((moving.col + orbital["players"][`${socket.playerCount}`]["speed"]).toFixed(2));
    socket.emit("player-movement", moving);
  } else if (
    arrow == "Up"
  ) {
    moving.row = parseFloat((moving.row - orbital["players"][`${socket.playerCount}`]["speed"]).toFixed(2));
    socket.emit("player-movement", moving);
  } else if (
    arrow == "Down"
  ) {
    moving.row = parseFloat((moving.row + orbital["players"][`${socket.playerCount}`]["speed"]).toFixed(2));
    socket.emit("player-movement", moving);
  }
}



export function movePlayers() {
  for (let [playerNum, playerObj] of Object.entries(orbital.players)) {
    document.querySelector(`.player-${playerNum}`).style.top =
    playerObj.row * globalSettings.wallHeight + "px";
    document.querySelector(`.player-${playerNum}`).style.left =
      playerObj.col * globalSettings.wallWidth + "px";
      console.log("Player row and col:", playerObj.row, playerObj.col);
  }
}
