const UI = require('./ui');
const Game = require('./game')

const GameView = function (game, ctx, ctxUI, ctxDmg) {
  this.ctx = ctx;
  this.ctxUI = ctxUI;
  this.game = game;
  this.ctxDmg = ctxDmg
};

GameView.MOVES = {
  "up": [-1,  0],
  "left": [ 0, -1],
  "down": [ 1,  0],
  "right": [ 0,  1]
};

GameView.prototype.bindKeyHandlers = function () {
  const player = this.player;
  let that = this
  Object.keys(GameView.MOVES).forEach((k) => {
    let direction = GameView.MOVES[k];
    key(k, function (e) {
      e.preventDefault();
      that.game.move(direction) });
  });
};

GameView.prototype.intro = function () {
  this.game.introOutro('intro');
  let btn = document.getElementById('selectButton')
  btn.addEventListener('click', (e)=>{
    let introOutro = document.getElementById('intro-outro')
    let textBox = document.getElementById('txt')
    textBox.textContent = '';
    e.preventDefault();
    let game = new Game(this.ctxDmg);
    while (game.map.steps < 800) {
      game = new Game(this.ctxDmg);
    }
    this.game = game;
    introOutro.style.visibility = 'hidden';
  })
  this.start();

};

GameView.prototype.start = function () {
  this.bindKeyHandlers();
  this.bindClicks();
  this.lastTime = 0;
  requestAnimationFrame(this.animate.bind(this));
};

GameView.prototype.bindClicks = function () {
  let potion = document.getElementById('slot1')
  potion.addEventListener('click', ()=> {
    this.game.player.usePotion()
  })

  let modal = document.getElementById('slot2')
  modal.addEventListener('click', ()=> {
    let el = document.getElementById('overlay');
    el.style.visibility = (el.style.visibility == 'visible' ? 'hidden' : 'visible')
  })

  let gh = document.getElementById('slot3')
  gh.addEventListener('click', ()=> {
    window.open("https://github.com/Jon-Melnick");
  })

};

GameView.prototype.animate = function(time){
  const timeDelta = time - this.lastTime;
  this.game.draw(this.ctx);
  this.game.drawUI(this.ctxUI);
  this.lastTime = time;
  requestAnimationFrame(this.animate.bind(this));
};


module.exports = GameView;
