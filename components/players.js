import { globalSettings } from "../misc/gameSetting.js";
import RJNA from "../rjna/engine.js";
import { arrow } from "../misc/input.js";
import { checkForFood } from "../components/food.js";
import { mapTemplate } from "./mapTemplate.js";


// TODO: Edit?
//const playerNumber = socket.playerCount;
const playerNumber = 1

// Snake class
export class Snake {
  constructor(playerNumber, initialSnakePosition) {
    this.playerNumber = playerNumber;
    this.segments = initialSnakePosition;
    this.direction = determineDirection(initialSnakePosition);
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

// Function to parse the map and sort segments
function getInitialSnakePosition(mapTemplate, playerNumber) {
  const segments = []; // Complete snake
  let headPosition = null; // Head position
  const bodyPositions = []; // Body positions

  // Parse the map
  for (let y = 0; y < mapTemplate.length; y++) {
    for (let x = 0; x < mapTemplate[y].length; x++) {
      const cell = mapTemplate[y][x];
      if (cell === `${playerNumber}h`) {
        // Cell "1h" is head of snake1
        headPosition = { x, y }; // Store head position
      } else if (cell === `${playerNumber}b`) {
        bodyPositions.push({ x, y }); // Store body position
      }
    }
  }

  if (!headPosition || !bodyPositions) {
    throw new Error(`Snake (${playerNumber}) not found in the map!`);
  }

  // Sort the body positions based on proximity to the head
  const sortedBody = [];
  let currentHead = headPosition;

  while (bodyPositions.length > 0) {
    // Find the closest body segment to the current head
    const closestIndex = bodyPositions.reduce(
      (closestIdx, segment, idx, array) => {
        const dist = calculateDistance(currentHead, segment);
        const closestDist = calculateDistance(currentHead, array[closestIdx]);
        return dist < closestDist ? idx : closestIdx;
      },
      0
    );

    // Add the closest body segment to the sorted array
    sortedBody.push(bodyPositions[closestIndex]);

    // Update currentHead to the newly added body segment
    currentHead = bodyPositions[closestIndex];

    // Remove added closest segment and continue looping
    bodyPositions.splice(closestIndex, 1);
  }

  // Combine the head and sorted body
  segments.push(headPosition, ...sortedBody);

  return segments;
}

// Calculate Manhattan/Taxicab distance
function calculateDistance(pointA, pointB) {
  return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);
}

// Determine initial heading based on closest body element position relative to head
function determineDirection(initialSnakePosition) {
  // Extract head and the first body segment
  const head = initialSnakePosition[0];
  const closestBody = initialSnakePosition[1];

  // Determine the direction based on relative positions
  if (closestBody.x < head.x) {
    return "Right";
  } else if (closestBody.x > head.x) {
    return "Left";
  } else if (closestBody.y < head.y) {
    return "Down";
  } else if (closestBody.y > head.y) {
    return "Up";
  }
}

// Example snake for testing TODO: Edit?
export const snake = new Snake(
  playerNumber,
  getInitialSnakePosition(mapTemplate, playerNumber)
);
//console.log("snake:", snake);

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

// Manage player movement
export function PlayerMovement(socket) {
  // In beginning of game start moving right away
  if (!arrow) {
    // return
    snake.setDirection(snake.direction);
    // Afterwards use arrowkey input
  } else {
    snake.setDirection(arrow);
  }

  // Calculate new head position using Snake class move method
  snake.move();

  // Check for food using the new head position
  checkForFood(snake.position);

  // If food was found, snake.move() handled growth and checkForFood() replaced eaten food

  // Emit updated position to server
  const moving = {
    myPlayerNum: socket.playerCount,
    row: snake.position.y,
    col: snake.position.x,
  };
  socket.emit("player-movement", moving);

  // Draw snake
  updateSnakeVisual();
}

// Draw snake
export function updateSnakeVisual() {
  // Add each segment of the snake to the DOM
  const gameWrapper = document.querySelector(".game-wrapper");

  // Loop through each segment of the snake
  snake.segments.forEach((segment, index) => {
    const segmentElement = document.querySelector(
      `.snake[data-index="${index}"]`
    );

    // If the segment does not exist in the DOM, create it
    if (!segmentElement) {
      const newSegmentElement = RJNA.tag.div(
        {
          class: `snake ${index === 0 ? "snake-head" : "snake-body"}`,
          "data-index": index, // Store the index for later reference
          style: {
            transform: `translate(-50%, -50%) translate(${
              (segment.x + 0.5) * globalSettings.gameSquareSize
            }px, ${(segment.y + 0.5) * globalSettings.gameSquareSize}px)`,
            width:
              index === 0
                ? `${globalSettings.players.width * 0.9}px`
                : `${globalSettings.players.width * 0.7}px`,
            height:
              index === 0
                ? `${globalSettings.players.height * 0.9}px`
                : `${globalSettings.players.height * 0.7}px`,
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
      segmentElement.style.transform = `translate(-50%, -50%) translate(${
        (segment.x + 0.5) * globalSettings.gameSquareSize
      }px, ${(segment.y + 0.5) * globalSettings.gameSquareSize}px)`;
    }
  });
}

// Update player position on the game field
export function movePlayers() {
  // Update the positions of all snakes
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
