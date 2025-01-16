
import { placeFood } from "../components/food.js";

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
