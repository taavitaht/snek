// Generate player card
export const playerCard = (incomingPlayer) => {
  // Create the outer div for the player card
  console.log("incomingPlayer:", incomingPlayer);
  const playerCardDiv = document.createElement("div");
  playerCardDiv.classList.add(`player-${incomingPlayer.playerNumber}-card`);

  // Create the inner span element for the player username
  const playerCardSpan = document.createElement("span");
  playerCardSpan.classList.add("player-card");
  playerCardSpan.textContent = incomingPlayer.username;

  // Append the span to the div
  playerCardDiv.appendChild(playerCardSpan);

  // Return the constructed player card div
  return playerCardDiv;
};

// Container for waiting room
export const waitingRoomContainer = document.createElement("div");
waitingRoomContainer.classList.add("waiting-room-container");

// Create the countdown container
const countdownContainer = document.createElement("div");
countdownContainer.classList.add("countdown-container");
countdownContainer.textContent = "Snek";

// Create the join container
const joinContainer = document.createElement("div");
joinContainer.classList.add("join-container");

// Create the join screen
const joinScreen = document.createElement("div");
joinScreen.classList.add("screen", "join-screen", "active");

// Create the form inside the join screen
const form = document.createElement("div");
form.classList.add("form");

// Create the form title
const formTitle = document.createElement("h2");
formTitle.textContent = "Join Here";

// Create the form input for username
const formInputUsername = document.createElement("div");
formInputUsername.classList.add("form-input");

const usernameLabel = document.createElement("label");
usernameLabel.textContent = "Username";

const usernameInput = document.createElement("input");
usernameInput.type = "text";
usernameInput.id = "username";
usernameInput.pattern = "^(?=\\s*\\S).{1,6}$";
usernameInput.required = true;
usernameInput.value = "";

const usernameMessage = document.createElement("p");
usernameMessage.id = "username-message";
usernameMessage.textContent = "Choose a unique username up to 10 characters";

formInputUsername.append(usernameLabel, usernameInput, usernameMessage);

// Create the submit button
const formInputButton = document.createElement("div");
formInputButton.classList.add("form-input");

const joinButton = document.createElement("button");
joinButton.id = "join-user-button";
joinButton.textContent = "Join";
formInputButton.appendChild(joinButton);

// Add form elements to the form
form.appendChild(formTitle);
form.appendChild(formInputUsername);
form.appendChild(formInputButton);

// Add form to join screen
joinScreen.appendChild(form);

// Add join screen to join container
joinContainer.appendChild(joinScreen);

// Create the players waiting container
const playersWaitingContainer = document.createElement("div");
playersWaitingContainer.classList.add("players-waiting-container");

// Create the start game button
const startGameButton = document.createElement("button");
startGameButton.id = "start-game-button";
startGameButton.textContent = "Start Game!";

// Add the start game button to the players waiting container
playersWaitingContainer.appendChild(startGameButton);
joinContainer.appendChild(playersWaitingContainer);

// Add 4 player divs to the players waiting container
for (let i = 1; i <= 4; i++) {
  const waitingPlayerCard = document.createElement("div");
  waitingPlayerCard.classList.add(`player-${i}-card`, "player-card");
  waitingPlayerCard.id = `player-${i}-card`;
  playersWaitingContainer.appendChild(waitingPlayerCard);
}

// Create the game info container
const gameInfoContainer = document.createElement("div");
gameInfoContainer.classList.add("game-info-container");

// Create the game synopsis info
const synopsisInfo = document.createElement("div");
synopsisInfo.classList.add("synopsis-info");

// Create the game title
const gameTitle = document.createElement("h3");
gameTitle.classList.add("game-info-title");
gameTitle.textContent = "Title goes here";

// Create the game synopsis text
const synopsisText = document.createElement("p");
synopsisText.classList.add("synopsis-text");
synopsisText.textContent = "And text goes here...";

// Add game title and text to the synopsis container
synopsisInfo.append(gameTitle, synopsisText);

// Add elements to the game info container
gameInfoContainer.appendChild(synopsisInfo);

// Add all elements to the waiting room container
waitingRoomContainer.append(
  countdownContainer,
  joinContainer,
  gameInfoContainer
);
