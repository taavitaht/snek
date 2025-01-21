import { globalSettings } from "../misc/gameSetting.js";
import { checkForFood } from "../components/food.js";
import { mapTemplate } from "./mapTemplate.js";

// Snake class
export class Snake {
  constructor(playerNumber, username) {
    this.playerNumber = playerNumber;
    this.username = username;
    this.segments = getInitialSnakePosition(mapTemplate, playerNumber); // Read initial snake position from map
    this.direction = determineDirection(this.segments); // Use segments to determine direction
    this.score = 0;
    this.crashed;
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
    let foundFood = false;

    // Calculate the new head position based on direction
    if (this.direction === "Left") newHead.x -= 1;
    else if (this.direction === "Right") newHead.x += 1;
    else if (this.direction === "Up") newHead.y -= 1;
    else if (this.direction === "Down") newHead.y += 1;

    // Check for crash
    if (wallCollisionCheck(newHead)) {
      this.crashed = "wall";
      return;
    }
    // Check for food
    if (checkForFood(newHead)) {
      foundFood = true;
      this.score++;
    }

    // Update the snake's position
    this.segments.unshift(newHead); // Add new head
    if (!foundFood) {
      this.segments.pop(); // Remove the tail if no food was found
    }
  }
}

// Function to parse the map and sort segments
export function getInitialSnakePosition(mapTemplate, playerNumber) {
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

// Wall collision check
function wallCollisionCheck(newHead) {
  if (
    newHead.x <= 0 || // Left wall
    newHead.x >= globalSettings.numOfColumns - 1 || // Right wall
    newHead.y <= 0 || // Top wall
    newHead.y >= globalSettings.numOfRows - 1 // Bottom wall
  ) {
    //console.error("Snake hit the wall! Game over.");
    return true;
  }
  return false;
}

// Render snake
export function drawSnake(snake) {
  const gameWrapper = document.getElementById("game-wrapper");
  if (!gameWrapper) {
    return;
  }
  // Loop through each segment of the snake
  snake.segments.forEach((segment, index) => {
    // Create a unique ID or data attribute to associate the segment with the DOM element
    const segmentId = `snake-${snake.playerNumber}-segment-${index}`;

    // Check if the segment already exists in the DOM
    let segmentElement = document.getElementById(segmentId);

    // If the segment doesn't exist, create it
    if (!segmentElement) {
      segmentElement = document.createElement("div");
      segmentElement.id = segmentId;
      segmentElement.className = `snake-${snake.playerNumber} ${
        index === 0 ? "snake-head" : "snake-body"
      }`;

      // Set initial styles
      segmentElement.style.position = "absolute";
      segmentElement.style.width =
        index === 0
          ? `${globalSettings.players.width * 0.9}px`
          : `${globalSettings.players.width * 0.7}px`;
      segmentElement.style.height =
        index === 0
          ? `${globalSettings.players.height * 0.9}px`
          : `${globalSettings.players.height * 0.7}px`;
      segmentElement.style.transform = `translate(-50%, -50%) translate(${
        (segment.x + 0.5) * globalSettings.gameSquareSize
      }px, ${(segment.y + 0.5) * globalSettings.gameSquareSize}px)`;

      // Append the segment to the game wrapper
      gameWrapper.appendChild(segmentElement);
    } else {
      // If the segment exists, update its position
      segmentElement.style.transform = `translate(-50%, -50%) translate(${
        (segment.x + 0.5) * globalSettings.gameSquareSize
      }px, ${(segment.y + 0.5) * globalSettings.gameSquareSize}px)`;
    }
  });
}
