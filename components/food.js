import RJNA from "../rjna/engine.js";
import { globalSettings } from "../misc/gameSetting.js";

let foodArray = [];

export class Food {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// Place food in random position
export function placeFood(count) {
  for (let i = 0; i < count; i++) {
    // Generate random coordinates
    let { x: xCoord, y: yCoord } = randomCoordinates();

    // Ensure the position is not already occupied by food
    while (
      foodArray.some(
        (foodItem) => foodItem.x === xCoord && foodItem.y === yCoord
      )
    ) {
      ({ x: xCoord, y: yCoord } = randomCoordinates());
    }

    // Create a new food item
    const foodItem = new Food(xCoord, yCoord);

    // Add to the food array
    foodArray.push(foodItem);
  }
  return foodArray;
}

// Draw food
// Draw food
export function drawFood(foodArray) {
  const gameWrapper = document.querySelector(".game-wrapper");

  // Get all existing food elements in the DOM
  const existingFoodIds = Array.from(gameWrapper.querySelectorAll('.food'))
    .map(foodElement => foodElement.getAttribute('data-id'));

  // Loop through each food item in the food array
  foodArray.forEach((foodItem) => {
    const foodId = `food-${foodItem.x}-${foodItem.y}`;

    // Check if the food already exists in the DOM
    let foodElement = document.querySelector(`#${foodId}`);

    // If the food doesn't exist, create it
    if (!foodElement) {
      foodElement = RJNA.tag.div(
        {
          id: foodId, // Set a unique ID for the food item
          class: 'food', // Add a class for styling purposes
          'data-id': foodId, // Store the unique identifier as a data attribute
          style: {
            transform: `translate(-50%, -50%) translate(${
              (foodItem.x + 0.5) * globalSettings.gameSquareSize
            }px, ${(foodItem.y + 0.5) * globalSettings.gameSquareSize}px)`,
            width: `${globalSettings.food.width}px`,
            height: `${globalSettings.food.height}px`,
            position: 'absolute',
          },
        },
        {},
        {},
        RJNA.tag.img(
          {
            style: {
              width: '100%',
              height: '100%',
              zIndex: 999,
            },
          },
          {},
          { src: globalSettings.food.src }
        )
      );

      const foodNode = RJNA.createNode(foodElement);
      gameWrapper.appendChild(foodNode); // Append the food to the game wrapper
    } else {
      // If the food exists, update its position
      foodElement.style.transform = `translate(-50%, -50%) translate(${
        (foodItem.x + 0.5) * globalSettings.gameSquareSize
      }px, ${(foodItem.y + 0.5) * globalSettings.gameSquareSize}px)`;
    }
  });

  // Remove old food items that are no longer in the foodArray
  existingFoodIds.forEach((foodId) => {
    const foodElement = gameWrapper.querySelector(`#${foodId}`);
    const isFoodInArray = foodArray.some(
      (foodItem) => `food-${foodItem.x}-${foodItem.y}` === foodId
    );

    // If the food is not in the updated foodArray, remove it
    if (!isFoodInArray) {
      foodElement.remove();
    }
  });
}




// Check if the snake eats food
export function checkForFood(snakeHead) {
  // Get the current head position of the snake
  console.log("Snake head coords:", snakeHead);
  //console.log(foodArray)
  // Check if the head matches any food position
  const foundFood = foodArray.some(
    (foodItem) => foodItem.x === snakeHead.x && foodItem.y === snakeHead.y
  );

  if (foundFood) {
    console.log("Found food!");
    // Remove the eaten food from the array
    foodArray = foodArray.filter(
      (foodItem) => foodItem.x !== snakeHead.x || foodItem.y !== snakeHead.y
    );

    // Replace the eaten food with a new one
    placeFood(1);

    // Return true to indicate food was eaten
    return true;
  }

  // Return false if no food was eaten
  return false;
}

// Generate random coordinates within the play area
function randomCoordinates() {
  const xCoord =
    Math.floor(Math.random() * (globalSettings.numOfColumns - 2)) + 1;
  const yCoord = Math.floor(Math.random() * (globalSettings.numOfRows - 2)) + 1;
  return { x: xCoord, y: yCoord };
}
