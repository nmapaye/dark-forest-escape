import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

export default class Location extends Phaser.Scene {
  /**
   * @param {Object} config - The location object from myStory.json
   * @param {GameWorld} gameWorld - Reference to the main game world instance
   */
  constructor(config, gameWorld) {
    // Use the location's id as the scene key
    super({ key: config.id });
    this.config = config;
    this.gameWorld = gameWorld;
  }

  preload() {
    // tba
  }

  create() {
    // darkness check
    if (
      this.gameWorld.story.darkAreas.includes(this.config.id) &&
      !this.gameWorld.inventory.has('lantern')
    ) {
      this.gameWorld.showMessage("It's too dark to see anything here.");
      return; // stop, don’t render description or exits
    }
  
    // desc show
    this.add.text(20, 20, this.config.description, {
      fontSize: '18px',
      wordWrap: { width: 760 }
    });

    // render items present 
    const itemsHere = this.gameWorld.story.items.filter(item =>
    item.initialLocation === this.config.id &&
    !this.gameWorld.inventory.has(item.id)
  );
  itemsHere.forEach((item, idx) => {
    const yItem = 80 + idx * 30;
    const itemText = this.add.text(20, yItem, `Pick up: ${item.label}`, {
      fontSize: '16px',
      backgroundColor: '#222',
      padding: { x: 5, y: 3 }
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.gameWorld.addToInventory(item.id);
        this.gameWorld.showMessage(`Picked up ${item.label}.`);
        item.initialLocation = null;
        itemText.destroy();
      });
  });

    // Render exits as interactive text buttons
    this.config.exits.forEach((exit, index) => {
      const y = 150 + index * 40;
      const label = exit.locked ? `${exit.label} (locked)` : exit.label;
      this.add.text(20, y, label, {
        fontSize: '16px',
        backgroundColor: exit.locked ? '#888' : '#444',
        padding: { x: 10, y: 5 }
      })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          if (exit.locked) {
            this.gameWorld.showMessage('That way is locked.');
          } else {
            this.scene.start(exit.target);
          }
        });
    });
  }

  setupRadio() {
    const { messages } = this.interactiveData;
    this.radioIndex = 0;
    this.radioText = this.add.text(20, 120, 'Radio (click)', {
      fontSize: '16px',
      backgroundColor: '#555',
      padding: { x: 8, y: 4 }
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const msg = messages[this.radioIndex];
        this.gameWorld.showMessage(msg);
        this.radioIndex = (this.radioIndex + 1) % messages.length;
      });
  }

  setupButtonDoor() {
    const { doorLocation, exitLabel } = this.interactiveData;
    this.buttonText = this.add.text(20, 160, 'Press Button', {
      fontSize: '16px',
      backgroundColor: '#333',
      padding: { x: 8, y: 4 }
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.gameWorld.unlockExit(doorLocation, exitLabel);
        this.gameWorld.showMessage('You hear a clicking noise in the distance.');
      });
  }

  setupLogicGatePuzzle() {
    this.leverState = {};
    const leverIds = this.puzzleData.levers;
    leverIds.forEach((leverId, index) => {
      this.leverState[leverId] = false;
      const x = 20 + index * 150;
      const y = 120;
      const leverText = this.add.text(x, y, `${leverId}: OFF`, {
        fontSize: '16px',
        backgroundColor: '#444',
        padding: { x: 6, y: 4 }
      })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.leverState[leverId] = !this.leverState[leverId];
          leverText.setText(`${leverId}: ${this.leverState[leverId] ? 'ON' : 'OFF'}`);
          this.evaluatePuzzle();
        });
    });
  }

  evaluatePuzzle() {
    const expr = this.puzzleData.expression;
    const vars = Object.keys(this.leverState);
    const vals = Object.values(this.leverState);
    let result = false;
    try {
      // Create a function with lever names as parameters
      const fn = new Function(...vars, `return ${expr};`);
      result = fn(...vals);
    } catch (e) {
      console.error('Error evaluating puzzle expression', e);
    }
    if (result && !this.puzzleSolved) {
      this.puzzleSolved = true;
      const { location, exitLabel } = this.puzzleData.unlock;
      this.gameWorld.unlockExit(location, exitLabel);
      this.gameWorld.showMessage('You hear the gate mechanism engage!');
    }
  }
}
