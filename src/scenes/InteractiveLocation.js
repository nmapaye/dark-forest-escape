import Location from './Location.js';

export default class InteractiveLocation extends Location {
  /**
   * @param {Object} config - the location config from myStory.json
   * @param {GameWorld} gameWorld - reference to the game world
   */
  constructor(config, gameWorld) {
    super(config, gameWorld);
    this.interactiveData = config.interactive || null;
  }

  create() {
    super.create();
    if (this.interactiveData) {
      this.setupInteractive();
    }
  }

  setupInteractive() {
    const { type } = this.interactiveData;
    switch (type) {
      case 'radio':
        this.setupRadio();
        break;
      case 'buttonDoor':
        this.setupButtonDoor();
        break;
      case 'dog':
        this.setupDog();
        break;
      default:
        console.warn(`Unknown interactive type: ${type}`);
    }
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


  setupDog() {
    const { fetchableItemId } = this.interactiveData;
    this.dogText = this.add.text(20, 200, 'Pet Dog', {
      fontSize: '16px',
      backgroundColor: '#886',
      padding: { x: 8, y: 4 }
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.gameWorld.showMessage('The dog rolls over!');
        if (fetchableItemId && !this.gameWorld.inventory.has(fetchableItemId)) {
          this.gameWorld.addToInventory(fetchableItemId);
          this.gameWorld.showMessage(`The dog fetched you a key!`);
        }
      });
  }
}