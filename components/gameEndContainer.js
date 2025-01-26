import { mySnake } from "../public/code.js";

export function makeEndContainer(snakes) {
  // Figure out game end reason and scores
  let highestScore = 0;
  let highestSteps = 0;
  let winners = [];
  let reason = "";
  const snakeCount = Object.keys(snakes.serverSnakes).length;

  // Singleplayer (reason is time/wall/snake)
  if (snakeCount == 1) {
    console.log("Single player");
    reason = snakes.serverSnakes[1].crashed;
    highestScore = snakes.serverSnakes[1].score;
    winners = [snakes.serverSnakes[1].username];
  }
  // Multiplayer (reason is time/1(0) snake left)
  else {
    console.log("Multiplayer");
    // If time runs out
    Object.values(snakes.serverSnakes).forEach((snake) => {
      // Loop snakes that made it until the time ran out
      if (snake.crashed == "time") {
        reason = "time";
        if (snake.score > highestScore) {
          highestScore = snake.score;
        }
      }
    });

    // Winner is living snake(s) with highest score
    if (reason == "time") {
      console.log("Time");
      Object.values(snakes.serverSnakes).forEach((snake) => {
        if (snake.score == highestScore && snake.crashed == "time") {
          winners.push(snake.username);
        }
      });
    }
    // All (but one) crashed before time ran out. Winner is last survivor(s)
    else {
      console.log("Crashed before time ran out");
      // Did 1 snake not crash before time ran out?
      Object.values(snakes.serverSnakes).forEach((snake) => {
        if (highestScore < snake.score) {
          highestScore = snake.score;
        }
        // If 1 snake left alive
        if (!snake.crashed) {
          highestScore = snake.score;
          winners.push(snake.username);
          reason = "last";
        }
      });

      // If multiple snakes crashed on last game tick, get ones with highest steps values
      if (!reason) {
        Object.values(snakes.serverSnakes).forEach((snake) => {
          if (snake.steps > highestSteps) {
            highestSteps = snake.steps;
          }
        });
        // Figure out winners
        Object.values(snakes.serverSnakes).forEach((snake) => {
          if (snake.steps == highestSteps) {
            winners.push(snake.username);
            reason = "tie";
          }
        });
      }
    }
  }
  console.log("Reason: " + reason);
  // Create the container element
  const endContainer = document.createElement("div");
  endContainer.classList.add("end-container");

  // Add the container to the document body or another parent element
  const mainContainer = document.querySelector(".main-container");
  mainContainer.appendChild(endContainer);

  // Add child elements (optional, to populate grid areas)
  const endTitle = document.createElement("div");
  endTitle.textContent = "Game Over!";
  endContainer.appendChild(endTitle);

  const endReason = document.createElement("div");
  endReason.style.gridArea = "end-reason";
  if (reason == "time") {
    endReason.textContent = "Ran out of time";
  } else if (reason == "wall") {
    endReason.textContent = "You crashed into a wall";
  } else if (reason == "itself") {
    endReason.textContent = "You crashed into yourself";
  } else if (reason == "last") {
    endReason.textContent = "One Snake Remained";
  } else if (reason == "tie") {
    endReason.textContent = "DRAW!";
  }
  endContainer.appendChild(endReason);

  const playerScore = document.createElement("div");
  playerScore.textContent = `Best score: ${highestScore}`;
  endContainer.appendChild(playerScore);

  const winner = document.createElement("div");
  if (reason != "tie") {
  winner.textContent = `Winner: ${winners}`;
  } else {
    winner.textContent = `Tie between: ${winners}`;
  }
  endContainer.appendChild(winner);

  // Did I win?
  // https://confetti.js.org/
  if (highestScore == mySnake.score) {
    confetti({
      particleCount: 500,
      spread: 90,
      origin: { x: 0.25, y: 0.6 },
      angle: 120,
    });
    confetti({
      particleCount: 500,
      spread: 90,
      origin: { x: 0.75, y: 0.6 },
      angle: 70,
    });
    confetti({
      particleCount: 500,
      spread: 90,
      origin: { x: 0.25, y: 0.7 },
      angle: 120,
    });
    confetti({
      particleCount: 500,
      spread: 90,
      origin: { x: 0.75, y: 0.7 },
      angle: 70,
    });
  }
}

// Remove end container from DOM
export function removeEndContainer() {
  const endContainer = document.querySelector(".end-container");
  if (endContainer) {
    endContainer.remove();
  }
}
