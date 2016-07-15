const Map = require('./map');
const Player = require('./player');
const Item = require('./random_item')

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
      console.log('you attack a ' + creature.stats.type)
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
          console.log('you killed the ' + creature.stats.type);
          console.log(creature)
          this.player.kills += 1;
          let leveled = this.player.gainXp(Math.floor(creature.stats.xp * (this.currentLevel/this.player.level)));
          console.log(leveled);
          if (leveled) {
            let num = Math.random()
            this.notification[num] = ['LEVEL UP', 1, 175, 300, false]
          }
          let item = Item.randomDrop();
          console.log(item);
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
      console.log(this.player.stats.health)
      if (theirAttack > this.player.ac) {
        console.log('you got damaged!');
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
  ctxUI.fillRect(175, 125, 100, 5);
  ctxUI.fillStyle = "rgb(255,0,0)";
  ctxUI.fillRect(175, 125, (this.player.stats.health / this.player.stats.maxHp) * 100, 5);
  ctxUI.fillStyle = 'rgb(255, 0, 0)'

  ctxUI.font = "10pt 'Press Start 2P'"
  ctxUI.fillText(`${this.player.stats.health} / ${this.player.stats.maxHp}`, 300, 130)

  let toLvl = this.player.toLvl
  if (toLvl > 999){
    let idx = toLvl.toString().indexOf('0');
    toLvl = toLvl.toString().slice(0, idx) + 'k'
  }
  ctxUI.fillStyle = "rgb(0,0,0)";
  ctxUI.fillRect(175, 150, 100, 5);
  ctxUI.fillStyle = "rgb(250,250,250)";
  ctxUI.fillRect(175, 150, (this.player.xp / this.player.toLvl) * 100, 5);
  ctxUI.fillStyle = 'rgb(60, 60, 60)'
  ctxUI.font = "10pt 'Press Start 2P'"
  ctxUI.fillText(`${this.player.xp} / ${toLvl}`, 300, 155)

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
