import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import { generateTeam } from './generators';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.availableCellsToMove = [];

    this.fieldSize = this.gamePlay.boardSize;

    this.onCellClick = this.onCellClick.bind(this);
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    this.playerTeam = generateTeam([Bowman, Swordsman, Magician], 3, 3);
    this.playerPositions = this.generatePositions('playerTeam');
    this.positionedPlayerTeam = this.createPositionedTeam(this.playerTeam, this.playerPositions);

    this.opponentTeam = generateTeam([Vampire, Undead, Daemon], 3, 3);
    this.opponentPositions = this.generatePositions('opponentTeam');
    this.positionedOpponentTeam = this.createPositionedTeam(this.opponentTeam, this.opponentPositions);

    this.allChars = [...this.positionedPlayerTeam, ...this.positionedOpponentTeam];
    this.gamePlay.redrawPositions(this.allChars);
    this.addEvents();
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  generatePositions(string) {
    const positions = [];
    for (let i = 0; i < this.fieldSize ** 2; i++) {
      const position = i % this.fieldSize;

      if (string === 'playerTeam' && position <= 1) {
        positions.push(i);
      }

      if (string === 'opponentTeam' && position >= 6) {
        positions.push(i);
      }
    }
    return positions;
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

  addEvents() {
    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellClickListener(this.onCellClick);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
  }

  onCellClick(index) {
    const cellWithChar = this.gamePlay.cells[index].querySelector('.character');

    if (!cellWithChar) return;
    this.clickedChar = this.allChars.find((char) => char.position === index);
    const isPlayerChar = this.checkPlayerChar(this.clickedChar);

    if (cellWithChar && isPlayerChar) {
      this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
      this.gamePlay.selectCell(index);
    } else {
      GamePlay.showError('Выберите другого персонажа');
    }
  }

  // Проверяет, является ли кликнутый персонаж персонажем игрока
  checkPlayerChar(char) {
    const playerChar = char.character.type;
    return playerChar === 'bowman' || playerChar === 'swordsman' || playerChar === 'magician';
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    const cellWithChar = this.gamePlay.cells[index].querySelector('.character');
    // Проверяем, есть ли персонаж в наведенной клетке
    if (cellWithChar) {
      this.enteredChar = this.allChars.find((char) => char.position === index);
      const message = this.createTooltipMessage(this.enteredChar.character);
      this.gamePlay.showCellTooltip(message, index);
    }

    const selectedCell = this.gamePlay.cells[index].classList.contains('selected');
    // Если клетка не имеет класс 'selected', то курсор будет палец
    if (!selectedCell) {
      this.gamePlay.setCursor('pointer');
    } else {
      this.gamePlay.setCursor('default');
    }

    // Если есть кликнутый персонаж и наводим на другую клетку без персонажа,
    // проверяем может ли туда походить персонаж, если да, то подсвечиваем зеленым кругом
    if (this.clickedChar && !cellWithChar) {
      const step = this.defineSteps(index, this.clickedChar.position);
      const playerType = this.clickedChar.character.type;
      if (
        ((playerType === 'swordsman' || playerType === 'undead') && step <= 4)
        || ((playerType === 'bowman' || playerType === 'vampire') && step <= 2)
        || ((playerType === 'magician' || playerType === 'daemon') && step === 1)
      ) {
        this.gamePlay.selectCell(index, 'green');
      }
    }

    // Если есть кликнутый персонаж и наводим на другую клетку c персонажем противника,
    // определяем шаг атаки, если возможно атаковать, подсвечиваем клетку красным и меняем курсор
    if (this.clickedChar && cellWithChar) {
      const isPlayerChar = this.checkPlayerChar(this.enteredChar);
      if (!(isPlayerChar && selectedCell)) {
        const attackStep = this.defineSteps(index, this.clickedChar.position, 'attack');
        const charType = this.enteredChar.character.type;
        if (
          ((charType === 'swordsman' || charType === 'undead') && attackStep === 1)
          || ((charType === 'bowman' || charType === 'vampire') && attackStep <= 2)
          || ((charType === 'magician' || charType === 'daemon') && attackStep <= 4)
        ) {
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor('crosshair');
        }
      }
    }
  }

  // Создаем сообщение подсказки
  createTooltipMessage(char) {
    return `\u{1F396} ${char.level} \u{2694} ${char.attack} \u{1F6E1} ${char.defence} \u{2764} ${char.health}`;
  }

  // Определяем количество шагов между выбранным персонажем и наведенной клеткой
  defineSteps(hoveredPosition, clickedPosition, attack = null) {
    let steps;
    const diff = Math.abs(hoveredPosition - clickedPosition);

    const diagDiffKoef = Math.abs(
      Math.floor(hoveredPosition / this.fieldSize) - Math.floor(clickedPosition / this.fieldSize),
    );

    // Проверяем находятся ли клетки на одной вертикали
    if ((clickedPosition % this.fieldSize) === (hoveredPosition % this.fieldSize)) {
      steps = diff / this.fieldSize;
    }

    // Проверяем находятся ли клетки на одной горизонтали
    if (Math.floor(hoveredPosition / this.fieldSize) === Math.floor(clickedPosition / this.fieldSize)) {
      steps = diff;
    }

    // Проверяем находятся ли клетки по левой диагонали
    if (diff === (this.fieldSize - 1) * diagDiffKoef) {
      steps = diff / (this.fieldSize - 1);
    }

    // Проверяем находятся ли клетки по правой диагонали
    if (diff === (this.fieldSize + 1) * diagDiffKoef) {
      steps = diff / (this.fieldSize + 1);
    }

    if (!attack) {
      return steps;
    }

    if (diff === ((this.fieldSize + 1) * diagDiffKoef - 1)) {
      steps = (diff + 1) / (this.fieldSize + 1);
    }

    if (diff === ((this.fieldSize - 1) * diagDiffKoef + 1)) {
      steps = (diff - 1) / (this.fieldSize - 1);
    }

    return steps;
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);

    if (!this.gamePlay.cells[index].classList.contains('selected-yellow')) {
      this.gamePlay.deselectCell(index);
    }
    // TODO: react to mouse leave
  }
}
