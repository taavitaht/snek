export const globalSettings = {
  ////////////////////// Connection settings //////////////////////
  // Port for localhost (http://localhost:[port])
  port: 5000,

  // Ngrok link. Leave blank to only use localhost
  ngrok: "https://saved-enough-civet.ngrok-free.app/",
  //ngrok: "",

  ////////////////////// Game settings //////////////////////
  // Change to "false" and then ctrl+refresh browser for review question "The lead player can start the game once there are between 2 and 4 players."
  singlePlayerEnabled: true,

  // Time limit of each game in seconds
  gameTime: 120,

  // Animation settings
  fps: 144,

  // Game board settings
  numOfRows: 20,
  numOfColumns: 20,

  // Game ticker settings
  initialGameInterval: 500,
  minGameInterval: 160,
  gameIntervalStep: 20,

  // Visual settings
  gameSquareSize: 50,
  gameSquareSrc: {
    rock: "./img/rock.png",
    grass: "./img/grass.png",
  },

  players: {
    width: 50,
    height: 50,
  },

  food: {
    width: 50,
    height: 50,
    src: "./img/fried-egg.png",
    count: 2, // Foods per player
  },

  superFood: {
    width: 50,
    height: 50,
    src: "./img/egg-on-fire.png",
    count: 1,
  },
};
