export default class GameState {
  constructor() {
    this.heroesList = [];
    this.characterSelected = null;
    this.permissionMove = true;
    this.level = 1;
    this.statistic = [];
    this.points = 0;
    this.deleteRival = [];

  }
  
  static from(object) {
    // TODO: create object\
    if (typeof object === 'object') {
      return object;
    }
    return null;
  }
}
