import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './Bowman';
import Swordsman from './Swordsman';
import Magician from './Magician';
import Vampire from './Vampire';
import Daemon from './Daemon';
import Undead from './Undead';
import { generateTeam } from './generators';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    const playerTeam = generateTeam([Bowman, Swordsman, Magician], 3, 3);
    const playerPositions = [
      0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57,
    ];
    const positionedPlayerTeam = this.createPositionedTeam(playerTeam, playerPositions);

    const opponentTeam = generateTeam([Vampire, Undead, Daemon], 3, 3);
    const opponentPositions = [
      6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63,
    ];
    const positionedOpponentTeam = this.createPositionedTeam(opponentTeam, opponentPositions);

    this.gamePlay.redrawPositions([...positionedPlayerTeam, ...positionedOpponentTeam]);
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  createPositionedTeam(team, playerPositions) {
    const positionedTeam = [];
    team.characters.forEach((char) => {
      const randomIndex = Math.floor(Math.random() * playerPositions.length);
      const position = playerPositions[randomIndex];
      const positionedCharacter = new PositionedCharacter(char, position);
      positionedTeam.push(positionedCharacter);
      playerPositions.splice(randomIndex, 1);
    });
    return positionedTeam;
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
