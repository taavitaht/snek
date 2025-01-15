import RJNA from "../rjna/engine.js";
import { congratulationsContainer, layoutContainer } from "../components/gameContainer.js";
import { waitingRoomGrid } from "../components/waitingRoom.js"
import { startSockets } from "./code.js";

function openGame() {
    return new Promise((resolve) => {
        const rootObj = RJNA.tag.div({ class: "app" }, {}, {});
        const rootEl = RJNA.createNode(rootObj);
        orbital.obj = rootObj;
        orbital.rootEl = rootEl;
        document.body.appendChild(orbital.rootEl);
        const mainContainer = layoutContainer()
        rootObj.setChild(waitingRoomGrid);
        rootObj.setChild(mainContainer);
        rootObj.setChild(congratulationsContainer)
        resolve("success")
    })
}

openGame().then(
startSockets()
);

