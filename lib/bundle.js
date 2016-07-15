/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const Game = __webpack_require__(1);
	const GameView = __webpack_require__(8);
	
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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const Map = __webpack_require__(2);
	const Player = __webpack_require__(7);
	const Item = __webpack_require__(6)
	
	const Game = function (ctx){
	  this.map = new Map(50, 50, 1);
	  this.world = {1: this.map}
	  this.currentLevel = 1
	  this.generateView();
	  this.player = new Player(this);
	  this.ctx = ctx;
	  this.dmgDisplay = {};
	  this.notification = {};
	  this.alive = true
	}
	
	Game.prototype.player = function () {
	  return this.player
	};
	
	Game.prototype.draw = function(ctx){
	  let grid = this.map.grid;
	  let posX = 0;
	  for (let i = -5; i < 6; i++) {
	    let x = this.map.playerLocation[0]
	    posX += 50
	    let posY = 0;
	    x += i;
	    for (let j = -5; j < 6; j++) {
	      let y = this.map.playerLocation[1]
	      y += j;
	      if (x >= 0 && x <= 49 && y >= 0 && y <= 49) {
	        this.render(grid[x][y], ctx, posX, posY)
	      } else {
	        this.render({type: '#'}, ctx, posX, posY)
	      }
	      posY += 50;
	    }
	  }
	  for (let i = 0; i < grid.length; i++) {
	    let x = i * 3;
	    for (let j = 0; j < grid.length; j++) {
	      let y = j * 3;
	      this.renderMiniMap(grid[i][j], ctx, x, y)
	    }
	  }
	  this.renderDmg(this.ctx);
	}
	
	Game.prototype.move = function (direction) {
	  let x = this.map.playerLocation[0]
	  let y = this.map.playerLocation[1]
	  let x1 = x + direction[0];
	  let y1 = y + direction[1];
	  if (this.alive === true) {
	    if (x1 >= 0 && x1 <= 49 && y1 >= 0 && y1 <= 49) {
	      if (this.map.grid[x1][y1].type === '0') {
	        this.updatePos(x, y, x1, y1);
	        this.generateView();
	      } else if (this.map.grid[x1][y1].type === 'M') {
	        this.action('ATTACK', x, y, x1, y1);
	      } else if (this.map.grid[x1][y1].type === 'X') {
	        this.action('go down', x, y, x1, y1);
	      } else if (this.map.grid[x1][y1].type === 'E' && this.currentLevel !== 1) {
	        this.action('go up');
	      } else if (this.map.grid[x1][y1].type === 'I') {
	        this.action('pick up', x, y, x1, y1);
	      }
	    }
	  }
	   Object.keys(this.map.monsterLocations).forEach(key =>{
	     if (this.map.monsterLocations[key]){
	        this.map.monsterLocations[key].creature.takeTurn(this.map.grid);
	       }
	   })
	};
	
	Game.prototype.action = function (action, x, y, x1, y1) {
	  switch (action) {
	    case 'ATTACK':
	      let creature = this.map.grid[x1][y1].creature
	      let yourAttack = Math.ceil(Math.random()*20)
	      let theirAttack = Math.ceil(Math.random()*20)
	      if ((yourAttack + this.player.strBonus) > creature.ac){
	        let dmg = this.player.rollDmg();
	        let num = Math.random();
	        if (yourAttack === 20) {
	          dmg *= 2;
	          this.dmgDisplay[num] = [dmg, 1, 250, 300, true, true];
	        } else {
	          this.dmgDisplay[num] = [dmg, 1, 250, 300, true, false];
	        }
	        creature.stats.health -= dmg;
	        if (creature.stats.health <= 0) {
	          this.player.kills += 1;
	          let leveled = this.player.gainXp(Math.floor(creature.stats.xp * (this.currentLevel/this.player.level)));
	          this.map.monsters -= 1
	          if (this.map.monsters === 0) {
	            let num = Math.random()
	            this.notification[num] = ['LEVEL CLEARED', 1, 110, 300, false]
	          }
	          if (leveled) {
	            let num = Math.random()
	            this.notification[num] = ['LEVEL UP', 1, 175, 300, false]
	          }
	          let item = Item.randomDrop();
	          if (item) {
	            this.map.grid[x1][y1].type = 'I';
	            this.map.grid[x1][y1].item = item;
	            this.map.grid[x1][y1].img = item.img;
	          } else {
	            this.map.grid[x1][y1].type = "0";
	          }
	          break;
	        }
	      } else {
	        let num = Math.random();
	        this.dmgDisplay[num] = ['miss', 1, 250, 300, true, false];
	      }
	      if (theirAttack > this.player.ac) {
	        let dmg = creature.rollDmg();
	        let num = Math.random();
	        if (theirAttack === 20) {
	          dmg *= 2;
	          this.dmgDisplay[num] = [dmg, 1, 300, 300, false, true];
	        } else {
	          this.dmgDisplay[num] = [dmg, 1, 300, 300, false, false];
	        }
	        this.player.stats.health -= dmg;
	        if (this.player.stats.health <= 0) {
	          this.alive = false;
	          let introOutro = document.getElementById('intro-outro')
	          introOutro.style.visibility = 'visible';
	
	          this.introOutro('death', creature.stats.type)
	        }
	      }
	      break;
	    case 'go down':
	      if (this.world[this.currentLevel + 1]) {
	        this.currentLevel += 1;
	        this.map = this.world[this.currentLevel]
	        this.map.newMonsters();
	      } else {
	        this.creatNewLevel();
	      }
	      break;
	    case 'go up':
	      this.currentLevel -= 1;
	      this.map = this.world[this.currentLevel]
	      this.map.newMonsters();
	      break;
	    case 'pick up':
	      let item = this.map.grid[x1][y1].item.kind
	      if (item === 'potion') {
	
	        this.player.inventory[0].potions += 1;
	      }
	      this.map.grid[x1][y1].type = '0';
	      break;
	  }
	};
	
	Game.prototype.end = function () {
	
	};
	
	Game.prototype.creatNewLevel = function () {
	  this.currentLevel += 1;
	  let map = new Map(50, 50, this.currentLevel);
	  while (map.steps < 800) {
	    map = new Map(50, 50, this.currentLevel);
	  }
	  this.map = map;
	  this.world[this.currentLevel] = this.map
	  this.generateView();
	};
	
	Game.prototype.updatePos = function(x, y, x1, y1){
	  this.map.grid[x][y].type = '0';
	  this.map.grid[x][y].seen = true;
	  this.map.grid[x1][y1].type = '@';
	  this.map.grid[x1][y1].seen = true;
	  this.map.playerLocation = [x1, y1];
	};
	
	Game.prototype.generateView = function(){
	  for (let i = 0; i < 50; i++) {
	    for (var j = 0; j < 50; j++) {
	      if (i >= 0 && j >= 0 && i <= 49 && j <= 49) {
	        this.map.grid[i][j].seeing = false
	      }
	    }
	  }
	  let x = this.map.playerLocation[0];
	  let y = this.map.playerLocation[1];
	  for (let i = -3; i < 4; i++) {
	    for (var j = -3; j < 4; j++) {
	      if (x + i >= 0 && y + j >= 0 && x + i <= 49 && y + j <= 49) {
	        this.map.grid[x + i][y + j].seen = true
	        this.map.grid[x + i][y + j].seeing = true
	      }
	    }
	  }
	}
	
	Game.prototype.introOutro = function (scenario, creature) {
	  let el = document.getElementById('txt');
	  el.textContent = ''
	  let text;
	  if (scenario === 'intro') {
	    text = "It all started with a harmless adventure into the cave, but soon misfortune struck. The earth started to shake and the exit out was buried in rubble. Now the only thing left to do is to try to find another way out...                        or die.                   Use the arrow keys to move around."
	  } else {
	    text = `You have died. You managed to make it to level ${this.player.level}. On your way you killed ${this.player.kills} creatures but overall met your fate on cave floor ${this.currentLevel} fighting a ${creature}. Did you want to play again?`
	  }
	  let x = 0
	  let interval = setInterval(() => {
	    el.textContent += text[x]
	    x += 1
	    if (x >= text.length) {
	      clearInterval(interval);
	    }
	  }, 80);
	};
	
	Game.prototype.render = function(square, ctx, x, y){
	  let img = document.createElement("IMG");
	  if (square.type === '#' && square.direction === 's') {
	    img.src = './graphics/brick_dark3.png';
	  } else if (square.type === '#') {
	    img.src = './graphics/cave.jpg';
	  } else if (square.type === '@') {
	    img.src = `./graphics/pave${square.variation}.jpg`;
	    ctx.drawImage(img, y,x,50,50);
	    img.src = `./graphics/aragorn.png`;
	    ctx.drawImage(img, y,x,50,50);
	    img.src = './graphics/human_m.png';
	  } else if (square.type === 'E') {
	    img.src = `./graphics/pave${square.variation}.jpg`;
	    ctx.drawImage(img, y,x,50,50);
	    img.src = this.currentLevel === 1 ? './graphics/lair3.png' : './graphics/stone_stairs_up.png';
	  } else if (square.type === 'X') {
	    img.src = `./graphics/pave${square.variation}.jpg`;
	    ctx.drawImage(img, y,x,50,50);
	    img.src = './graphics/stone_stairs_down.png';
	  } else if (square.type === 'I') {
	    img.src = `./graphics/pave${square.variation}.jpg`;
	    ctx.drawImage(img, y,x,50,50);
	    img.src = square.item.img;
	  } else if (square.type === 'M') {
	    img.src = `./graphics/pave${square.variation}.jpg`;
	    ctx.drawImage(img, y,x,50,50);
	    if (square.seeing) {
	      img.src = square.creature.stats.img;
	    }
	  } else if (square.type === '0' || square.new) {
	    img.src = `./graphics/pave${square.variation}.jpg`;
	  }
	  if (square.seen === true && square.seeing === false) {
	    ctx.drawImage(img, y,x,50,50);
	    ctx.fillStyle = "rgba(0,0,0,0.4)";
	    ctx.fillRect(y, x, 50, 50);
	  } else if (square.seeing) {
	    ctx.drawImage(img, y,x,50,50);
	  } else {
	    ctx.fillStyle = "rgba(0,0,0,1)";
	    ctx.fillRect(y, x, 50, 50)
	  }
	}
	
	Game.prototype.renderMiniMap = function(square, ctx, x, y){
	  let color = 'black';
	  if (square.type === '#' && square.direction === 's') {
	      color = 'blue'
	  } else if (square.type === '0') {
	    color = 'gray'
	  } else if (square.type === '@') {
	    color = 'red'
	  } else if (square.type === 'E') {
	    color = 'green'
	  } else if (square.type === 'X') {
	    color = 'purple'
	  } else if (square.type === 'I') {
	    color = 'gold'
	  }else if (square.type === 'M') {
	    if (square.seeing) {
	      color = 'orange'
	    }
	    else {
	      color = 'gray';
	    }
	  }
	  x += 70;
	  y += 591;
	  if (square.seen === true && square.seeing === false) {
	    ctx.fillStyle = color;
	    ctx.beginPath();
	    ctx.rect(y, x, 3, 3);
	    ctx.fill();
	    ctx.fillStyle = "rgba(0,0,0,0.4)";
	    ctx.fillRect(y, x, 3, 3);
	  } else if (square.seeing) {
	    ctx.fillStyle = color;
	    ctx.beginPath();
	    ctx.rect(y, x, 3, 3);
	    ctx.fill();
	  } else {
	    ctx.fillStyle = "rgba(0,0,0,1)";
	    ctx.fillRect(y, x, 3, 3)
	  }
	
	
	}
	
	Game.prototype.renderDmg = function (ctx) {
	    ctx.clearRect(100, 100, 600, 600);
	    if (Object.keys(this.dmgDisplay).length > 0) {
	      Object.keys(this.dmgDisplay).forEach(key => {
	        let dmg = this.dmgDisplay[key]
	        ctx.fillStyle = dmg[4] ? "rgba(255, 255, 255, " + dmg[1] + ")" : "rgba(255, 0, 0, " + dmg[1] + ")";
	        ctx.font = "15pt 'Press Start 2P'";
	        if (dmg[5]) {
	          ctx.font = "italic 40pt Arial";
	        }
	        ctx.fillText(dmg[0], dmg[2], dmg[3]);
	        dmg[1] = dmg[1] - 0.03;
	        dmg[4] ? dmg[2] -= 1 : dmg[2] += 1;
	        dmg[3] -= 1;
	        if (dmg[1] <= 0) {
	          delete this.dmgDisplay[key]
	        }
	    });
	  }
	  if (Object.keys(this.notification).length > 0) {
	    Object.keys(this.notification).forEach(key => {
	      let notice = this.notification[key]
	      ctx.fillStyle = notice[4] ? "rgba(0, 255, 0, " + notice[1] + ")" : "rgba(0, 0, 255, " + notice[1] + ")";
	      ctx.font = "15pt 'Press Start 2P'";
	      if (notice[4] === false) {
	        ctx.font = "italic 40pt Arial";
	      }
	      ctx.fillText(notice[0], notice[2], notice[3]);
	      notice[1] = notice[1] - 0.01;
	      notice[3] -= 1
	      if (notice[1] <= 0) {
	        delete this.notification[key]
	      }
	  });
	  }
	};
	
	
	Game.prototype.drawUI = function (ctxUI) {
	  ctxUI.clearRect(0, 0, 450, 600);
	  ctxUI.fillStyle = 'rgb(0, 0, 0)'
	  ctxUI.font = "15pt 'Press Start 2P'"
	  ctxUI.fillText('Cave: ' + this.currentLevel, 175, 75)
	
	  let hp = this.player.stats.health
	  ctxUI.fillStyle = 'rgb(0, 0, 0)'
	  ctxUI.font = "15pt 'Press Start 2P'"
	  ctxUI.fillText(`Level: ${this.player.level}`, 175, 100)
	
	  ctxUI.fillStyle = "rgb(0,0,0)";
	  ctxUI.fillRect(175, 135, 100, 5);
	  ctxUI.fillStyle = "rgb(255,0,0)";
	  ctxUI.fillRect(175, 135, (this.player.stats.health / this.player.stats.maxHp) * 100, 5);
	
	  ctxUI.fillStyle = 'rgb(255, 0, 0)'
	  ctxUI.font = "10pt 'Press Start 2P'"
	  ctxUI.fillText(`${this.player.stats.health} / ${this.player.stats.maxHp}`, 300, 140)
	  ctxUI.fillText('health', 180, 130)
	
	
	  let toLvl = this.player.toLvl
	  if (toLvl > 999){
	    let idx = toLvl.toString().indexOf('0');
	    toLvl = toLvl.toString().slice(0, idx) + 'k'
	  }
	  ctxUI.fillStyle = "rgb(0,0,0)";
	  ctxUI.fillRect(175, 160, 100, 5);
	  ctxUI.fillStyle = "rgb(250,250,250)";
	  ctxUI.fillRect(175, 160, (this.player.xp / this.player.toLvl) * 100, 5);
	  ctxUI.fillStyle = 'rgb(60, 60, 60)'
	  ctxUI.font = "10pt 'Press Start 2P'"
	  ctxUI.fillText(`${this.player.xp} / ${toLvl}`, 300, 165)
	  ctxUI.fillText(`exp`, 180, 158)
	
	  let potion = document.createElement("IMG")
	  potion.src = './graphics/ruby.png'
	  ctxUI.drawImage(potion, 6, 265, 70, 70)
	
	  ctxUI.fillStyle = 'rgb(255, 255, 255)'
	  ctxUI.font = "15pt 'Press Start 2P'"
	  ctxUI.fillText(`${this.player.inventory[0].potions}`, 60, 295)
	
	  let info = document.createElement("IMG")
	  info.src = './graphics/info.png'
	  ctxUI.drawImage(info, 14, 375, 50, 50)
	
	  let gh = document.createElement("IMG")
	  gh.src = './graphics/gh.png'
	  ctxUI.drawImage(gh, 18, 475, 50, 50)
	
	  ctxUI.fillStyle = 'rgb(255, 255, 255)'
	  ctxUI.font = "20pt 'Press Start 2P'"
	  ctxUI.fillText(`How to play: `, 120, 295);
	
	  ctxUI.fillStyle = 'rgb(255, 255, 255)'
	  ctxUI.font = "12pt 'Press Start 2P'"
	  ctxUI.fillText(`Use arrow keys`, 120, 320)
	  ctxUI.fillText(`to move around`, 140, 340)
	  ctxUI.fillText(`Use 'spacebar'`, 120, 370)
	  ctxUI.fillText(`to heal`, 140, 390)
	  ctxUI.fillText(`Run into creatures`, 120, 420)
	  ctxUI.fillText(`for attacks`, 140, 440)
	  ctxUI.fillText(`Find the stairs to`, 120, 470)
	  ctxUI.fillText(`the next level`, 140, 490)
	
	
	
	};
	
	module.exports = Game;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	const Creature = __webpack_require__(3);
	const Item = __webpack_require__(6)
	
	const Map = function (mapWidth, mapHeight, lvl){
	  this.mapWidth = mapWidth;
	  this.mapHeight = mapHeight;
	  this.grid = [];
	  this.level = lvl;
	  this.playerLocation = null;
	  this.entrance = null;
	  this.exit = null;
	  this.monsters = 0;
	  this.monsterLocations = {};
	  this.treasureLocation = [];
	  this.steps = 0;
	  this.new = true
	  this.createMap(this.mapWidth, this.mapHeight);
	  this.generateMapSystem();
	  this.closeMap();
	  this.populate(this.entrance, this.grid);
	  this.newMonsters();
	  this.placeTreasure();
	  this.haveKey = false;
	  this.new = false;
	}
	const chanceForWall = 0.4;
	const chanceForMonster = 0.01
	const dungeounEntrance = [];
	
	Map.prototype.createMap = function(x, y){
	  let map = [];
	  for (let i = 0; i < x; i++) {
	    let row = [];
	    for (let j = 0; j < y; j++) {
	      if(Math.random() < chanceForWall){
	        row.push({type: '#', seen: false, seeing: false});
	      } else {
	        row.push({type: '.', seen: false, seeing: false});
	      }
	    }
	    map.push(row);
	  };
	
	
	  this.grid = map;
	};
	
	Map.prototype.countWallNeigbbors = function(map, cellX, cellY){
	  let count = 0;
	  for (let i = -1; i < 2; i++) {
	    for (let j = -1; j < 2; j++) {
	      let x = cellX + i;
	      let y = cellY + j;
	      if (i===0 && j===0) {
	        continue;
	      }else if (x < 0 || y < 0 || x >= map.length || y >= map[0].length) {
	        count += 1;
	      } else if (map[x][y].type === 'T') {
	        count -= 3;
	      } else if (map[x][y].type === '#') {
	        count += 1;
	      }
	    }
	  }
	  return count;
	};
	
	Map.prototype.generateMapSystem = function(){
	  let times = 0
	  let map = this.grid;
	  while (times < 3){
	    let birthLimit = 4;
	    let deathLimit = 3;
	    let newMap = map;
	    for (let i = 0; i < this.mapHeight; i++) {
	      for (let j = 0; j < this.mapWidth; j++) {
	        let aliveNeighbors = this.countWallNeigbbors(map, i, j)
	        if (map[i][j].type === '#') {
	          if (aliveNeighbors < deathLimit) {
	            newMap[i][j].type = '.';
	          }else {
	            newMap[i][j].type = '#';
	          }
	        } else {
	          if (aliveNeighbors > birthLimit) {
	            newMap[i][j].type = '#';
	          } else {
	            newMap[i][j].type = '.';
	          }
	        }
	      }
	    }
	    map = newMap
	    times ++;
	  }
	  this.grid = map
	};
	
	Map.prototype.closeMap = function(){
	  let entrance = false;
	  let notDone = true;
	  let direction = 's';
	  let x = 0;
	  let y = 0;
	
	  while (notDone) {
	    if (entrance === false && this.grid[x][y].type === '.') {
	      this.grid[x][y] = {type: 'E', direction: direction, seen: false, seeing: false, variation: Math.floor(Math.random() * 3)};
	      this.entrance = [x,y]
	      entrance = true;
	    } else if (this.grid[x][y].type === '.') {
	      this.grid[x][y] = {type: '#', direction: direction, seen: false, seeing: false}
	    }
	
	    if (direction === 's') {
	      x += 1;
	      if (x === (this.mapWidth - 1)) {
	        direction = 'e'
	      }
	    } else if (direction === 'e') {
	      y += 1;
	      if (y === (this.mapHeight - 1)) {
	        direction = 'n'
	      }
	    } else if (direction === 'n') {
	      x -= 1;
	      if (x < 1) {
	        direction = 'w'
	      }
	    } else if (direction === 'w') {
	      y -= 1;
	      if (y < 1 ) {
	        break;
	      }
	    }
	
	  }
	}
	
	Map.prototype.populate = function(start, map, sum){
	  let x = start[0];
	  let y = start[1];
	  let count = sum || 0
	  let nextSpotRight = [];
	  let nextSpotLeft = [];
	  let nextSpotUpperRight = [];
	  let nextSpotUpperLeft = [];
	  let nextSpotBottomRight = [];
	  let nextSpotBottomLeft = [];
	  let lastSpotUpperRight = [];
	  let lastSpotUpperLeft = [];
	  if (map[x][y].type === 'E') {
	    let direction = map[x][y].direction;
	    if (x < 49 && map[x+1][y].type === '.') {
	      x += 1
	    } else if (y > 0 && map[x][y-1].type === '.') {
	      y -=1
	    } else if (x > 0 && map[x-1][y].type === '.') {
	      x -= 1
	    } else if (y < 49 && map[x][y+1].type === '.') {
	      y += 1
	    }
	    map[x][y] = {type: '@', direction: direction, seen: false, seeing: true, variation: Math.floor(Math.random() * 3)}
	    this.playerLocation = [x, y]
	  }
	
	  let x1 = x
	
	  while (x1 < map.length && y > 0  && y < 49 && (map[x1][y].type === '.' || map[x1][y].type === '@')) {
	    if (nextSpotRight.length === 0 && map[x1][y+1].type === '.' ) {
	      nextSpotRight.push(x1);
	      nextSpotRight.push(y+1);
	    }
	    if (nextSpotLeft.length === 0 && map[x1][y-1].type === '.' ) {
	      nextSpotLeft.push(x1);
	      nextSpotLeft.push(y-1);
	    }
	
	    if (map[x1][y+1].type === '.' ) {
	      nextSpotBottomRight = [];
	      nextSpotBottomRight.push(x1);
	      nextSpotBottomRight.push(y+1);
	    }
	    if (map[x1][y-1].type === '.' ) {
	      nextSpotBottomLeft = [];
	      nextSpotBottomLeft.push(x1);
	      nextSpotBottomLeft.push(y-1);
	    }
	    if (map[x1][y].type === '@' || map[x1][y].type === '#' || map[x1][y].type === '#') {
	
	    } else if (count === 800) {
	      map[x1][y] = {type: 'X', direction: 's', seen: false, seeing: false, variation: Math.floor(Math.random() * 3)}
	      this.exit = [x1, y]
	    } else {
	      map[x1][y] = {type: '0', variation: Math.floor(Math.random() * 3), seen: false, seeing: false};
	    }
	    x1 += 1
	    count += 1
	  }
	  map[x1][y].direction = 'n';
	
	  let x2 = x - 1
	  while (x2 > 0 && map[x2][y].type === '.') {
	    if (nextSpotUpperRight.length == 0 && map[x2][y+1].type === '.' ) {
	      nextSpotUpperRight.push(x2);
	      nextSpotUpperRight.push(y+1);
	    }
	    if (nextSpotUpperLeft.length == 0 && map[x2][y-1].type === '.' ) {
	      nextSpotUpperLeft.push(x2);
	      nextSpotUpperLeft.push(y-1);
	    }
	    if (map[x2][y+1].type === '.' ) {
	      lastSpotUpperRight = [];
	      lastSpotUpperRight.push(x2);
	      lastSpotUpperRight.push(y+1);
	    }
	    if (map[x2][y-1].type === '.' ) {
	      lastSpotUpperLeft = [];
	      lastSpotUpperLeft.push(x2);
	      lastSpotUpperLeft.push(y-1);
	    }
	    if (count === 800) {
	      map[x2][y] = {type: 'X', direction: 's', seen: false, seeing: false, variation: Math.floor(Math.random() * 3)}
	      this.exit = [x2, y]
	    } else {
	      map[x2][y] = {type: '0', variation: Math.floor(Math.random() * 3), seen: false, seeing: false};
	    }
	    x2 -= 1
	    count += 1
	  }
	  map[x2][y].direction = 's';
	
	  let accum = count
	  if (nextSpotRight.length > 0) {
	     accum = this.populate(nextSpotRight, map, accum)
	  }
	  if (nextSpotLeft.length > 0) {
	    accum = this.populate(nextSpotLeft, map, accum)
	  }
	  if (nextSpotUpperRight.length > 0) {
	    accum = this.populate(nextSpotUpperRight, map, accum)
	  }
	  if (nextSpotUpperLeft.length > 0) {
	    accum = this.populate(nextSpotUpperLeft, map, accum)
	  }
	  if (nextSpotBottomRight.length > 0) {
	    accum = this.populate(nextSpotBottomRight, map, accum)
	  }
	  if (nextSpotBottomLeft.length > 0) {
	    accum = this.populate(nextSpotBottomLeft, map, accum)
	  }
	  if (lastSpotUpperRight.length > 0) {
	    accum = this.populate(lastSpotUpperRight, map, accum)
	  }
	  if (lastSpotUpperLeft.length > 0) {
	    accum = this.populate(lastSpotUpperLeft, map, accum)
	  }
	
	  this.steps = accum
	  return accum
	}
	
	Map.prototype.newMonsters = function () {
	  if (this.monsters > 0) {
	    return;
	  }
	  this.monsters = 0;
	  this.monsterLocations = {};
	  for (let i = 0; i < this.grid.length; i++) {
	    for (let j = 0; j < this.grid.length; j++) {
	      if (this.grid[i][j].type === '0') {
	        if (Math.random() < chanceForMonster) {
	          this.grid[i][j] = {type: 'M', seen: this.new ? false : true, seeing: false, variation: Math.floor(Math.random() * 3), creature: new Creature((Math.floor(Math.random() * this.level) % 9), [i, j])}
	          this.monsterLocations[this.monsters] = this.grid[i][j];
	          this.monsters += 1;
	        }
	      }
	    }
	  }
	};
	
	
	Map.prototype.placeTreasure = function(){
	  let treasureHiddenLimit = 6;
	  let treasureCount = 0
	  for (let x=1; x < this.mapHeight; x++){
	    for (let y=1; y < this.mapWidth; y++){
	      if (this.grid[x][y].type === '.') {
	        this.grid[x][y] = {type: '#', seen: false, seeing: false}
	      }
	      if (this.grid[x][y].type === '0') {
	        let walls = this.countWallNeigbbors(this.grid, x, y);
	        if(walls >= treasureHiddenLimit){
	          this.treasureLocation.push([x,y])
	          let item = Item.ITEM_DROP[0];
	          this.grid[x][y].type = 'I';
	          this.grid[x][y].item = item;
	          this.grid[x][y].img = item.img;
	          treasureCount += 1;
	          if (treasureCount > 4) {
	            treasureHiddenLimit = 7;
	          }
	        }
	      }
	    }
	  }
	}
	
	Map.prototype.displayMap= function(){
	  let map = this.grid
	  for (let i = 0; i < map.length; i++) {
	    let row = ''
	    for (let j = 0; j < map[i].length; j++) {
	      row += map[i][j].type;
	    }
	    console.log(row);
	  }
	}
	
	
	
	module.exports = Map;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	const Character = __webpack_require__(4);
	const Item = __webpack_require__(6);
	
	const Creature = function (x, loc){
	  this.stats = Object.assign({}, Character.creature[x]);
	  this.strBonus = 0;
	  this.dexBonus = 0;
	  this.ac = this.stats.armor + this.dexBonus;
	  this.dmgDisplay = {};
	  this.location = loc;
	}
	
	Creature.prototype.takeTurn = function(grid){
	  for (let i = -2; i < 3; i++) {
	    let x = this.location[0]
	    let x1 = x + i;
	    for (let j = -2; j < 3; j++) {
	      let y = this.location[1]
	      let y1 = y + j;
	      if (x1 >= 0 && x1 <= 49 && y1 >= 0 && y1 <= 49) {
	        if (grid[x1][y1].type === '@') {
	          let num = Math.min(Math.abs(i), Math.abs(j))
	          if (i === num) {
	            moveX = 0;
	            if (j < 0) {
	  						moveY = -1;
	  					} else if (j > 0) {
	  						moveY = 1;
	  					} else {
	  						moveY = 0;
	  					}
	          } else {
	            moveY = 0;
	            if (i < 0) {
	              moveX = -1;
	            } else if (i > 0) {
	              moveX = 1;
	            } else {
	              moveX = 0;
	            }
	          }
	
	          let posX = this.location[0] + moveX
	          let posY = this.location[1] + moveY
	          if (grid[posX][posY].type === '0') {
	            let holder = grid[posX][posY];
	            grid[posX][posY] = grid[this.location[0]][this.location[1]];
	            grid[this.location[0]][this.location[1]] = holder;
	            this.location = [posX, posY]
	
	          }
	        }
	      }
	    }
	  }
	}
	
	Creature.prototype.rollDmg = function () {
	  let dmg = Math.ceil(Math.random() * this.stats.dmg)
	  dmg += this.strBonus
	  return dmg;
	};
	
	Creature.prototype.displayDmg = function (ctx, dmg, crit = false) {
	  let alpha = 1;
	  let pX = 300;
	  let pY = 300;
	  let num = Math.random()
	  this.dmgDisplay[num] = [ctx, dmg, pX, pY, alpha, crit];
	    ctx.clearRect(100, 100, 600, 600);
	    if (Object.keys(this.dmgDisplay).length > 0) {
	      Object.keys(this.dmgDisplay).forEach(key => {
	        let dmg = this.dmgDisplay[key]
	        dmg[0].fillStyle = "rgba(255, 0, 0, " + dmg[4] + ")";
	        dmg[0].font = "italic 20pt Arial";
	        if (dmg[5]) {
	          dmg[0].font = "italic 40pt Arial";
	        }
	        dmg[0].fillText(dmg[1], pX, pY);
	        dmg[4] = dmg[4] - 0.05;
	        dmg[2] += 3;
	        dmg[3] -= 3;
	        if (dmg[4] <= 0) {
	          this.dmgDisplay
	        }
	    });
	  }
	};
	
	Creature.prototype.render = function(ctx) {
	  let x = this.location[0]
	  let y = this.location[1]
	  let img = this.stats.img
	  ctx.drawImage(img, y * 10, x * 10,50,50);
	}
	
	module.exports = Creature;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	const Weapon = __webpack_require__(5);
	
	module.exports = {
	  human: {
	    type: 'player',
	    health: 30,
	    weapon: 'dagger',
	    dmg: Weapon.dagger.dmg,
	    armor: 12,
	    img: './graphics/human_m.png',
	    maxHp: 30
	  },
	
	  creature: {
	    0: {
	      type: 'goblin',
	      health: 8,
	      weapon: 'dagger',
	      dmg: Weapon.dagger.dmg,
	      armor: 8,
	      img: './graphics/goblin.png',
	      xp: 30
	    },
	    1: {
	      type: 'orc',
	      health: 16,
	      weapon: 'dagger',
	      dmg: Weapon.axe.dmg,
	      armor: 10,
	      img: './graphics/orc.png',
	      xp: 40
	    },
	
	    2: {
	      type: 'orc warrior',
	      health: 25,
	      weapon: 'short sword',
	      dmg: Weapon.ssword.dmg,
	      armor: 14,
	      img: './graphics/orc_warrior.png',
	      xp: 60
	    },
	
	    3: {
	      type: 'Kobold',
	      health: 40,
	      weapon: 'spiked mace',
	      dmg: Weapon.mace.dmg,
	      armor: 15,
	      img: './graphics/big_kobold.png',
	      xp: 70
	    },
	
	    4: {
	      type: 'Minotaur',
	      health: 60,
	      weapon: 'hooves',
	      dmg: Weapon.hooves.dmg,
	      armor: 18,
	      img: './graphics/minotaur.png',
	      xp: 100
	    },
	
	    5: {
	      type: 'Rock troll',
	      health: 100,
	      weapon: 'fists of rock',
	      dmg: Weapon.rockFists.dmg,
	      armor: 24,
	      img: './graphics/rock_troll.png',
	      xp: 200
	    },
	
	    6: {
	      type: 'boggart',
	      health: 125,
	      weapon: 'weapon of choice',
	      dmg: Weapon.woc.dmg,
	      armor: 25,
	      img: './graphics/boggart.png',
	      xp: 300
	    },
	
	    7: {
	      type: 'demon spawn',
	      health: 200,
	      weapon: 'magic longsword',
	      dmg: Weapon.mLongSword.dmg,
	      armor: 27,
	      img: './graphics/demonspawn.png',
	      xp: 400
	    },
	
	    8: {
	      type: 'dragon',
	      health: 500,
	      weapon: 'death and flames',
	      dmg: Weapon.dragon.dmg,
	      armor: 30,
	      img: './graphics/dragon.png',
	      xp: 600
	    }
	  }
	}


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = {
	  fist: {
	    dmg: 1
	  },
	  dagger: {
	    dmg: 4
	  },
	  axe: {
	    dmg: 6
	  },
	  ssword: {
	    dmg: 8
	  },
	  lsword: {
	    dmg: 10
	  },
	  gsword: {
	    dmg: 12
	  },
	  mace: {
	    dmg: 12
	  },
	  hooves: {
	    dmg: 14
	  },
	  rockFists: {
	    dmg: 12
	  },
	  woc: {
	    dmg: 25
	  },
	  mLongSword: {
	    dmg: 50
	  },
	  dragon: {
	    dmg: 100
	  }
	}


/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = {
	
	  ITEM_DROP: {
	      0: {kind: 'potion',
	      img: './graphics/ruby.png'
	      }
	    },
	
	  randomDrop: function(){
	    let chance = Math.floor(Math.random() * 5);
	    if (this.ITEM_DROP[chance]) {
	      return this.ITEM_DROP[chance];
	    } else {
	      return false;
	    }
	  }
	}


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	const Character = __webpack_require__(4);
	
	const Player = function (game){
	  this.stats = Object.assign({}, Character.human);
	  this.strBonus = 0;
	  this.dexBonus = 0;
	  this.ac = this.stats.armor + this.dexBonus;
	  this.level = 1;
	  this.xp = 0;
	  this.toLvl = 200;
	  this.inventory = {0: {potions: 2}}
	  this.game = game;
	  this.kills = 0;
	}
	
	Player.prototype.rollDmg = function () {
	  let dmg = Math.ceil(Math.random() * this.stats.dmg)
	  dmg += this.strBonus
	  return dmg;
	};
	
	Player.prototype.gainXp = function (xp) {
	  this.xp += xp;
	  if (this.xp >= this.toLvl) {
	    this.levelUp();
	    return true
	  }
	  return false
	};
	
	Player.prototype.usePotion = function () {
	  if (this.inventory[0].potions > 0) {
	    this.inventory[0].potions -= 1;
	    let heal = Math.floor(this.stats.maxHp/3);
	    if (this.stats.health + heal > this.stats.maxHp) {
	      this.stats.health = this.stats.maxHp
	    } else {
	      this.stats.health += heal;
	    }
	    let num = Math.random();
	    this.game.notification[num] = [heal, 1, 275, 300, true]
	  }
	};
	
	Player.prototype.levelUp = function () {
	  this.level += 1;
	  this.stats.maxHp += 30;
	  this.stats.health += 30;
	  this.toLvl = this.level * 200;
	  this.xp = 0;
	  if (this.level % 2 === 0) {
	    this.strBonus += 1;
	    this.dexBonus += 1;
	  }
	};
	
	module.exports = Player;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	const UI = __webpack_require__(9);
	const Game = __webpack_require__(1)
	
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
	  "right": [ 0,  1],
	};
	
	GameView.INTERACT ={
	  "space": ['heal'],
	  "enter": ['enter']
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


/***/ },
/* 9 */
/***/ function(module, exports) {

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


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map