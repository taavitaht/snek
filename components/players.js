import { globalSettings } from "../misc/gameSetting.js";
import RJNA from "../rjna/engine.js";
import { arrow } from "../misc/input.js";
import { checkForFood } from "../components/food.js";

export function placePlayer(number, character, username) {
  let topPosition =
    orbital["players"][`${number}`]["row"] * globalSettings.gameSquareSize;
  let leftPosition =
    orbital["players"][`${number}`]["col"] * globalSettings.gameSquareSize;
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
  //console.log("moving = ", JSON.stringify(moving));

  // Move according to button
  if (arrow == "Left") {
    // If crashing into wall do not move further
    if (moving.col == 1) { return; } 
    moving.col = moving.col - 1;
    socket.emit("player-movement", moving);
  } else if (arrow == "Right") {
    if (moving.col == globalSettings.numOfColumns - 2) { return; }
    moving.col = moving.col + 1;
    socket.emit("player-movement", moving);
  } else if (arrow == "Up") {
    if (moving.row == 1) { return; }
    moving.row = moving.row - 1;
    socket.emit("player-movement", moving);
  } else if (arrow == "Down") {
    if (moving.row == globalSettings.numOfRows - 2) { return; }
    moving.row = moving.row + 1;
    socket.emit("player-movement", moving);
  }
  // If player moved check for food

checkForFood(moving);

}

export function movePlayers() {
  for (let [playerNum, playerObj] of Object.entries(orbital.players)) {
    document.querySelector(`.player-${playerNum}`).style.top =
      playerObj.row * globalSettings.gameSquareSize + "px";
    document.querySelector(`.player-${playerNum}`).style.left =
      playerObj.col * globalSettings.gameSquareSize + "px";
    //console.log("Player row and col:", playerObj.row, playerObj.col);
  }
}
