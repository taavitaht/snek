import { globalSettings } from "../misc/gameSetting.js";
import RJNA from "../rjna/engine.js";

// Game container
export const gameContainer = RJNA.tag.div({ class: "game-container" }, {}, {});

// Scoreboard container
export const gameUpdatesContainer = RJNA.tag.div(
  { class: "game-updates-container" },
  {},
  {},
  RJNA.tag.h3({ class: "game-updates-title" }, {}, {}, "GAME UPDATES:"),
  RJNA.tag.div({ class: "live-updates" }, {}, {})
);

// Pause menu container
export const congratulationsContainer = RJNA.tag.div(
  { class: "congratulations-container hidden" },
  {},
  {},
  RJNA.tag.h1({}, {}, {}, "Paused"),
  RJNA.tag.p({ class: "pause-timer" }, {}, {}, "60 seconds"),
  RJNA.tag.button({ class: "resume-button" }, {}, {}, "Resume"),
  RJNA.tag.button({ class: "quit-button" }, {}, {}, "Quit")
);
// -- //

// Main container
export const layoutContainer = () => {
  return RJNA.tag.div(
    {
      class: "main-container",
    },
    {},
    {},
    gameUpdatesContainer,
    gameContainer
  );
};
