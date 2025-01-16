
import RJNA from "../rjna/engine.js";
import { globalSettings } from "../misc/gameSetting.js";







function placeFood() {
console.log("place food");
    let food = RJNA.tag.div(
      {
        class: `food`,
        style: {
          top: 5 * globalSettings.gameSquareSize + "px",
          left: 5 * globalSettings.gameSquareSize + "px",
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

    let foodElement = RJNA.createNode(food);

    let gameWrapper = document.querySelector(".game-wrapper");
    gameWrapper.appendChild(foodElement);
}







// Function to remove dom elements
function removeFromCellsAndDom(row, col, querySelectorStatement) {

  if (orbital.cells[row][col] == globalSettings.wallTypes.softWall) {
    orbital.cells[row][col] = null
  } else if (orbital.cells[row][col] == `1${globalSettings["power-ups"]["types"]["speed"]}`) {
    orbital.cells[row][col] = globalSettings["power-ups"]["types"]["speeds"]
  } else if (orbital.cells[row][col] == `1${globalSettings["power-ups"]["types"]["flames"]}`) {
    orbital.cells[row][col] = globalSettings["power-ups"]["types"]["flames"]
  } else if (orbital.cells[row][col] == `1${globalSettings["power-ups"]["types"]["bombs"]}`) {
    orbital.cells[row][col] = globalSettings["power-ups"]["types"]["bombs"]
  }
  const removeDomEle = Array.from(
    //.soft-wall
    document.querySelectorAll(`.${querySelectorStatement}`)
  ).filter((ele) => {
    //if the co-ord has a decimal places then make it to 2dp.
    let eleTopDp = Math.pow(10, 0);
    if (ele.style.top.includes(".")) {
      eleTopDp = Math.pow(10, ele.style.top.split(".")[1].length - 2);
    }
    let eleLeftDp = Math.pow(10, 0);
    if (ele.style.left.includes(".")) {
      eleLeftDp = Math.pow(10, ele.style.left.split(".")[1].length - 2);
    }
    let top =
      Math.round(row * globalSettings["gameSquareSize"] * eleTopDp) / eleTopDp;
    let left =
      Math.round(col * globalSettings["gameSquareSize"] * eleLeftDp) / eleLeftDp;
    return (
      Math.round(parseFloat(ele.style.top) * eleTopDp) / eleTopDp === top &&
      Math.round(parseFloat(ele.style.left) * eleLeftDp) / eleLeftDp === left
    );
  });
  while (removeDomEle.length > 0) {
    removeDomEle.shift().remove();
  }
}
