export let arrow;

document.addEventListener("keydown", arrowKeyHandler, false);

function arrowKeyHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    if (arrow != "Left") {
      arrow = "Right";
    }
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    if (arrow != "Right") {
      arrow = "Left";
    }
  } else if (e.key == "Up" || e.key == "ArrowUp") {
    if (arrow != "Down") {
      arrow = "Up";
    }
  } else if (e.key == "Down" || e.key == "ArrowDown") {
    if (arrow != "Up") {
      arrow = "Down";
    }
  } else if (e.key == "F" || e.key == "f") {
    placeFood();
  }
}





import RJNA from "../rjna/engine.js";
import { globalSettings } from "../misc/gameSetting.js";

function placeFood() {
console.log("place food");
    let food = RJNA.tag.div(
      {
        class: `food`,
        style: {
          top: (Math.floor(Math.random() * (globalSettings.numOfRows - 2)) + 1) * globalSettings.gameSquareSize + "px",
          left: (Math.floor(Math.random() * (globalSettings.numOfColumns - 2)) + 1) * globalSettings.gameSquareSize + "px",
          width: `${globalSettings["food"]["width"]}px`,
          height: `${globalSettings["food"]["height"]}px`,
          position: "absolute",
        },
      },
      {},
      {},
      RJNA.tag.img(
        {
          style: {
            width: "100%",
            height: "100%",
            zIndex: 999,
          },
        },
        {},
        { src: globalSettings["food"]["src"] }
      )
    );

    let foodElement = RJNA.createNode(food);

    let gameWrapper = document.querySelector(".game-wrapper");
    gameWrapper.appendChild(foodElement);
}
