// Handle keyboard input

import { socket, mySnake, isPaused } from "../public/code.js";

export let arrow;
export let escapePressed = false;

if (typeof document !== "undefined") {
  document.addEventListener("keydown", arrowKeyHandler);
  document.addEventListener("keydown", escapeKeyHandler);
}

function arrowKeyHandler(e) {
  // Wait until game has begun
  if (!mySnake) {
    return;
  }
  // Do not listen for arrow keys during pause
  if (escapePressed || isPaused) {
    return;
  }

  let isArrowKey = false;
  if (e.key === "Right" || e.key === "ArrowRight") {
    // Ignore direction changes in opposite direction (snake can't start moving into itself)
    if (mySnake.direction === "Left") {
      return;
    }
    // Record new direction
    arrow = "Right";
    isArrowKey = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    if (mySnake.direction === "Right") {
      return;
    }
    arrow = "Left";
    isArrowKey = true;
  } else if (e.key === "Up" || e.key === "ArrowUp") {
    if (mySnake.direction === "Down") {
      return;
    }
    arrow = "Up";
    isArrowKey = true;
  } else if (e.key === "Down" || e.key === "ArrowDown") {
    if (mySnake.direction === "Up") {
      return;
    }
    arrow = "Down";
    isArrowKey = true;
  }

  // If socket is connected emit the keydown event
  if (socket && arrow && isArrowKey) {
    console.log("arrow:", arrow);
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
