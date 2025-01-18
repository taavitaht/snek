import { PlayerMovement, movePlayers } from "../components/players.js";
import { socket } from "../public/code.js";

export let currentLevel;

//https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe

let stop = false;  
let duration = 0;
let previousFrameTimestamp = 0;
let fpsInterval,  
  elapsed;

// Calculate frame time and start animating
export function startAnimating(fps) {
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

    // Draw player movement
    if (socket != null) {
      if (duration % 10 == 0) {
        PlayerMovement(socket);
      }
      movePlayers();
      //updateSnakePosition();
      duration++;
      //console.log("Duration: " + duration);
    }
  }
}


// Function to update snake position gradually
function updateSnakePosition() {
  // Loop through the snake segments
  snake.segments.forEach((segment, index) => {
    // Get the current element representing the snake segment
    const segmentElement = document.querySelector(`.snake-${segment.id}`);
    
    // Calculate the new position of the snake segment using `transform`
    const newX = segment.x * globalSettings.gameSquareSize + 0.5;
    const newY = segment.y * globalSettings.gameSquareSize + 0.5;

    // Update the transform property for smooth animation
    segmentElement.style.transform = `translate(-50%, -50%) translate(${newX}px, ${newY}px)`;

    // Optionally add a transition (if desired)
    segmentElement.style.transition = "transform 0.1s";  // Adjust timing as needed
  });
}