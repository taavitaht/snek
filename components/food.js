import RJNA from "../rjna/engine.js";
import { globalSettings } from "../misc/gameSetting.js";

export let foodArray = [];

export class Food {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// Place food in random position
export function placeFood() {
  // Generate random coordinates
  let { x: xCoord, y: yCoord } = randomCoordinates();

  // Ensure the position is not already occupied by food
  while (
    foodArray.some((foodItem) => foodItem.x === xCoord && foodItem.y === yCoord)
  ) {
    ({ x: xCoord, y: yCoord } = randomCoordinates());
  }

  // Create a new food item
  const foodItem = new Food(xCoord, yCoord);

  // Add to the food array
  foodArray.push(foodItem);

  // Create the food DOM element
  const food = RJNA.tag.div(
    {
      class: `food`,
      "x-coordinate": xCoord,
      "y-coordinate": yCoord,
      style: {
        top: yCoord * globalSettings.gameSquareSize + "px",
        left: xCoord * globalSettings.gameSquareSize + "px",
        width: `${globalSettings.food.width}px`,
        height: `${globalSettings.food.height}px`,
        position: "absolute",
      },
    },
    {},
    {},
    RJNA.tag.img(
      {
        style: {
          width: "100%",
          height: "100%",
          zIndex: 999,
        },
      },
      {},
      { src: globalSettings.food.src }
    )
  );

  // Add the food to the game wrapper
  const foodElement = RJNA.createNode(food);
  const gameWrapper = document.querySelector(".game-wrapper");
  gameWrapper.appendChild(foodElement);
}

// Check if the snake eats food
export function checkForFood(snakeHead) {
  // Get the current head position of the snake
console.log("Snake head coords:", snakeHead);
  // Check if the head matches any food position
  const foundFood = foodArray.some(
    (foodItem) => foodItem.x === snakeHead.x && foodItem.y === snakeHead.y
  );

  if (foundFood) {
    // Remove the eaten food from the array
    foodArray = foodArray.filter(
      (foodItem) => foodItem.x !== snakeHead.x || foodItem.y !== snakeHead.y
    );

    // Remove the corresponding food element from the DOM
    const foodToRemove = document.querySelector(
      `.food[x-coordinate="${snakeHead.x}"][y-coordinate="${snakeHead.y}"]`
    );

    if (foodToRemove) {
      const gameWrapper = document.querySelector(".game-wrapper");
      gameWrapper.removeChild(foodToRemove);
    }

    // Replace the eaten food with a new one
    placeFood();

    // Return true to indicate food was eaten
    return true;
  }

  // Return false if no food was eaten
  return false;
}

// Generate random coordinates within the play area
function randomCoordinates() {
  const xCoord = Math.floor(Math.random() * (globalSettings.numOfColumns - 2)) + 1;
  const yCoord = Math.floor(Math.random() * (globalSettings.numOfRows - 2)) + 1;
  return { x: xCoord, y: yCoord };
}
