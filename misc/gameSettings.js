

export const globalSettings = {

    // Single player mode enabled
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
    minGameInterval: 150,
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
