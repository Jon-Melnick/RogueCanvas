'use strict'
const Creature = require('./creature');
const Item = require('./random_item')

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
          this.grid[i][j] = {type: 'M', seen: this.new ? false : true, seeing: false, variation: Math.floor(Math.random() * 3), creature: new Creature((Math.floor((Math.random() * this.level)/2) % 9), [i, j])}
          this.monsterLocations[this.monsters] = this.grid[i][j];
          this.monsters += 1;
        }
      }
    }
  }
};


Map.prototype.placeTreasure = function(){
  let dropRate = 6;
  let potionCount = 0;
  let treasureChests = 0;
  for (let x=1; x < this.mapHeight; x++){
    for (let y=1; y < this.mapWidth; y++){
      if (this.grid[x][y].type === '.') {
        this.grid[x][y] = {type: '#', seen: false, seeing: false}
      }
      if (this.grid[x][y].type === '0') {
        let walls = this.countWallNeigbbors(this.grid, x, y);
        if(walls >= dropRate){
          if (treasureChests === 0) {
            
          }
          this.treasureLocation.push([x,y])
          let item = Item.ITEM_DROP[0];
          this.grid[x][y].type = 'I';
          this.grid[x][y].item = item;
          this.grid[x][y].img = item.img;
          potionCount += 1;
          if (potionCount > 4) {
            dropRate = 7;
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
