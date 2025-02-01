import { calculateDistance } from "./snakes.js";
import { globalSettings } from "../misc/gameSettings.js";
import { Snake } from "./snakes.js";

let botSnake;
let allFoods;
let allSnakes;
let newDirection;
let newSnake;
let lethalTurns = [];
const directions = ["Up", "Down", "Left", "Right"];

// Goto function that loops all bot snakes for their next move
export function moveAllBots(updatedSnakes, foodArray) {
  allSnakes = updatedSnakes;
  allFoods = foodArray;
  // Loop all snakes
  for (let i = 1; i <= 4; i++) {
    // Loop all bots
    if (updatedSnakes[i] && updatedSnakes[i].isBot === true) {
      // Move each bot snake
      botSnake = updatedSnakes[i];
      moveBot(botSnake);
    }
  }
}

// Move 1 bot snake
function moveBot(botSnake) {
  lethalTurns = [];
  newDirection = botSnake.direction;

  if (!botSnake || botSnake.crashed) return;

  // Find next moves that will be lethal for bot
  lethalTurns = findLethalTurns(botSnake);

  // Find best food to move towards
  const target = findClosestFood(botSnake);

  if (target) {
    // Distance from target on both axes
    let deltaX = Math.abs(target.x - botSnake.position.x);
    let deltaY = Math.abs(target.y - botSnake.position.y);

    // Start moving towards the target
    // If x axis delta is larger
    if (deltaX > deltaY) {
      // First try to change x direction
      if (!xTurn(botSnake, target)) {
        // If no good moved try to change y direction
        if (!yTurn(botSnake, target)) {
          // If still no good move avoid crashing immediately
          //doNotCrashImmediately(botSnake);
        }
      }
    }
    // If y direction needs to be adjusted more
    if (deltaX < deltaY) {
      if (!yTurn(botSnake, target)) {
        if (!xTurn(botSnake, target)) {
          //doNotCrashImmediately(botSnake);
        }
      }
    }
  } else {
    console.log("Did not find any suitable food items on map");
  }

  // Avoid crashing on next step no matter what
  doNotCrashImmediately(botSnake);

  botSnake.direction = newDirection;
}

// Find random move that avoids collision
function doNotCrashImmediately(botSnake) {
  let safeMoves = [];
  // If this move leads to crash
  if (!checkTurn(botSnake, newDirection)) {
    let color;
    if (botSnake.playerNumber === 1) color = 2;
    if (botSnake.playerNumber === 2) color = 4;
    if (botSnake.playerNumber === 3) color = 1;
    if (botSnake.playerNumber === 4) color = 3;
    console.log(`\x1b[3${color}mGoing to crash!\x1b[0m`);

    // Check all 4 directions
    directions.forEach((direction) => {
      if (checkTurn(botSnake, direction)) {
        safeMoves.push(direction);
      }
    });

    if (safeMoves.length > 0) {
      newDirection = safeMoves[Math.floor(Math.random() * safeMoves.length)];
    } else {
      //console.log("No possible moves available! Bot is trapped.");
    }
  }
}

// Find turns that will end badly
function findLethalTurns(botSnake) {
  // Find moves that will result in immediate collision
  directions.forEach((direction) => {
    if (!checkTurn(botSnake, direction)) {
      lethalTurns.push(direction);
    }
  });

  if (botSnake.movementLevel === "hard") {
    // Find directions that will end up boxing bot in after more steps in a direction
    dontGetCornered(botSnake);
  }

  // Console log lethal turns based on snake color
  let color;
  if (botSnake.playerNumber === 1) color = 2;
  if (botSnake.playerNumber === 2) color = 4;
  if (botSnake.playerNumber === 3) color = 1;
  if (botSnake.playerNumber === 4) color = 3;
  console.log(`\x1b[3${color}mlethalTurns: ${lethalTurns}\x1b[0m`);

  return lethalTurns;
}

// Find moves that will end up boxing snake in
function dontGetCornered(botSnake) {
  let localLethalTurns = [...lethalTurns]; // Avoid modifying global lethalTurns

  // Check all available directions (not already lethal)
  directions.forEach((direction) => {
    if (!localLethalTurns.includes(direction)) {
      // Create a new simulated snake instance
      let simSnake = new Snake(botSnake.playerNumber, botSnake.username);
      simSnake.segments = JSON.parse(JSON.stringify(botSnake.segments)); // Copy current segments
      simSnake.setDirection(direction);

      // Run simulation for 1 direction
      if (!simulateBoxIn(simSnake)) {
        // If the direction leads to a box-in, mark it as lethal
        lethalTurns.push(direction);
      }
    }
  });

  // Think a few steps ahead
  function simulateBoxIn(simSnake) {
    const steps = 5; // Number of steps to simulate
    
    for (let i = 0; i < steps; i++) {
      localLethalTurns = [];

      // Move the simulated snake
      simSnake.moveWithoutEating();

      // Check all 4 directions around new location
      directions.forEach((direction) => {
        if (!checkTurn(simSnake, direction)) {
          localLethalTurns.push(direction);
        }
      });

      // Continue based on obtained lethal moves list
      let blockedLeftRight =
      localLethalTurns.includes("Left") && localLethalTurns.includes("Right");
      let blockedUpDown =
      localLethalTurns.includes("Up") && localLethalTurns.includes("Down");

      // If two opposite sides are blocked, there is possibility of a dead end, check further
      if (blockedLeftRight || blockedUpDown) {
        console.log(`"${simSnake.direction}" might be a box-in`);

        // If all 4 directions are lethal, it's a dead-end
        if (
          localLethalTurns.includes("Up") &&
          localLethalTurns.includes("Down") &&
          localLethalTurns.includes("Left") &&
          localLethalTurns.includes("Right")
        ) {
          console.log(`"${simSnake.direction}" leads to a DEAD END!`);
          return false;
        }
      } else {
        // If either side becomes free at any step, simulated direction is safe
        `"${simSnake.direction}" is not a box-in`;
        return true;
      }
    }

    return true; // If simSnake never gets trapped within x steps
  }
}

// Correct x heading. Return true and set new direction if found
function xTurn(botSnake, target) {
  if (botSnake.position.x > target.x && botSnake.position.x !== target.x) {
    // Need to turn left
    if (checkTurn(botSnake, "Left")) {
      newDirection = "Left";
      return true;
    }
  } else {
    if (checkTurn(botSnake, "Right")) {
      newDirection = "Right";
      return true;
    }
  }
  return false;
}

// Correct y heading
function yTurn(botSnake, target) {
  if (botSnake.position.y > target.y && botSnake.position.y !== target.y) {
    if (checkTurn(botSnake, "Up")) {
      newDirection = "Up";
      return true;
    }
  } else {
    if (checkTurn(botSnake, "Down")) {
      newDirection = "Down";
      return true;
    }
  }
  return false;
}

// Check possible turn for only next move
function checkTurn(botSnake, newDirection) {
  // Not allowed to start moving into itself
  if (!uTurn(botSnake, newDirection)) {
    return false;
  }

  // Get coordinates after possible move
  newSnake = getNewPosition(botSnake, newDirection);
  // Check if new position is outside the field or collides with a snake
  if (!wallCollisionCheck(newSnake) || !snakeCollisionCheck(newSnake)) {
    return false;
  }
  // If turn is ok return true
  return true;
}

function findClosestFood(botSnake) {
  let closestFood = null;
  let minDistance = Infinity;

  allFoods.forEach((food) => {
    // Depending on snake targeting level filter and find closest food
    if (
      (botSnake.targetingLevel === "hard" &&
        foodIsAccessible(food) &&
        foodIsNotObstructed(food)) ||
      (botSnake.targetingLevel === "medium" && foodIsAccessible(food)) ||
      botSnake.targetingLevel === "easy"
    ) {
      // Calculate the distance between the bot snake and the food item
      let distance = calculateDistance(botSnake.position, food);
      // Find food that is closest
      if (distance < minDistance) {
        minDistance = distance;
        closestFood = food;
      }
    }
  });

  return closestFood;
}

// Check if food is not under a snake
function foodIsAccessible(food) {
  // Create dummy snake object with coordinates of food item
  let foodSnake = {
    ...botSnake, // Copy the entire botSnake object
    segments: [{ x: food.x, y: food.y }, ...botSnake.segments.slice(1)], // Replace the head position with food coordinates
  };

  // Check if food is blocked by a snake
  if (!snakeCollisionCheck(foodSnake)) {
    return false;
  }

  return true;
}

// Check if area around food item is free
function foodIsNotObstructed(food) {
  let freeSquares = 0;

  // Define an area around the food item (a 2x2 square in this case)
  const offsets = [
    { x: 0, y: 0 }, // Food position itself
    { x: 1, y: 0 }, // Right
    { x: -1, y: 0 }, // Left
    { x: 0, y: 1 }, // Down
    { x: 0, y: -1 }, // Up
    { x: 1, y: 1 }, // Down-right
    { x: 1, y: -1 }, // Up-right
    { x: -1, y: 1 }, // Down-left
    { x: -1, y: -1 }, // Up-left
  ];

  // Loop through each position in the area
  for (let offset of offsets) {
    // Create dummy snake object with coordinates of square to be checked
    let foodSnake = {
      ...botSnake,
      segments: [
        { x: food.x + offset.x, y: food.y + offset.y },
        ...botSnake.segments.slice(1),
      ],
    };

    // Check if square is within game field and any snakes in this square
    if (wallCollisionCheck(foodSnake) && snakeCollisionCheck(foodSnake, true)) {
      freeSquares++;
    }
  }

  // Return true if at least 6 free squares of 9
  return freeSquares >= 6;
}

// Prevent bot from moving into itself. Ok -> true
function uTurn(botSnake, newDirection) {
  if (
    (botSnake.direction === "Up" && newDirection === "Down") ||
    (botSnake.direction === "Down" && newDirection === "Up") ||
    (botSnake.direction === "Left" && newDirection === "Right") ||
    (botSnake.direction === "Right" && newDirection === "Left")
  ) {
    return false;
  }
  return true;
}

function getNewPosition(botSnake, newDirection) {
  let newHead;

  if (newDirection === "Left") {
    newHead = { x: botSnake.segments[0].x - 1, y: botSnake.segments[0].y };
  } else if (newDirection === "Right") {
    newHead = { x: botSnake.segments[0].x + 1, y: botSnake.segments[0].y };
  } else if (newDirection === "Up") {
    newHead = { x: botSnake.segments[0].x, y: botSnake.segments[0].y - 1 };
  } else if (newDirection === "Down") {
    newHead = { x: botSnake.segments[0].x, y: botSnake.segments[0].y + 1 };
  }

  // Create a new snake object with updated head position
  return {
    ...botSnake,
    segments: [newHead, ...botSnake.segments.slice(0, -1)], // Shift body forward
  };
}

// If new position is wall return false
function wallCollisionCheck(newSnake) {
  // Check if new position is out of bounds
  if (
    newSnake.segments[0].x < 1 ||
    newSnake.segments[0].x >= globalSettings.numOfColumns - 1 ||
    newSnake.segments[0].y < 1 ||
    newSnake.segments[0].y >= globalSettings.numOfRows - 1
  ) {
    return false;
  }
  return true;
}

// If next move would collide with snake, return false
function snakeCollisionCheck(newSnake, ignoreOwnNeck) {
  // Default to not ignoring own neck
  if (!ignoreOwnNeck) {
    ignoreOwnNeck = false;
  }

  // Check collision with all snake segments in game
  for (let snake of Object.values(allSnakes)) {
    for (let i = 0; i < snake.segments.length; i++) {
      // Ignore own head
      if (i === 0 && snake.playerNumber === newSnake.playerNumber) {
        continue;
      }
      // Ignore own neck
      if (
        i === 1 &&
        snake.playerNumber === newSnake.playerNumber &&
        ignoreOwnNeck
      ) {
        continue;
      }
      const segment = snake.segments[i];
      // Compare coordinates
      if (
        newSnake.segments[0].x === segment.x &&
        newSnake.segments[0].y === segment.y
      ) {
        return false;
      }

      // If bot snake is using advanced strategies
      if (
        botSnake.movementLevel === "medium" ||
        botSnake.movementLevel === "hard"
      ) {
        // Assume other snakes will continue moving in their current direction
        if (snake.playerNumber !== newSnake.playerNumber && i === 0) {
          // Figure out where other snakes head will be on next move
          let futureSegment = { ...snake.segments[0] };
          if (snake.direction === "Right") {
            futureSegment.x += 1;
          } else if (snake.direction === "Left") {
            futureSegment.x -= 1;
          } else if (snake.direction === "Up") {
            futureSegment.y -= 1;
          } else if (snake.direction === "Down") {
            futureSegment.y += 1;
          }

          if (
            newSnake.segments[0].x === futureSegment.x &&
            newSnake.segments[0].y === futureSegment.y
          ) {
            return false;
          }
        }
      }
    }
  }
  return true;
}
