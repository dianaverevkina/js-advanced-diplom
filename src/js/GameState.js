export default class GameState {
  static from(obj) {
    const state = {
      player: obj.isPlayer,
      theme: obj.theme,
      level: obj.level,
      allChars: obj.chars,
    };

    return state;
  }
}
