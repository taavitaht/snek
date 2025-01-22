// Animate the game
import { globalSettings } from "../misc/gameSettings.js";

let stop = false;
let previousFrameTimestamp = 0;
let fpsInterval, elapsed;
let allSnakes;

// Calculate frame time and start animating
export function startAnimating(fps) {
  console.log("Start animating", fps);
  fpsInterval = 1000 / fps; // fpsInterval is duration of frame in milliseconds (1000/60=16.67ms)
  animate(fpsInterval); // Start animating
}

function animate(totalAnimatedTimestamp) {
  // Stop
  if (stop) {
    return;
  }

  // requestAnimationFrame() tells the browser to perform an animation
  // Recursive call will continue the animation loop frame by frame, by calling requestAnimationFrame(animate) inside the animate function itself
  requestAnimationFrame(animate);

  // Elapsed time since last frame
  elapsed = totalAnimatedTimestamp - previousFrameTimestamp;

  // If fpsInterval time has passed draw next frame
  if (elapsed >= fpsInterval) {
    // Save timestamp of this frame and also compensate for frame drift
    previousFrameTimestamp = totalAnimatedTimestamp - (elapsed % fpsInterval);
    // Redraw the game
    drawAllSnakes(allSnakes);
  }
}

// Receive all snakes from server and store for rendering
export function storeSnakes(snakes) {
  allSnakes = snakes;
}

// Render snakes
export function drawAllSnakes(snakes) {
  const gameWrapper = document.getElementById("game-wrapper");
  // Don't draw snake until gameWrapper is loaded
  if (!gameWrapper) {
    return;
  }
  if (!snakes) {
    return;
  }
  //console.log("Drawing", snakes);
  // Loop through each snake in the list
  Object.values(snakes).forEach((snake) => {
    // If snake has no segments, erase all its segments from DOM
    if (snake.segments.length === 0) {
      // Find all elements of snake by class
      const snakeElements = gameWrapper.querySelectorAll(
        `.snake-${snake.playerNumber}`
      );
      snakeElements.forEach((element) => {
        element.remove();
      });
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
  });
}
