const UI = function (game){
  this.game = game;
}

UI.prototype.draw = function (ctx) {
  let color = 'blue';

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(0, 0, 100, 100);
  ctx.fill();
};

module.exports = UI;
