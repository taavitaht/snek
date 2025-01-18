import { globalSettings } from "../misc/gameSetting.js";
import RJNA from "../rjna/engine.js";
import { arrow } from "../misc/input.js";
import { checkForFood } from "../components/food.js";

// TODO: Retrieve player number and starting coordinates from settings based on player number
const initialSnakePosition = [
  { x: 5, y: 5 }, // Head
  { x: 5, y: 4 },
  { x: 5, y: 3 }, // Tail
];

export class Snake {
  constructor(playerNum, initialSnakePosition) {
    this.playerNum = playerNum;
    this.segments = initialSnakePosition;
    // TODO: Direction from settings?
    this.direction = "Right";
  }
  // Method to get coordinates of snake head
  get position() {
    return this.segments[0];
  }
  // Method to update the snake's direction
  setDirection(newDirection) {
    this.direction = newDirection;
  }

  // Method to move the snake
  move() {
    const newHead = { ...this.position }; // Copy the current head position

    // Calculate the new head position based on direction
    if (this.direction === "Left") newHead.x -= 1;
    else if (this.direction === "Right") newHead.x += 1;
    else if (this.direction === "Up") newHead.y -= 1;
    else if (this.direction === "Down") newHead.y += 1;

    // Check for crash
    if (wallCollisionCheck(newHead)) {
      return;
    }
    // Check for food
    const foundFood = checkForFood(newHead);

    // Update the snake's position
    this.segments.unshift(newHead); // Add new head
    if (!foundFood) {
      this.segments.pop(); // Remove the tail if no food was found
    }
  }
}

export const snake = new Snake(1, initialSnakePosition);

// Wall collision check
function wallCollisionCheck(newHead) {
  if (
    newHead.x <= 0 || // Left wall
    newHead.x >= globalSettings.numOfColumns - 1 || // Right wall
    newHead.y <= 0 || // Top wall
    newHead.y >= globalSettings.numOfRows - 1 // Bottom wall
  ) {
    console.error("Snake hit the wall! Game over.");
    return true;
  }
  return false;
}

// Place player on game field
export function placePlayer(number, character, username) {
  const snakeHead = snake.position; // Get initial snake head position
  let topPosition = snakeHead.y * globalSettings.gameSquareSize;
  let leftPosition = snakeHead.x * globalSettings.gameSquareSize;

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

// Manage player movement
export function PlayerMovement(socket) {
  // Prevent movement if there's no valid direction (e.g., no arrow key pressed)
  if (!arrow) return;

  // Set the direction in the Snake instance
  snake.setDirection(arrow);

  // Get the current head position
  const currentHead = snake.position;

  // Calculate the new head position directly inside the `Snake` class's `move` method
  snake.move();

  // Check for food using the new head position
  const foundFood = checkForFood(snake.position);

  // If food was found, the `snake.move()` method already handles growth,
  // so no additional action is needed here.

  // Emit updated position to server
  const moving = {
    myPlayerNum: socket.playerCount,
    row: snake.position.y,
    col: snake.position.x,
  };
  socket.emit("player-movement", moving);

  // Update the snake's visual representation on the screen
  updateSnakeVisual();
}

// Draw snake
function updateSnakeVisual() {
  // Add each segment of the snake to the DOM
  const gameWrapper = document.querySelector(".game-wrapper");

  // Loop through each segment of the snake
  snake.segments.forEach((segment, index) => {
    const segmentElement = document.querySelector(`.snake[data-index="${index}"]`);

    // If the segment does not exist in the DOM, create it
    if (!segmentElement) {
      const newSegmentElement = RJNA.tag.div(
        {
          class: `snake ${index === 0 ? "snake-head" : "snake-body"}`,
          "data-index": index, // Store the index for later reference
          style: {
            transform: `translate(-50%, -50%) translate(${(segment.x + 0.5) * globalSettings.gameSquareSize}px, ${(segment.y + 0.5) * globalSettings.gameSquareSize}px)`,
            width: index === 0 ? `${globalSettings.players.width * 0.9}px` : `${globalSettings.players.width * 0.7}px`,
            height: index === 0 ? `${globalSettings.players.height * 0.9}px` : `${globalSettings.players.height * 0.7}px`,
            position: "absolute",
          },
        },
        {},
        {}
      );
      
      const segmentNode = RJNA.createNode(newSegmentElement);
      gameWrapper.appendChild(segmentNode);
    } else {
      // Update the existing segment's position with the new transform
      segmentElement.style.transform = `translate(-50%, -50%) translate(${(segment.x + 0.5) * globalSettings.gameSquareSize}px, ${(segment.y + 0.5) * globalSettings.gameSquareSize}px)`;
    }
  });
}


// Update player position on the game field
export function movePlayers() {
  // Update the positions of all players, including the snake
  for (let [playerNum, playerObj] of Object.entries(orbital.players)) {
    if (playerNum == snake.playerNum) {
      updateSnakeVisual(); // Special handling for the snake player
    } else {
      const playerElement = document.querySelector(`.player-${playerNum}`);
      if (playerElement) {
        playerElement.style.top =
          playerObj.row * globalSettings.gameSquareSize + "px";
        playerElement.style.left =
          playerObj.col * globalSettings.gameSquareSize + "px";
      }
    }
  }
}
