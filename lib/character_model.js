const Weapon = require('./weapon');

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
