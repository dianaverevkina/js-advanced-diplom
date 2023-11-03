import canAct from '../js/canAttackOrMove';

test.each([
  ['bowman', 3, 19, 8, null, true],
  ['swordsman', 29, 27, 8, null, true],
  ['magician', 28, 35, 8, null, true],
  ['vampire', 35, 44, 8, null, true],
  ['undead', 10, 3, 8, 'attack', true],
  ['vampire', 12, 27, 8, 'attack', true],
  ['daemon', 44, 27, 8, 'attack', true],
  ['swordsman', 29, 27, 8, 'attack', false],
])('test can attack or move', (type, hoverPos, clickPos, fieldSize, isAttack, expected) => {
  const result = canAct(type, hoverPos, clickPos, fieldSize, isAttack);
  expect(result).toBe(expected);
});
