import RJNA from "../rjna/engine.js";
import { globalSettings } from "../misc/gameSetting.js";

// Generate player card
export const playerCard = (incomingPlayer) =>
  RJNA.tag.div(
    { class: `player-${incomingPlayer.count}-card` },
    {},
    {},
    RJNA.tag.span(
      { class: "player-card" },
      {},
      {},
      `${incomingPlayer.username}`
    )
  );

// Waiting room
export const waitingRoomGrid = RJNA.tag.div(
  {
    class: "waiting-room-container",
    style: {
      "grid-template-columns": `${globalSettings.gridColumn1}px ${globalSettings.gridColumn2}px ${globalSettings.gridColumn3}px`,
      "grid-template-rows": `60px 60px ${globalSettings.gridFr}px ${globalSettings.gridFr}px`,
    },
  },
  {},
  {},
  RJNA.tag.div({ class: "countdown-container" }, {}, {}, "Name of Game"),
  RJNA.tag.div(
    { class: "join-container" },
    {},
    {},
    RJNA.tag.div(
      { class: "screen join-screen active" },
      {},
      {},
      RJNA.tag.div(
        { class: "form" },
        {},
        {},
        RJNA.tag.h2({}, {}, {}, "Join Here"),
        RJNA.tag.div(
          { class: "form-input" },
          {},
          {},
          RJNA.tag.label({}, {}, {}, "Username"),
          RJNA.tag.input(
            { type: "text", id: "username" },
            {},
            { pattern: "^(?=\\s*\\S).{1,6}$", required: true },
            "Join Chatroom"
          ),
          RJNA.tag.p({}, {}, {}, "Enter up to 6 Characters")
        ),
        RJNA.tag.div(
          { class: "form-input" },
          {},
          {},
          RJNA.tag.button({ id: "join-user-button" }, {}, {}, "Join")
        )
      )
    ),
    RJNA.tag.div(
      { class: "players-waiting-container" },
      {},
      {},
      RJNA.tag.button({ id: "start-game-button" }, {}, {}, "Start Game!")
    )
  ),
  RJNA.tag.div(
    { class: "game-info-container" },
    {},
    {},
    RJNA.tag.div(
      { class: "synopsis-info" },
      {},
      {},
      RJNA.tag.h3({ class: "game-info-title" }, {}, {}, "Welcome to Bomberman"),
      RJNA.tag.p(
        { class: "synopsis-text" },
        {},
        {},
        `Bomberman is an arcade-style game where players control a 
           character who strategically places bombs to eliminate obstacles,
           enemies, and opponents in a maze-like arena.
          `
      )
    )
  )
);
