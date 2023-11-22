import canAct from "./canAttackOrMove";

// Рассчитываем расстояние между клеткой врага и возможным ходом компьютера
function calcDistance(cellPositon, enemyPosition) {
  const rowDiff = Math.abs(cellPositon.row - enemyPosition.row);
  const colDiff = Math.abs(cellPositon.column - enemyPosition.column);
  return rowDiff + colDiff;
}

// Получаем массив возможных ходов
function getPossibleSteps(computerChar, fieldSize, charsPositions) {
  const characterType = computerChar.character.type;
  const possibleSteps = [];

  for (let i = 0; i < fieldSize ** 2 - 1; i++) {
    const canStep = canAct(characterType, i, computerChar.position, fieldSize);
    if (canStep && !(charsPositions.includes(i))) {
      const possibleStep = {
        row: Math.floor(i / fieldSize),
        column: i % fieldSize,
      };
      possibleSteps.push(possibleStep);
    }
  }

  return possibleSteps;
}

// Определяем возможные клетки для хода компьютера
export default function defineCompStep(target, compChar, fieldSize, allChars) {
  const allPositions = allChars.map((char) => char.position);

  const possibleSteps = getPossibleSteps(compChar, fieldSize, allPositions);

  const enemyCoords = {
    row: Math.floor(target.position / fieldSize),
    column: target.position % fieldSize,
  };

  let minDistance = Infinity;
  let compStep = null;

  possibleSteps.forEach((step) => {
    const distance = calcDistance(step, enemyCoords);
    if (distance < minDistance) {
      minDistance = distance;
      compStep = step;
    }
  });

  const { row, column } = compStep;
  return (row * 8 + column);
}
