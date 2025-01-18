import { placeFood } from "../components/food.js";

export let arrow;
export let escapePressed = false;

document.addEventListener("keydown", arrowKeyHandler, false);
document.addEventListener("keydown", escapeKeyHandler);

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

function escapeKeyHandler(e) {
  if (e.key === "Escape") {
    escapePressed = true;
  }
}

export function resetEscapePressed() {
  escapePressed = false;
}
