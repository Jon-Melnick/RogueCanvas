const Game = require("./game");
const GameView = require("./game_view");

document.addEventListener("DOMContentLoaded", function(){
  const canvasEl = document.getElementById("canvas1");
  canvasEl.width = 750;
  canvasEl.height = 700;

  const canvasElDmg = document.getElementById("canvasDmg");
  canvasElDmg.width = 750;
  canvasElDmg.height = 700;

  const canvasElUI = document.getElementById("canvasUI");
  canvasElUI.width = 450;
  canvasElUI.height = 600;

  const ctx = canvasEl.getContext("2d");
  const ctxDmg = canvasElDmg.getContext("2d");
  const ctxUI = canvasElUI.getContext("2d");
  let game = new Game(ctxDmg);
  while (game.map.steps < 800) {
    game = new Game(ctxDmg);
  }

  new GameView(game, ctx, ctxUI, ctxDmg).intro();
});
