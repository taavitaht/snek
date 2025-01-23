
// Game container
export const gameContainer = document.createElement('div');
gameContainer.id = 'game-container';
gameContainer.classList.add('game-container');


// Scoreboard container
export const gameUpdatesContainer = document.createElement('div');
gameUpdatesContainer.classList.add('game-updates-container');
// Timer
const timer = document.createElement('div');
timer.classList.add('timer');
timer.textContent = 'TIMER';
// Game Updates Title
const gameUpdatesTitle = document.createElement('h3');
gameUpdatesTitle.classList.add('game-updates-title');
gameUpdatesTitle.textContent = 'GAME UPDATES:';
// Live Updates
const liveUpdates = document.createElement('div');
liveUpdates.classList.add('live-updates');
// Append elements to the game updates container
gameUpdatesContainer.appendChild(timer);
gameUpdatesContainer.appendChild(gameUpdatesTitle);
gameUpdatesContainer.appendChild(liveUpdates);


// Pause menu container
export const congratulationsContainer = document.createElement('div');
congratulationsContainer.classList.add('congratulations-container', 'hidden');
// Pause Title
const pauseTitle = document.createElement('h1');
pauseTitle.textContent = 'Paused';
// Pause Timer
const pauseTimer = document.createElement('p');
pauseTimer.classList.add('pause-timer');
// Pause Reason
const pauseReason = document.createElement('p');
pauseReason.classList.add('pause-reason', 'hidden');
// Resume Button
const resumeButton = document.createElement('button');
resumeButton.classList.add('resume-button');
resumeButton.textContent = 'Resume';
// Quit Button
const quitButton = document.createElement('button');
quitButton.classList.add('quit-button');
quitButton.textContent = 'Quit';
// Append elements to the pause menu container
congratulationsContainer.appendChild(pauseTitle);
congratulationsContainer.appendChild(pauseTimer);
congratulationsContainer.appendChild(pauseReason);
congratulationsContainer.appendChild(resumeButton);
congratulationsContainer.appendChild(quitButton);


// Main container
export const mainContainer = document.createElement('div');
mainContainer.classList.add('main-container');
// Append game updates container and game container as children
mainContainer.appendChild(gameUpdatesContainer);
mainContainer.appendChild(gameContainer);
