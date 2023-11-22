import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import GameState from './GameState';
import { generateTeam } from './generators';
import canAct from './canAttackOrMove';
import defineCompStep from './defineCompStep';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;

    this.fieldSize = this.gamePlay.boardSize;

    this.onCellClick = this.onCellClick.bind(this);
    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);

    this.addEvents();
  }

  init() {
    this.theme = themes.prairie;
    this.level = 1;

    this.gamePlay.drawUi(this.theme);
    this.playerTeam = generateTeam([Bowman, Swordsman, Magician], this.level, 3);
    this.playerPositions = this.generatePositions('playerTeam');
    this.positionedPlayerTeam = this.createPositionedTeam(this.playerTeam, this.playerPositions);

    this.enemyTeam = generateTeam([Vampire, Undead, Daemon], this.level, 3);
    this.enemyPositions = this.generatePositions('enemyTeam');
    this.positionedEnemyTeam = this.createPositionedTeam(this.enemyTeam, this.enemyPositions);
    this.allChars = [...this.positionedPlayerTeam, ...this.positionedEnemyTeam];

    this.gamePlay.redrawPositions(this.allChars);
    this.state = {
      isPlayer: true,
      theme: this.theme,
      level: this.level,
      chars: this.allChars,
    };
    GameState.from(this.state);
  }

  // Генерируем позиции для игрока и компьютера
  generatePositions(string) {
    const positions = [];
    for (let i = 0; i < this.fieldSize ** 2; i++) {
      const position = i % this.fieldSize;

      if (string === 'playerTeam' && position <= 1) {
        positions.push(i);
      }

      if (string === 'enemyTeam' && position >= 6) {
        positions.push(i);
      }
    }
    return positions;
  }

  // Создаем команду из персонажей с позициями
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

  // Добавляем обработчики событий
  addEvents() {
    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellClickListener(this.onCellClick);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);

    this.gamePlay.addNewGameListener(() => this.newGame());
    this.gamePlay.addSaveGameListener(() => this.saveGame());
    this.gamePlay.addLoadGameListener(() => this.loadGame());
  }

  onCellClick(index) {
    if (this.gameOver) return;
    const cellWithChar = this.gamePlay.cells[index].querySelector('.character');

    this.clickedChar = this.allChars.find((char) => char.position === index);

    // Перемещаем персонажа
    if (this.enteredCell.classList.contains('selected-green')) {
      this.playerStep(index);
      return;
    }

    // Атакуем противника
    if (this.enteredCell.classList.contains('selected-red')) {
      this.playerAttack(index);
      return;
    }

    const isPlayerChar = this.checkPlayerChar(this.clickedChar);

    if (cellWithChar && isPlayerChar) {
      this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
      this.gamePlay.selectCell(index);
      this.activeChar = this.clickedChar;
      this.activeIndex = index;
    } else {
      this.gamePlay.showMessage('Выберите другого персонажа');
      this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
      this.clickedChar = null;
    }
  }

  // Проверяет, является ли кликнутый персонаж персонажем игрока
  checkPlayerChar(char) {
    if (!char) return;

    const playerChar = char.character.type;
    return playerChar === 'bowman' || playerChar === 'swordsman' || playerChar === 'magician';
  }

  // Перемещение игрока
  playerStep(index) {
    this.activeChar.position = index;
    this.gamePlay.redrawPositions(this.allChars);
    this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));
    this.clickedChar = null;
    this.state.isPlayer = false;
    this.state.chars = this.allChars;
    GameState.from(this.state);
    this.compAct();
  }

  // Атака игрока
  playerAttack(index) {
    const damage = this.calcDamage(this.activeChar, this.enteredChar);
    this.gamePlay.cells.forEach((cell, i) => this.gamePlay.deselectCell(i));

    this.gamePlay.showDamage(index, damage).then(() => {
      this.clickedChar.character.health -= damage;
      const { health } = this.clickedChar.character;

      if (health <= 0) {
        this.positionedEnemyTeam = this.positionedEnemyTeam
          .filter((char) => char !== this.clickedChar);
        this.allChars = [...this.positionedPlayerTeam, ...this.positionedEnemyTeam];
        this.clickedChar = null;

        if (this.positionedEnemyTeam.length === 0) {
          this.levelUp();
          return;
        }
      }

      this.gamePlay.redrawPositions(this.allChars);
      this.clickedChar = null;
      this.state.isPlayer = false;
      this.state.chars = this.allChars;
      GameState.from(this.state);
      this.compAct();
    });
  }

  onCellEnter(index) {
    if (this.gameOver) return;
    const cellWithChar = this.gamePlay.cells[index].querySelector('.character');
    this.enteredCell = this.gamePlay.cells[index];

    // Проверяем, есть ли персонаж в наведенной клетке
    if (cellWithChar) {
      this.enteredChar = this.allChars.find((char) => char.position === index);
      const message = this.createTooltipMessage(this.enteredChar.character);
      this.gamePlay.showCellTooltip(message, index);
      this.gamePlay.setCursor('pointer');
    }

    const selectedCell = this.gamePlay.cells[index].classList.contains('selected');
    // Если клетка не имеет класс 'selected', то курсор будет палец
    if (!selectedCell && !cellWithChar) {
      this.gamePlay.setCursor('default');
    }

    // Если есть кликнутый персонаж и наводим на другую клетку без персонажа,
    // проверяем может ли туда походить персонаж, если да, то подсвечиваем зеленым кругом
    if (this.clickedChar && !cellWithChar) {
      const playerType = this.clickedChar.character.type;

      if (canAct(playerType, index, this.clickedChar.position, this.fieldSize)) {
        this.gamePlay.selectCell(index, 'green');
        this.gamePlay.setCursor('pointer');
      }
    }

    // Если есть кликнутый персонаж и наводим на другую клетку c персонажем противника,
    // если возможно атаковать, подсвечиваем клетку красным и меняем курсор
    if (this.clickedChar && cellWithChar) {
      const isPlayerChar = this.checkPlayerChar(this.enteredChar);

      if (isPlayerChar) return;

      const charType = this.clickedChar.character.type;

      if (canAct(charType, index, this.clickedChar.position, this.fieldSize, 'attack')) {
        this.gamePlay.selectCell(index, 'red');
        this.gamePlay.setCursor('crosshair');
      } else {
        this.gamePlay.setCursor('not-allowed');
      }
    }
  }

  // Создаем сообщение подсказки
  createTooltipMessage(char) {
    const {
      level, attack, defence, health,
    } = char;
    return `\u{1F396} ${level} \u{2694} ${attack} \u{1F6E1} ${defence} \u{2764} ${health}`;
  }

  onCellLeave(index) {
    if (this.gameOver) return;
    this.gamePlay.hideCellTooltip(index);

    if (!this.gamePlay.cells[index].classList.contains('selected-yellow')) {
      this.gamePlay.deselectCell(index);
    }
  }

  // Ход компьютера. Проверяем, есть ли персонаж игрока в радиусе атаки персонажей компьютера.
  // Если да, то компьютер атакует.
  compAct() {
    let targetCell = null;
    let foundTarget = false;
    this.positionedEnemyTeam.forEach((char) => {
      if (foundTarget) return;

      for (const enemy of this.positionedPlayerTeam) {
        if (canAct(char.character.type, enemy.position, char.position, this.fieldSize, 'attack')) {
          targetCell = enemy;
          this.compChar = char;
          foundTarget = true;
          break;
        }
      }
    });

    if (targetCell) {
      this.compAttack(targetCell);
    } else {
      // Если нет противника в радиусе атаки, то персонаж перемещается ближе к противнику
      this.compStep();
    }
  }

  // Атака компьютера
  compAttack(target) {
    const damage = this.calcDamage(this.compChar, target);
    this.gamePlay.showDamage(target.position, damage).then(() => {
      target.character.health -= damage;
      const { health } = target.character;
      if (health <= 0) {
        this.positionedPlayerTeam = this.positionedPlayerTeam.filter((char) => char !== target);
        this.allChars = this.allChars.filter((char) => char !== target);
        if (this.positionedPlayerTeam.length === 0) {
          this.gameOver = true;
          this.gamePlay.showMessage('Вы проиграли');
          this.gamePlay.redrawPositions(this.allChars);
          return;
        }
      }
      this.gamePlay.redrawPositions(this.allChars);
      this.state.isPlayer = true;
      this.state.chars = this.allChars;
      GameState.from(this.state);
    });
  }

  // Шаг компьютера
  compStep() {
    let target = null;
    let compChar = null;
    let minDiff = Infinity;
    // Выбираем ближайшего персонажа соперника
    this.positionedEnemyTeam.forEach((char) => {
      for (const enemy of this.positionedPlayerTeam) {
        const diff = Math.abs(char.position - enemy.position);
        if (diff < minDiff) {
          minDiff = diff;
          target = enemy;
          compChar = char;
        }
      }
    });

    // Определяем ближайшую клетку для хода компьютера
    const compStep = defineCompStep(target, compChar, this.fieldSize, this.allChars);

    // Осуществляем перемещение персонажа компьютера и обновление поля
    compChar.position = compStep;
    this.gamePlay.redrawPositions(this.allChars);
    this.state.isPlayer = true;
    this.state.chars = this.allChars;
    GameState.from(this.state);
  }

  // Расчет урона
  calcDamage(attacker, target) {
    const attackerAttack = attacker.character.attack;
    const targetDefence = target.character.defence;
    const damageDiff = attackerAttack - targetDefence;
    const damage = Math.max(damageDiff, attackerAttack * 0.1);

    return Math.floor(damage);
  }

  // Переход на новый уровень, обновление уровня, темы, улучшение характеристик игрока
  levelUp() {
    this.level += 1;

    switch (this.level) {
      case 2:
        this.theme = themes.desert;
        break;
      case 3:
        this.theme = themes.arctic;
        break;
      case 4:
        this.theme = themes.mountain;
        break;
      case 5:
        this.finishGame();
        return;
      default:
        this.theme = themes.prairie;
        break;
    }
    this.gamePlay.drawUi(this.theme);

    this.positionedPlayerTeam.forEach((char) => {
      const { health, attack, defence } = char.character;
      char.character.health = Math.floor(Math.min(health + 80, 100));
      char.character.attack = Math.floor(Math.max(attack, (attack * (80 + health)) / 100));
      char.character.defence = Math.floor(Math.max(defence, (defence * (80 + health)) / 100));
      char.character.level = this.level;
    });

    this.enemyTeam = generateTeam([Vampire, Undead, Daemon], this.level, 3);

    this.playerTeam.characters = this.playerTeam.characters.filter(char => char.health > 0);
    this.positionedPlayerTeam = this.createPositionedTeam(this.playerTeam, this.playerPositions);
    this.positionedEnemyTeam = this.createPositionedTeam(this.enemyTeam, this.enemyPositions);

    this.allChars = [...this.positionedPlayerTeam, ...this.positionedEnemyTeam];
    this.gamePlay.redrawPositions(this.allChars);
    this.defaultSettings();

    this.state = {
      isPlayer: true,
      theme: this.theme,
      level: this.level,
      chars: this.allChars,
    };
    GameState.from(this.state);
  }

  finishGame() {
    this.gameOver = true;
    this.gamePlay.setCursor('default');
    this.gamePlay.redrawPositions(this.allChars);
    this.gamePlay.showMessage('Вы выиграли!');
  }

  // Начинаем новую игру
  newGame() {
    this.gameOver = false;
    this.defaultSettings();
    this.init();
  }

  // Сохраняем игру в localStorage
  saveGame() {
    this.stateService.save(this.state);
    this.gamePlay.showMessage('Игра сохранена');
  }

  // Загружаем ранее сохраненную игру из localStorage
  loadGame() {
    this.state = this.stateService.load();

    if (!this.state) {
      this.gamePlay.showMessage('Нет сохраненных игр');
    }

    this.level = this.state.level;
    this.theme = this.state.theme;
    this.allChars = this.state.chars;

    this.gamePlay.drawUi(this.theme);
    this.gamePlay.redrawPositions(this.allChars);

    if (!this.state.isPlayer) {
      this.compAct();
    }

    this.defaultSettings();

    this.gamePlay.showMessage('Игра загружена');
  }

  defaultSettings() {
    this.activeChar = null;
    this.activeIndex = null;
    this.clickedChar = null;
    this.enteredCell = null;
  }
}
