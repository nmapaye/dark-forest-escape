
import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import Location from './scenes/Location.js';
import InteractiveLocation from './scenes/InteractiveLocation.js';
import PuzzleLocation from './scenes/PuzzleLocation.js';

class GameWorld {
  constructor(story) {
    this.story = story;
    this.inventory = new Set();
  }

  showMessage(text) {
    // replace later
    alert(text);
  }

  unlockExit(locationId, exitLabel) {
    const loc = this.story.locations.find(l => l.id === locationId);
    if (!loc) return;
    const exit = loc.exits.find(e => e.label === exitLabel);
    if (exit) exit.locked = false;
  }

  addToInventory(itemId) {
    // Prevent duplicate pickups
    if (this.inventory.has(itemId)) return;
    this.inventory.add(itemId);
    if (this.onKeyPicked) this.onKeyPicked(itemId);
    const entry = this.story.lockAndKey.find(e => e.keyId === itemId);
    if (entry) {
      const { location, exitLabel } = entry.unlock;
      this.unlockExit(location, exitLabel);
      this.showMessage('You hear a lock click open somewhere.');
    }
  }
}

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.load.json('story', 'myStory.json');
  }

  create() {
    // retrieve and store story in game.world
    const story = this.cache.json.get('story');
    this.game.world = new GameWorld(story);

    // register each location ID with the appropriate scene subclass
    story.locations.forEach(config => {
      let SceneClass = Location;
      if (config.interactive) SceneClass = InteractiveLocation;
      else if (config.puzzle) SceneClass = PuzzleLocation;
      this.scene.add(config.id, new SceneClass(config, this.game.world), false);
    });

    // determines starting location
    const startKey = story.startLocation || story.locations[0].id;
    this.scene.start(startKey);
  }
}

// phsr configuration
const gameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container', // make sure index.html has a matching div
  scene: [BootScene]
};

window.addEventListener('load', () => {
  new Phaser.Game(gameConfig);
});