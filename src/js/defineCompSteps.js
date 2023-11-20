// Получаем координаты из индекса
function getCoordinates(position, fieldSize) {
  const x = position % fieldSize;
  const y = Math.floor(position / fieldSize);
  return { x, y };
}

// Получаем индекс из координат
function getIndex(x, y) {
  if (x < 0 || x > 7) return;
  if (y < 0 || y > 7) return;

  const index = y * 8 + x;

  return index;
}

// Получаем разницу в координатах между персонажами игрока и компьютера
function getDiffCoords(enemyCoords, charCoords) {
  return {
    x: enemyCoords.x - charCoords.x,
    y: enemyCoords.y - charCoords.y,
  };
}

// Определяем возможные клетки для хода компьютера
export default function defineCompSteps(target, compChar, fieldSize) {
  let steps;

  switch (compChar.character.type) {
    case 'undead':
      steps = 3;
      break;
    case 'vampire':
      steps = 2;
      break;
    default:
      steps = 1;
      break;
  }

  const targetCoords = getCoordinates(target.position, fieldSize);
  const compCoords = getCoordinates(compChar.position, fieldSize);
  const diffCoords = getDiffCoords(targetCoords, compCoords);

  const possibleSteps = [];

  const { x, y } = compCoords;

  if ((diffCoords.x < 0 || diffCoords.x === 0) && diffCoords.y < 0) {
    possibleSteps.push(getIndex((x - steps), (y - steps)));
    possibleSteps.push(getIndex((x - steps), y));
    possibleSteps.push(getIndex(x, (y - steps)));
  }
  if (diffCoords.x < 0 && (diffCoords.y > 0 || diffCoords.y === 0)) {
    possibleSteps.push(getIndex((x - steps), y));
    possibleSteps.push(getIndex((x - steps), (y + steps)));
    possibleSteps.push(getIndex(x, (y + steps)));
  }
  if ((diffCoords.x > 0 || diffCoords.x === 0) && diffCoords.y > 0) {
    possibleSteps.push(getIndex(x, (y + steps)));
    possibleSteps.push(getIndex((x + steps), (y + steps)));
    possibleSteps.push(getIndex((x + steps), y));
  }
  if (diffCoords.x > 0 && (diffCoords.y < 0 || diffCoords.y === 0)) {
    possibleSteps.push(getIndex(x + steps, y));
    possibleSteps.push(getIndex((x + steps), (y - steps)));
    possibleSteps.push(getIndex(x, (y - steps)));
  }

  return possibleSteps;
}
