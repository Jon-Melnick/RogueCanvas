const Character = require('./character_model');
const Item = require('./random_item');

const Creature = function (x, id,loc){
  this.stats = Object.assign({}, Character.creature[x]);
  this.strBonus = 0;
  this.dexBonus = 0;
  this.ac = this.stats.armor + this.dexBonus;
  this.dmgDisplay = {};
  this.location = loc;
  this.seePlayer = false;
  this.id = id;
}

Creature.prototype.takeTurn = function(grid){
  let nextMove = [0, 0]
  let vision = 0
  if (this.seePlayer){
    vision = 2;
  }
  for (let i = (-2 - vision); i < (3 + vision); i++) {
    let x = this.location[0]
    let x1 = x + i;
    for (let j = (-2 - vision); j < (3 + vision); j++) {
      let y = this.location[1]
      let y1 = y + j;
      if (x1 >= 0 && x1 <= 49 && y1 >= 0 && y1 <= 49) {
        if (grid[x1][y1].type === '@') {
          this.seePlayer = true;
          nextMove = this.moveTowardsPlayer(grid, this.location, [x1, y1]);
        }
      }
    }
  }
  let posX = nextMove[0];
  let posY = nextMove[1];
  if (grid[posX][posY].type === '0') {
    let holder = grid[posX][posY];
    grid[posX][posY] = grid[this.location[0]][this.location[1]];
    grid[this.location[0]][this.location[1]] = holder;
    this.location = [posX, posY]
  }
}

Creature.prototype.moveTowardsPlayer = function (grid, monster, player) {
  let stack = [monster];
  const seen = {};
  const prev_move = {};
  let found = false;
  let nextMove;
  let sear = 0;

  while (stack.length > 0 && found === false && sear < 200){

    console.log('searching ' + sear);
    const pos = stack[0]
    seen[pos] = true;
    stack = stack.slice(1, stack.length)
    let moves = this.moves(pos)
    moves.forEach(move=>{
    	if (this.validMove(move) && (grid[move[0]][move[1]].type === "0" || grid[move[0]][move[1]].type === "@")){
    		if(seen[move]){

    		} else {
    			prev_move[move] = pos;
    			stack.push(move);
    			if (this.space(move, grid)){
    				found = true;
    				nextMove = this.moveList(player, monster, prev_move);

    			}
    		}
    	}
    })
    sear++;
  }
  return nextMove;
};

Creature.prototype.validMove = function (pos){
	return ((pos[0] >= 0 && pos[0] < 50)&&(pos[1] >= 0 && pos[1] < 50))
}

Creature.prototype.moveList = function (player, monster, prev_move){
	let moves = [];
	let pos = player;
	let found = false;
	while (found === false){
		moves.push(pos);
		pos = prev_move[pos];
		if (pos[0] === monster[0] && pos[1] === monster[1]){
			found = true;
		}
	}
  console.log(moves[moves.length-1])
	return (moves[moves.length-1])
}

Creature.prototype.space = function (move, grid){
	return (grid[move[0]][move[1]].type === '@')
}

Creature.prototype.moves = function (pos) {
  let move_list = [[0,1],[1,0],[0,-1],[-1,0]];
  let moves = move_list.map(move=>{
    return [move[0] + pos[0], move[1] + pos[1]];
  })
  return moves
};

Creature.prototype.rollDmg = function () {
  let dmg = Math.ceil(Math.random() * this.stats.dmg);
  dmg += this.strBonus
  return dmg;
};

Creature.prototype.displayDmg = function (ctx, dmg, crit) {
  let critical = crit || false
  let alpha = 1;
  let pX = 300;
  let pY = 300;
  let num = Math.random()
  this.dmgDisplay[num] = [ctx, dmg, pX, pY, alpha, critical];
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
