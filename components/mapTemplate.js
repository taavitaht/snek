import { globalSettings } from "../misc/gameSetting.js";
import RJNA from "../rjna/engine.js";

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
  // Create game wrapper
  const gameWrapper = RJNA.tag.div(
    { class: "game-wrapper" },
    {},
    {}
  )
  // Add each cell as child to game wrapper
  for (let row = 0; row < globalSettings.numOfRows; row++) {
    for (let col = 0; col < globalSettings.numOfColumns; col++) {
      switch (mapTemplate[row][col]) {
          case'@':
          gameWrapper.setChild(RJNA.tag.img({
            class: "hard-wall", 
          }, {}, { src: globalSettings.gameSquareSrc.rock }));
          break
         
        default:
          gameWrapper.setChild(RJNA.tag.img({
            class: "grass-patch", 
          }, {}, { src: globalSettings.gameSquareSrc.grass }));
          break
      }
    }
  }
  return gameWrapper
}