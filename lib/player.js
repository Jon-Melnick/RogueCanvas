const Character = require('./character_model');

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
  this.soundEffectsLevel = 0.2;
  this.drink = new Audio('sounds/drink.wav');
  this.drink.volume = this.soundEffectsLevel;
  this.levelUpSound = new Audio('sounds/level.wav');
  this.levelUpSound.volume = this.soundEffectsLevel;

}

Player.prototype.rollDmg = function () {
  let dmg = Math.ceil(Math.random() * this.stats.dmg)
  dmg += this.strBonus
  return dmg;
};

Player.prototype.gainXp = function (xp) {
  console.log(xp)
  this.xp += xp;
  if (this.xp >= this.toLvl) {
    this.levelUp();
    return true
  }
  return false
};

Player.prototype.usePotion = function () {
  if (this.inventory[0].potions > 0) {
    this.drink.play();
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
  this.levelUpSound.play();
  this.level += 1;
  this.stats.maxHp += 30;
  this.stats.health += 30;
  this.toLvl = this.level * 200;
  this.xp = 0;
  if (this.level % 2 === 0) {
    this.strBonus += 1;
    this.dexBonus += 1;
    this.ac = this.stats.armor + this.dexBonus;
  }
};

module.exports = Player;
