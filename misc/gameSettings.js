

export const globalSettings = {

    // http://localhost:[port]
    port: 5000,

    // Single player mode enabled
    // Change to "false" and then ctrl+refresh browser for review question "The lead player can start the game once there are between 2 and 4 players."
    singlePlayerEnabled: true,

    // Time limit of each game in seconds
    gameTime: 60,

    // Animation settings
    fps: 60,

    // Game board settings
    numOfRows: 20,
    numOfColumns: 20,

    // Game ticker settings
    initialGameInterval: 500,
    minGameInterval: 160,
    gameIntervalStep: 40,

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
        count: 2    // Foods per player
    },
}
