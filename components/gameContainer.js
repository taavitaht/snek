// Game container
export const gameContainer = document.createElement("div");
gameContainer.id = "game-container";
gameContainer.classList.add("game-container");

// Scoreboard container
export const gameUpdatesContainer = document.createElement("div");
gameUpdatesContainer.classList.add("game-updates-container");
// Timer
const timer = document.createElement("div");
timer.classList.add("timer");
timer.textContent = "TIMER";
//Scoreboard
const scoreboardTitle = document.createElement("h3");
scoreboardTitle.classList.add("scoreboard-title");
scoreboardTitle.textContent = "SCOREBOARD:";
const scoreboardList = document.createElement("ul");
scoreboardList.classList.add("scoreboard-list");
// Game Updates Title
const gameUpdatesTitle = document.createElement("h3");
gameUpdatesTitle.classList.add("game-updates-title");
gameUpdatesTitle.textContent = "GAME UPDATES:";
// Live Updates
const liveUpdates = document.createElement("div");
liveUpdates.classList.add("live-updates");
// Append elements to the game updates container
gameUpdatesContainer.appendChild(timer);
gameUpdatesContainer.appendChild(scoreboardTitle);
gameUpdatesContainer.appendChild(scoreboardList);
gameUpdatesContainer.appendChild(gameUpdatesTitle);
gameUpdatesContainer.appendChild(liveUpdates);

// Pause menu main container
export const pauseContainer = document.createElement("div");
pauseContainer.classList.add("pause-container", "hidden");

// Containers

const pauseContainerMain = document.createElement("div");
pauseContainerMain.classList.add("pause-container-main");

const buttonMenuContainer = document.createElement("div");
buttonMenuContainer.classList.add("button-menu-container");

const pauseMenuContainer = document.createElement("div");
pauseMenuContainer.classList.add("pause-menu-container");

// Pause Title
const pauseTitle = document.createElement("h1");
pauseTitle.textContent = "Paused";

// Pause Timer
const pauseTimer = document.createElement("p");
pauseTimer.classList.add("pause-timer");
// Pause Reason
const pauseReason = document.createElement("p");
pauseReason.classList.add("pause-reason", "hidden");
// Resume Button
const resumeButton = document.createElement("button");
resumeButton.classList.add("resume-button");
resumeButton.textContent = "Resume";
// Quit Button
const quitButton = document.createElement("button");
quitButton.classList.add("quit-button");
quitButton.textContent = "Quit";
// Restart Button
const restartButton = document.createElement("button");
restartButton.classList.add("restart-button");
restartButton.textContent = "Restart";
// Append elements to the pause menu container

pauseContainer.appendChild(pauseContainerMain);
pauseContainerMain.appendChild(pauseTitle);
pauseContainerMain.appendChild(pauseMenuContainer);
pauseMenuContainer.appendChild(pauseTimer);
pauseMenuContainer.appendChild(pauseReason);
pauseMenuContainer.appendChild(buttonMenuContainer);
buttonMenuContainer.appendChild(resumeButton);
buttonMenuContainer.appendChild(quitButton);
buttonMenuContainer.appendChild(restartButton);

// Main container
export const mainContainer = document.createElement("div");
mainContainer.classList.add("main-container");
// Append game updates container and game container as children
mainContainer.appendChild(gameUpdatesContainer);
mainContainer.appendChild(gameContainer);
