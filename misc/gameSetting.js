

export const globalSettings = {

    // Animation settings
    fps: 75,

    // Game board settings
    numOfRows: 20,
    numOfColumns: 20,

    // Game ticker settings
    initialGameInterval: 500,
    minGameInterval: 150,
    gameIntervalStep: 50,
    
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

    "food": {
        width: 50,
        height: 50,
        src: "./img/fried-egg.png",
        count: 5
    },
}
