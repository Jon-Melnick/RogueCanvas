const UI = require('./ui');
const Game = require('./game')

const GameView = function (game, ctx, ctxUI, ctxDmg) {
  this.ctx = ctx;
  this.ctxUI = ctxUI;
  this.game = game;
  this.ctxDmg = ctxDmg
  this.xDown = null;
  this.yDown = null;
  this.xUp = null;
  this.yUp = null;
};

GameView.MOVES = {
  "up": [-1,  0],
  "left": [ 0, -1],
  "down": [ 1,  0],
  "right": [ 0,  1],
};

GameView.INTERACT ={
  "space": ['heal'],
  "enter": ['enter']
};

GameView.prototype.game = function () {
  return this.game;
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
  Object.keys(GameView.INTERACT).forEach((k) => {
    key(k, function (e) {
      e.preventDefault();
      if (k === 'space') {
        that.game.player.usePotion();
      } else if (k === 'enter') {
        let btn = document.getElementById('selectButton');
        btn.click();
      }
    })
  });
  let obj = document.getElementsByClassName("game");
  obj[0].addEventListener('touchstart', (e) => {
    this.handleTouchStart(e)}, false)
  obj[0].addEventListener('touchmove', (e) => {
    this.handleTouchMove(e)}, false);
};

  GameView.prototype.handleTouchStart = function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      this.xDown = evt.touches[0].clientX;
      this.yDown = evt.touches[0].clientY;
  };

  GameView.prototype.handleTouchMove = function(evt) {
      evt.preventDefault();
      evt.stopPropagation();

      if ( ! this.xDown || ! this.yDown ) {
          return;
      }

      this.xUp = evt.touches[0].clientX;
      this.yUp = evt.touches[0].clientY;

      let xDiff = this.xDown - this.xUp;
      let yDiff = this.yDown - this.yUp;
      if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
          if ( xDiff > 0 ) {
            this.game.move([0, 1])
          } else {
            this.game.move([0, -1])
          }
      } else {
          if ( yDiff > 0 ) {
            this.game.move([1, 0])
          } else {
            this.game.move([-1, 0])
          }
      }
      /* reset values */
      this.xDown = null;
      this.yDown = null;
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
