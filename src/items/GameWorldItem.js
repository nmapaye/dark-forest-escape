export default class GameWorldItem {
  /**
   * @param {Object} config
   * @param {string} config.id 
   * @param {string} config.label 
   * @param {string} config.description 
   */
  constructor({ id, label, description }) {
    this.id = id;
    this.label = label;
    this.description = description;
  }

  /**
   * @param {GameWorld} gameWorld - reference to the main game world instance
   */
  onUse(gameWorld) {
    console.log(`Used item: ${this.label}`);
  }
}
