import { globalSettings } from "../misc/gameSetting.js";
import RJNA from "../rjna/engine.js";

// @ = hard wall, 1;2;3;4 = spawn locations, empty = grass
// Keep in mind globalSettings.numOfRows & globalSettings.numOfCols
const mapTemplate = [
  ['@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@'],
  ['@', '1', , , , , , , , , , , , , , , , , '3', '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],
  ['@', , , , , , , , , , , , , , , , , , , '@'],  
  ['@', '4', , , , , , , , , , , , , , , , , '2', '@'],
  ['@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@', '@']
];

// Create map based on template
export function createMap() {
  // Create game wrapper
  const gameWrapper = RJNA.tag.div(
    { class: "game-wrapper" },
    {},
    {}
  )
  // Add each cell as child to game wrapper
  for (let row = 0; row < globalSettings.numOfRows; row++) {
    for (let col = 0; col < globalSettings.numOfCols; col++) {
      switch (mapTemplate[row][col]) {
          case '@':
          gameWrapper.setChild(RJNA.tag.img({
            class: "hard-wall", 
          }, {}, { src: globalSettings.wallSrc.hard }));
          break
        case '1':
          gameWrapper.setChild(RJNA.tag.img({
            class: "loading-1", 
          }, {}, { src: globalSettings.wallSrc.empty }));
          break
        case '2':
          gameWrapper.setChild(RJNA.tag.img({
            class: "loading-2", 
          }, {}, { src: globalSettings.wallSrc.empty }));
          break
        case '3':
          gameWrapper.setChild(RJNA.tag.img({
            class: "loading-3", 
          }, {}, { src: globalSettings.wallSrc.empty }));
          break
        case '4':
          gameWrapper.setChild(RJNA.tag.img({
            class: "loading-4", 
          }, {}, { src: globalSettings.wallSrc.empty }));
          break
 
        default:
          gameWrapper.setChild(RJNA.tag.img({
            class: "dirt-patch", 
          }, {}, { src: globalSettings.wallSrc.empty }));
          break
      }
    }
  }
  return gameWrapper
}