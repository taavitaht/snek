import { mySnake } from "../public/code.js";

export function makeEndContainer(snakes) {
  // Figure out game end reason and scores
  let highestScore = 0;
  let winners = [];
  let reason = "mp";
  const snakeCount = Object.keys(snakes.serverSnakes).length;

  // Singleplayer (reason is time/wall/snake)
  if (snakeCount == 1) {
    reason = snakes.serverSnakes[1].crashed;
    highestScore = snakes.serverSnakes[1].score;
    winners = [snakes.serverSnakes[1].username];
  }
  // Multiplayer (reason is time/1 snake left)
  else {
    // Get highest score
    Object.values(snakes.serverSnakes).forEach((snake) => {
      if (snake.score > highestScore) {
        highestScore = snake.score;
        if (snake.crashed == "time") {
          reason = "time";
        }
      }
    });
    // Figure out winner(s)
    Object.values(snakes.serverSnakes).forEach((snake) => {
      if (snake.score == highestScore) {
        winners.push(snake.username);
      }
    });
  }

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
  } else if (reason == "mp") {
    endReason.textContent = "No more competitors left";
  }
  endContainer.appendChild(endReason);

  const playerScore = document.createElement("div");
  playerScore.textContent = `Best score: ${highestScore}`;
  endContainer.appendChild(playerScore);

  const winner = document.createElement("div");
  winner.textContent = `Winner(s): ${winners}`;
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
  console.log("EC",endContainer);
  endContainer.remove();
}
