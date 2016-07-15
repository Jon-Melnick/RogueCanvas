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
