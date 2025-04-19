import Location from './Location.js';

/**
 * A Location that contains a lock-and-key or logic-gate puzzle.
 * Puzzle behavior is defined in JSON via config.puzzle.
 */
export default class PuzzleLocation extends Location {
  /**
   * @param {Object} config - The location object from myStory.json
   * @param {GameWorld} gameWorld - Reference to the main game world instance
   */
  constructor(config, gameWorld) {
    super(config, gameWorld);
    this.puzzleData = config.puzzle || null;
    this.leverState = {};
    this.puzzleSolved = false;
  }

  create() {
    // Call base Location.create() to render description and exits
    super.create();

    // If there is puzzle data, initialize the puzzle
    if (this.puzzleData) {
      this.setupPuzzle();
    }
  }

  /**
   * Dispatch to the correct puzzle setup based on type.
   */
  setupPuzzle() {
    const { type } = this.puzzleData;
    switch (type) {
      case 'lockKey':
        this.setupLockKeyPuzzle();
        break;
      case 'logicGate':
        this.setupLogicGatePuzzle();
        break;
      default:
        console.warn(`Unknown puzzle type: ${type}`);
    }
  }

  /**
   * Simple lock-and-key puzzle.
   * Listens for a key event and unlocks the configured exit.
   */
  setupLockKeyPuzzle() {
    const { keyId, unlock } = this.puzzleData;
    // if player already has the key, unlock immediately
    if (this.gameWorld.inventory.has(keyId)) {
      this.gameWorld.unlockExit(unlock.location, unlock.exitLabel);
      return;
    }
    // listen for future key pickups
    const originalOnKey = this.gameWorld.onKeyPicked;
    this.gameWorld.onKeyPicked = (pickedId) => {
      if (originalOnKey) originalOnKey(pickedId);
      if (pickedId === keyId) {
        this.gameWorld.unlockExit(unlock.location, unlock.exitLabel);
        this.gameWorld.showMessage('You hear a lock click open somewhere.');
      }
    };
  }

  setupLogicGatePuzzle() {
    // initialize lever states and render toggles
    this.leverState = {};
    this.puzzleData.levers.forEach((leverId, index) => {
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
        // toggle state
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
      const fn = new Function(...vars, `return ${expr};`);
      result = fn(...vals);
    } catch (e) {
      console.error('Error evaluating puzzle expression', e);
    }
    if (result && !this.puzzleSolved) {
      this.puzzleSolved = true;
      const { location, exitLabel } = this.puzzleData.unlock;
      this.gameWorld.unlockExit(location, exitLabel);
      this.gameWorld.showMessage('You hear the mechanism engage!');
    }
  }
}