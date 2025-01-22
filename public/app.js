import {
  congratulationsContainer,
  mainContainer,
} from "../components/gameContainer.js";
import { waitingRoomContainer } from "../components/waitingRoom.js";
import { startSockets } from "./code.js";

function openGame() {
  return new Promise((resolve) => {
    const app = document.createElement("div");
    app.classList.add("app");
    document.body.appendChild(app);
    app.appendChild(waitingRoomContainer);
    app.appendChild(mainContainer);
    app.appendChild(congratulationsContainer);
    resolve("success");
  });
}

openGame().then(() => {
  startSockets();
});
