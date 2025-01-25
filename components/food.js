import { globalSettings } from "../misc/gameSettings.js";

export let foodArray = [];

export class Food {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class superFood {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isSuperEgg = true;
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

    const isSuperEgg = Math.random() < 0.3;

    if (isSuperEgg) {
      console.log("Spawning super-egg!");
    }

    // Create a new food item
    const foodItem = isSuperEgg
      ? new superFood(xCoord, yCoord)
      : new Food(xCoord, yCoord);

    // Add to the food array
    foodArray.push(foodItem);
  }
  return foodArray;
}

// Render the food items
export function drawFood(foodArray) {
  const gameWrapper = document.querySelector(".game-wrapper");
  if (!gameWrapper) {
    return;
  }
  // Get all existing food elements in the DOM
  const existingFoodIds = Array.from(
    gameWrapper.querySelectorAll(".food, .super-food")
  ).map((foodElement) => foodElement.getAttribute("data-id"));

  // Loop through each food item in the food array
  foodArray.forEach((foodItem) => {
    const foodId = `food-${foodItem.x}-${foodItem.y}`;

    // Check if the food already exists in the DOM
    let foodElement = document.getElementById(foodId);

    // If the food doesn't exist, create it
    if (!foodElement) {
      foodElement = document.createElement("div");
      foodElement.id = foodId;
      foodElement.className = foodItem.isSuperEgg ? "super-food" : "food";
      foodElement.setAttribute("data-id", foodId);

      // Set styles for the food element
      foodElement.style.transform = `translate(-50%, -50%) translate(${
        (foodItem.x + 0.5) * globalSettings.gameSquareSize
      }px, ${(foodItem.y + 0.5) * globalSettings.gameSquareSize}px)`;
      foodElement.style.width = foodItem.isSuperEgg
        ? `${globalSettings.superFood.width}px`
        : `${globalSettings.food.width}px`;
      foodElement.style.height = foodItem.isSuperEgg
        ? `${globalSettings.superFood.height}px`
        : `${globalSettings.food.height}px`;
      foodElement.style.position = "absolute";

      // Add an image inside the food element

      const foodImage = document.createElement("img");
      foodImage.src = foodItem.isSuperEgg
        ? globalSettings.superFood.src // Special super-egg image
        : globalSettings.food.src;
      foodImage.className = "food-image";

      // Append the image to the food element
      foodElement.appendChild(foodImage);

      // Append the food element to the game wrapper
      gameWrapper.appendChild(foodElement);
    } else {
      // If the food exists, update its position
      foodElement.style.transform = `translate(-50%, -50%) translate(${
        (foodItem.x + 0.5) * globalSettings.gameSquareSize
      }px, ${(foodItem.y + 0.5) * globalSettings.gameSquareSize}px)`;
    }
  });

  // Remove old food items that are no longer in the foodArray
  existingFoodIds.forEach((foodId) => {
    const foodElement = document.getElementById(foodId);
    const isFoodInArray = foodArray.some(
      (foodItem) => `food-${foodItem.x}-${foodItem.y}` === foodId
    );

    // If the food is not in the updated foodArray, remove it
    if (!isFoodInArray && foodElement) {
      foodElement.remove();
    }
  });
}

// Check if snake found food
export function checkForFood(snakeHead) {
  // Find the food item at the snake head position
  const foodIndex = foodArray.findIndex(
    (foodItem) => foodItem.x === snakeHead.x && foodItem.y === snakeHead.y
  );

  if (foodIndex !== -1) {
    const foundFood = foodArray[foodIndex];

    console.log("Found food!");

    // Check if it is a superFood
    const isSuperEgg = foundFood instanceof superFood;

    // Remove the eaten food from the array
    foodArray = foodArray.filter(
      (foodItem) => foodItem.x !== snakeHead.x || foodItem.y !== snakeHead.y
    );

    // Replace the eaten food with a new one
    placeFood(1);

    // Return the type of food found
    return isSuperEgg ? "superFood" : "food";
  }

  // Return null if no food was eaten
  return null;
}

// Generate random coordinates within the play area
function randomCoordinates() {
  const xCoord =
    Math.floor(Math.random() * (globalSettings.numOfColumns - 2)) + 1;
  const yCoord = Math.floor(Math.random() * (globalSettings.numOfRows - 2)) + 1;
  return { x: xCoord, y: yCoord };
}
