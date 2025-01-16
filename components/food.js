
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
    // Get random coordinates
    let { x: xCoord, y: yCoord } = randomCoordinates();
  
    // If food is already placed in this position get new position
    while (
      foodArray.some((foodItem) => foodItem.x == xCoord && foodItem.y == yCoord)
    ) {
      ({ x: xCoord, y: yCoord } = randomCoordinates());
    }
  
    // Create new food item
    const foodItem = new Food(xCoord, yCoord);
  
    // Store in array
    foodArray.push(foodItem);

    // TODO: socket emit
  




    // Add to page
    let food = RJNA.tag.div(
      {
        class: `food`,
        "x-coordinate": xCoord,
        "y-coordinate": yCoord,
        style: {
          top: yCoord * globalSettings.gameSquareSize + "px",
          left: xCoord * globalSettings.gameSquareSize + "px",
          width: `${globalSettings["food"]["width"]}px`,
          height: `${globalSettings["food"]["height"]}px`,
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
        { src: globalSettings["food"]["src"] }
      )
    );
  
    // Create new node from food element and append to game wrapper
    let foodElement = RJNA.createNode(food);
    let gameWrapper = document.querySelector(".game-wrapper");
    gameWrapper.appendChild(foodElement);
  }
/*
  let moving = {
    myPlayerNum: socket.playerCount,
    row: orbital["players"][`${socket.playerCount}`]["row"],
    col: orbital["players"][`${socket.playerCount}`]["col"],
  };
*/
export function checkForFood(moving){
    //console.log("Checking for food", moving);
  if (
    foodArray.some(
      (foodItem) =>
        parseInt(foodItem.x) === parseInt(moving.col) &&
        parseInt(foodItem.y) === parseInt(moving.row)
    )
  ) {
    //console.log("EGG!")
    // Remove food from array
    foodArray = foodArray.filter(
      (foodItem) => foodItem.x != moving.col || foodItem.y != moving.row
    );
    // Remove food from the page
    // Find the correct element by coordinte values
    let foodToRemove = document.querySelector(
      `.food[x-coordinate="${moving.col}"][y-coordinate="${moving.row}"]`
    );
    // Remove from parent element
    let gameWrapper = document.querySelector(".game-wrapper");
    gameWrapper.removeChild(foodToRemove);

    // TODO: socket emit

    // Replace eaten food
    placeFood();
  }
}

// Function to generate random coordinates within the play area
function randomCoordinates() {
    let xCoord = Math.floor(Math.random() * (globalSettings.numOfColumns - 2)) + 1;
    let yCoord = Math.floor(Math.random() * (globalSettings.numOfRows - 2)) + 1;
    return { x: xCoord, y: yCoord };
  }
  
