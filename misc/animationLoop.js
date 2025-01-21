// Animate the game

let stop = false;
let previousFrameTimestamp = 0;
let fpsInterval, elapsed;

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
  }
}
