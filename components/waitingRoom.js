import { globalSettings } from "../misc/gameSettings.js";

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
countdownContainer.textContent = "SneK";

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
usernameLabel.textContent = "Insert your Username:";

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
startGameButton.textContent = "";

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
gameTitle.textContent = "Welcome to Snek!";

const gameTitle2 = document.createElement("h4");
gameTitle.classList.add("game-info-title");
gameTitle2.textContent =
  "You are a very hungry snek on a mission to eat as much as possible. Food is life, other players and walls are not.";

// Create the game synopsis text
const synopsisText = document.createElement("p");
synopsisText.classList.add("synopsis-text");
synopsisText.textContent = "Instructions:";

const gameInstructions = document.createElement("ul");
gameInstructions.classList.add("game-instructions");

const instruction1 = document.createElement("li");
instruction1.textContent = "Move Snek with arrow keys. ";

const instruction2 = document.createElement("li");
instruction2.textContent = "Eat food to grow bigger.";

const instruction3 = document.createElement("li");
instruction3.textContent = "The more you eat, the higher your score";

const instruction4 = document.createElement("li");
instruction4.textContent = "Don't eat yourself! Cannibalism ends the game!";

const instruction5 = document.createElement("li");
instruction5.textContent = "Don't hit the walls! They are bad for your health!";

const instruction6a = document.createElement("li");
instruction6a.textContent =
  "Winner is snake with the highest score after match time runs out!";
const instruction6b = document.createElement("li");
instruction6b.textContent =
  "If game ends before time runs out, the last survivor wins!";
const instruction7 = document.createElement("li");
instruction7.textContent =
  "This egg gives you double points!! Try to get it as much as possible!";
const instructionImage = document.createElement("img");
instructionImage.src = globalSettings.superFood.src;

instruction7.appendChild(instructionImage);

gameInstructions.append(
  instruction1,
  instruction2,
  instruction3,
  instruction4,
  instruction5,
  instruction6a,
  instruction6b,
  instruction7
);
// Add game title and text to the synopsis container
synopsisInfo.append(gameTitle, gameTitle2, synopsisText, gameInstructions);

// Add elements to the game info container
gameInfoContainer.appendChild(synopsisInfo);

// Add all elements to the waiting room container
waitingRoomContainer.append(
  countdownContainer,
  joinContainer,
  gameInfoContainer
);



///////////////////// Create play against bots div /////////////////////
// Create play against bots button div
const playAgainstBotsDiv = document.createElement("div");
playAgainstBotsDiv.classList.add("play-against-bots-div");
playAgainstBotsDiv.textContent = "Play Against Bots";

// Create the "Add Bot" button
const playAgainstBotsButton = document.createElement("button");
playAgainstBotsButton.id = "add-bot-button";
playAgainstBotsButton.textContent = "Add bot";

// Create the "Remove all Bots" button
const removeAllBotsButton = document.createElement("button");
removeAllBotsButton.id = "remove-bot-button";
removeAllBotsButton.textContent = "Remove all bots";

// Add the buttons to the div
playAgainstBotsDiv.appendChild(playAgainstBotsButton);
playAgainstBotsDiv.appendChild(removeAllBotsButton);

// Create radio button for difficulty level
const difficultyDiv = document.createElement("div");
difficultyDiv.classList.add("difficulty-selector");
difficultyDiv.style.position = "relative"; // Ensure z-index works correctly

const difficultyLabel = document.createElement("p");
difficultyLabel.textContent = "Select Bot Difficulty:";
difficultyDiv.appendChild(difficultyLabel);

// Easy option
const easyRadioLabel = document.createElement("label");
easyRadioLabel.classList.add("radio-label");

const easyRadio = document.createElement("input");
easyRadio.type = "radio";
easyRadio.id = "easy";
easyRadio.name = "difficulty";
easyRadio.value = "easy";
easyRadioLabel.appendChild(easyRadio);
easyRadioLabel.appendChild(document.createTextNode(" Easy"));

difficultyDiv.appendChild(easyRadioLabel);

// Medium option
const mediumRadioLabel = document.createElement("label");
mediumRadioLabel.classList.add("radio-label");

const mediumRadio = document.createElement("input");
mediumRadio.type = "radio";
mediumRadio.id = "medium";
mediumRadio.name = "difficulty";
mediumRadio.value = "medium";
mediumRadioLabel.appendChild(mediumRadio);
mediumRadioLabel.appendChild(document.createTextNode(" Medium"));

difficultyDiv.appendChild(mediumRadioLabel);

// Hard option
const hardRadioLabel = document.createElement("label");
hardRadioLabel.classList.add("radio-label");

const hardRadio = document.createElement("input");
hardRadio.type = "radio";
hardRadio.id = "hard";
hardRadio.name = "difficulty";
hardRadio.value = "hard";
hardRadio.checked = true; // Default
hardRadioLabel.appendChild(hardRadio);
hardRadioLabel.appendChild(document.createTextNode(" Hard"));

difficultyDiv.appendChild(hardRadioLabel);

// Custom option
const customRadioLabel = document.createElement("label");
customRadioLabel.classList.add("radio-label");

const customRadio = document.createElement("input");
customRadio.type = "radio";
customRadio.id = "custom";
customRadio.name = "difficulty";
customRadio.value = "custom";
customRadioLabel.appendChild(customRadio);
customRadioLabel.appendChild(document.createTextNode(" Custom"));

difficultyDiv.appendChild(customRadioLabel);

playAgainstBotsDiv.appendChild(difficultyDiv);


// Create a custom settings div (hidden initially)
const customSettingsDiv = document.createElement("div");
customSettingsDiv.id = "custom-settings";
customSettingsDiv.style.display = "none"; // Initially hidden

// Targeting Difficulty
const targetingLabel = document.createElement("p");
targetingLabel.textContent = "Targeting Strategy:";
customSettingsDiv.appendChild(targetingLabel);

// Easy option
const targetingEasyRadioLabel = document.createElement("label");
targetingEasyRadioLabel.classList.add("radio-label");

const targetingEasyRadio = document.createElement("input");
targetingEasyRadio.type = "radio";
targetingEasyRadio.id = "targeting-easy";
targetingEasyRadio.name = "targeting";
targetingEasyRadio.value = "easy";
targetingEasyRadio.checked = true; // Default to Easy
targetingEasyRadioLabel.appendChild(targetingEasyRadio);
targetingEasyRadioLabel.appendChild(document.createTextNode(" Easy"));

customSettingsDiv.appendChild(targetingEasyRadioLabel);

// Medium option
const targetingMediumRadioLabel = document.createElement("label");
targetingMediumRadioLabel.classList.add("radio-label");

const targetingMediumRadio = document.createElement("input");
targetingMediumRadio.type = "radio";
targetingMediumRadio.id = "targeting-medium";
targetingMediumRadio.name = "targeting";
targetingMediumRadio.value = "medium";
targetingMediumRadioLabel.appendChild(targetingMediumRadio);
targetingMediumRadioLabel.appendChild(document.createTextNode(" Medium"));

customSettingsDiv.appendChild(targetingMediumRadioLabel);

// Hard option
const targetingHardRadioLabel = document.createElement("label");
targetingHardRadioLabel.classList.add("radio-label");

const targetingHardRadio = document.createElement("input");
targetingHardRadio.type = "radio";
targetingHardRadio.id = "targeting-hard";
targetingHardRadio.name = "targeting";
targetingHardRadio.value = "hard";
targetingHardRadioLabel.appendChild(targetingHardRadio);
targetingHardRadioLabel.appendChild(document.createTextNode(" Hard"));

customSettingsDiv.appendChild(targetingHardRadioLabel);

// Movement Difficulty
const movementLabel = document.createElement("p");
movementLabel.textContent = "Movement Strategy:";
customSettingsDiv.appendChild(movementLabel);

// Easy option
const movementEasyRadioLabel = document.createElement("label");
movementEasyRadioLabel.classList.add("radio-label");

const movementEasyRadio = document.createElement("input");
movementEasyRadio.type = "radio";
movementEasyRadio.id = "movement-easy";
movementEasyRadio.name = "movement";
movementEasyRadio.value = "easy";
movementEasyRadio.checked = true; // Default
movementEasyRadioLabel.appendChild(movementEasyRadio);
movementEasyRadioLabel.appendChild(document.createTextNode(" Easy"));

customSettingsDiv.appendChild(movementEasyRadioLabel);

// Medium option
const movementMediumRadioLabel = document.createElement("label");
movementMediumRadioLabel.classList.add("radio-label");

const movementMediumRadio = document.createElement("input");
movementMediumRadio.type = "radio";
movementMediumRadio.id = "movement-medium";
movementMediumRadio.name = "movement";
movementMediumRadio.value = "medium";
movementMediumRadioLabel.appendChild(movementMediumRadio);
movementMediumRadioLabel.appendChild(document.createTextNode(" Medium"));

customSettingsDiv.appendChild(movementMediumRadioLabel);

// Hard option
const movementHardRadioLabel = document.createElement("label");
movementHardRadioLabel.classList.add("radio-label");

const movementHardRadio = document.createElement("input");
movementHardRadio.type = "radio";
movementHardRadio.id = "movement-hard";
movementHardRadio.name = "movement";
movementHardRadio.value = "hard";
movementHardRadioLabel.appendChild(movementHardRadio);
movementHardRadioLabel.appendChild(document.createTextNode(" Hard"));

customSettingsDiv.appendChild(movementHardRadioLabel);

// Append the custom settings div to the main container
playAgainstBotsDiv.appendChild(customSettingsDiv);


// Add event listener for difficulty selection
customRadio.addEventListener("change", function () {
  if (customRadio.checked) {
    customSettingsDiv.style.display = "block"; // Show custom settings
  }
});

// Add event listener for easy, medium, or hard difficulty to hide custom settings
[easyRadio, mediumRadio, hardRadio].forEach((radio) => {
  radio.addEventListener("change", function () {
    customSettingsDiv.style.display = "none"; // Hide custom settings
  });
});

// Add the playAgainstBotsDiv to the container
gameInfoContainer.appendChild(playAgainstBotsDiv);

