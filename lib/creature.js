const Character = require('./character_model');
const Item = require('./random_item');

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

Creature.prototype.displayDmg = function (ctx, dmg, crit) {
  let crit = crit || false
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
