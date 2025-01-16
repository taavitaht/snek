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
    placeBomb();
  }
}





import RJNA from "../rjna/engine.js";
import { globalSettings } from "../misc/gameSetting.js";

function placeBomb() {
console.log("placeBomb");
    let bomb = RJNA.tag.div(
      {
        class: `bomb`,
        style: {
          top: 5 * globalSettings.wallHeight + "px",
          left: 5 * globalSettings.wallWidth + "px",
          width: `${globalSettings["bomb"]["width"]}px`,
          height: `${globalSettings["bomb"]["height"]}px`,
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
        { src: globalSettings["bomb"]["src"] }
      )
    );

    let bombElement = RJNA.createNode(bomb);

    let gameWrapper = document.querySelector(".game-wrapper");
    gameWrapper.appendChild(bombElement);
}
