// Handle keyboard input

import { socket } from "../public/code.js";

export let arrow;
export let escapePressed = false;

document.addEventListener("keydown", arrowKeyHandler, false);
document.addEventListener("keydown", escapeKeyHandler);

function arrowKeyHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    // Ignore direction changes in opposite direction (snake can't start moving into itself)
    if (arrow == "Left") {
      return;
    }
    // Record new direction
    arrow = "Right";
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    if (arrow == "Right") {
      return;
    }
    arrow = "Left";
  } else if (e.key == "Up" || e.key == "ArrowUp") {
    if (arrow == "Down") {
      return;
    }
    arrow = "Up";
  } else if (e.key == "Down" || e.key == "ArrowDown") {
    if (arrow == "Up") {
      return;
    }
    arrow = "Down";
  }
  // If socket is connected emit the keydown event
  if (socket) {
    socket.emit("keypress", arrow);
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
