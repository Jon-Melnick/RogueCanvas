# RogueCanvas
Roguelike inspired game running on HTML Canvas and JavaScript

[RogueCanvas][roguecanvas]

[roguecanvas]: https://jon-melnick.github.io/RogueCanvas/

![title]
[title]: ./docs/imgs/title.png

RogueCanvas is a roguelike inspired game that I have always wanted to try making. In its infant state you can run through as many randomly generated caves as you like, running into the creatures in order for you both to attack each other resulting in inevitable death to you or them. Find the stairs going down to get to a new level, or clear the floor and find healing potions. With each level down you have a chance to run into a new creature that will be harder than their prior compadres. Too hard? then go back up to the prior level. If you had cleared it the monsters will regenerate, giving you more chances to getting that experience and leveling up. Keeping with the traditional style of roguelike, there is no end, just permadeath. Are you willing to see how far you can get in the cave before meeting your fate?


![game-view]
[game-view]: ./docs/imgs/game-view.png


## Features

Movement is made using the standard arrow keys of a keyboard and to heal (if you have a potion) you can use 'spacebar' or click the to the right of the game view. To the top right of the game view you will find a 'minimap' to help you keep track of where you have explored. There you will also find the current cave, your characters level, current and max health, and current experience as well as how much total you need to level.

![game-ui]
[game-ui]: ./docs/imgs/game-ui.png

With each hit on you or each kill will change the bars for the respective attribute. The minimap updates as you move, showing where you have explored but covering it in a fog of war. This is useful so you can tell if you've been done a certain path before you move on, or to remember where the entrance was or exit, if you have discovered it. Any potion or monster that is not currently in your field of vision will stay hidden in the fog of war.


# Behind the scenes

## map generation

Using a modified version of cellular automation, I have been able to randomly generate a cave map, meaning no two are the same. The map is first generated with a 40% chance for a space to be a wall but then its ran through a function 3 times that counts each space's neighbor that is a wall and decides if it will either stay a wall or become an open space. I found that three times resulted in a pretty decent cave structure.

After the cave interior has been created I close it off with a wall on all sides except for the first space thats open along the edge, which becomes the entrance. From there the program fills the interior of the cave from top to bottom then over one. This helps to ensure that the cave is big enough to explore and also a side benefit is that every time it hits a wall going up, I give it an attribute so when the map gets rendered it gives it a different tile so it looks like a cave wall instead of the normal cave tile. This helps with giving the map a isometric view.



# Future Directions for the Project

For now the enemies are running stupid. They only move if you get within 2 spaces of them, and at that point they will just follow you unless you are able to get them stuck around a corner. Not always as easy as it sounds. The plan is to use a tree algorithm to find the best path to the player and take it, that way they don't just get stuck. Also would like to maybe set up a field of vision for them, and random turning or steps. That way it could be possible to sneak up on them to deal double dmg for the first hit.

The players weapon is just a weak d4 dagger (meaning you can do up to 4 weapon dmg) so that won't cut it for fighting the dragons or anything really about an orc warrior (cave 3). The plan is to implement an inventory system other than just for potions, allowing you to pick up weapons or even new attire and switch them whenever you want. Chests will probably be the best source for finding such things.

I was toying with the idea of building a console window so you can read your attack rolls and perhaps be more descriptive about what is happening and what you are fighting.
