import { Game } from "./game/Game.js";
import { UI } from "./ui/UI.js";

const canvas = document.getElementById("game-canvas");
const uiRoot = document.getElementById("ui-root");

const ui = new UI(uiRoot);
const game = new Game({ canvas, ui });

game.update();
