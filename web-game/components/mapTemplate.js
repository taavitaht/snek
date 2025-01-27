import { globalSettings } from "../misc/gameSettings.js";

// @ = hard wall, 1;2;3;4 = spawn locations, h/b = head/body, empty = grass
// Keep in mind globalSettings.numOfRows & globalSettings.numOfColumns
// Each snake must have 1 head element. Minimum 1 body element per snake
export const mapTemplate = [
  ['@','@','@','@','@','@','@','@','@','@','@','@','@','@','@','@','@','@','@','@'],
  ['@', , , , , , , , , , , , , , , , , , ,'@'],
  ['@', , , , , , , , , , , , , , , , , , ,'@'],
  ['@',`1b`,`1b`,`1h`, , , , , , , , , , , , ,`4h`,`4b`,`4b`,'@'],
  ['@', , , , , , , , , , , , , , , , , , ,'@'],
  ['@', , , , , , , , , , , , , , , , , , ,'@'],
  ['@', , , , , , , , , , , , , , , , , , ,'@'],
  ['@', , , , , , , , , , , , , , , , , , ,'@'],
  ['@', , , , , , , , , , , , , , , , , , ,'@'],
  ['@', , , , , , , , , , , , , , , , , , ,'@'],
  ['@', , , , , , , , , , , , , , , , , , ,'@'],
  ['@', , , , , , , , , , , , , , , , , , ,'@'],
  ['@', , , , , , , , , , , , , , , , , , ,'@'],
  ['@', , , , , , , , , , , , , , , , , , ,'@'],
  ['@', , , , , , , , , , , , , , , , , , ,'@'],
  ['@', , , , , , , , , , , , , , , , , , ,'@'],
  ['@',`2b`,`2b`,`2h`, , , , , , , , , , , , ,`3h`,`3b`,`3b`,'@'],
  ['@', , , , , , , , , , , , , , , , , , ,'@'],  
  ['@', , , , , , , , , , , , , , , , , , ,'@'],
  ['@','@','@','@','@','@','@','@','@','@','@','@','@','@','@','@','@','@','@','@']
];

// Create map based on template
export function createMap() {
  // Create the game wrapper
  const gameWrapper = document.createElement("div");
  gameWrapper.id = "game-wrapper";
  gameWrapper.className = "game-wrapper";

  // Add each cell as a child to the game wrapper
  for (let row = 0; row < globalSettings.numOfRows; row++) {
    for (let col = 0; col < globalSettings.numOfColumns; col++) {
      let cellElement;

      // Check the template for the type of cell to create
      if (mapTemplate[row][col] === "@") {
        // Hard wall
        cellElement = document.createElement("img");
        cellElement.className = "hard-wall";
        cellElement.src = globalSettings.gameSquareSrc.rock;
      } else {
        // Grass patch (default case)
        cellElement = document.createElement("img");
        cellElement.className = "grass-patch";
        cellElement.src = globalSettings.gameSquareSrc.grass;
      }

      // Append the cell to the game wrapper
      gameWrapper.appendChild(cellElement);
    }
  }

  return gameWrapper;
}
