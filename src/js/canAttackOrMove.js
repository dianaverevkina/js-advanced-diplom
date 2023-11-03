/* eslint-disable consistent-return */

// Определяем количество шагов между выбранным персонажем и наведенной клеткой
function defineSteps(hoveredPosition, clickedPosition, fieldSize) {
  const diff = Math.abs(hoveredPosition - clickedPosition);
  const diagDiffKoef = Math.abs(
    Math.floor(hoveredPosition / fieldSize) - Math.floor(clickedPosition / fieldSize),
  );

  // Проверяем находятся ли клетки на одной вертикали
  if ((clickedPosition % fieldSize) === (hoveredPosition % fieldSize)) {
    return diff / fieldSize;
  }

  // Проверяем находятся ли клетки на одной горизонтали
  if (Math.floor(hoveredPosition / fieldSize) === Math.floor(clickedPosition / fieldSize)) {
    return diff;
  }

  // Проверяем находятся ли клетки по левой диагонали
  if (diff === (fieldSize - 1) * diagDiffKoef) {
    return diff / (fieldSize - 1);
  }

  // Проверяем находятся ли клетки по правой диагонали
  if (diff === (fieldSize + 1) * diagDiffKoef) {
    return diff / (fieldSize + 1);
  }
}

// Определяем возможность атаки в пределах радиуса атаки
function canAttack(hoveredPosition, clickedPosition, fieldSize, radius) {
  const posDiff = Math.abs(hoveredPosition - clickedPosition);
  const colDiff = Math.abs(
    Math.floor(hoveredPosition % fieldSize) - Math.floor(clickedPosition % fieldSize),
  );

  return posDiff <= (fieldSize + 1) * radius && colDiff <= radius;
}

// Определяем возможность перемещаться/атаковать в зависимости
// от типа персонажа и допустимого расстояния
export default function canAct(charType, hoverPos, clickPos, fieldSize, attack = null) {
  if (!attack) {
    const step = defineSteps(hoverPos, clickPos, fieldSize);

    return ((charType === 'swordsman' || charType === 'undead') && step <= 4)
      || ((charType === 'bowman' || charType === 'vampire') && step <= 2)
      || ((charType === 'magician' || charType === 'daemon') && step === 1);
  }

  if (attack) {
    let radiusAttack;

    if (charType === 'swordsman' || charType === 'undead') radiusAttack = 1;
    if (charType === 'bowman' || charType === 'vampire') radiusAttack = 2;
    if (charType === 'magician' || charType === 'daemon') radiusAttack = 4;

    return canAttack(hoverPos, clickPos, fieldSize, radiusAttack);
  }
}
