import PositionedCharacter from '../js/PositionedCharacter';
import Vampire from '../js/characters/Vampire';

test('check constructor of class PositionedCharacter - position is not a number', () => {
  const vampire = new Vampire(1);
  expect(() => {
    const char = new PositionedCharacter(vampire, 'oops');
    return char;
  }).toThrow('position must be a number');
});

test('check constructor of class PositionedCharacter - character is not instance of Character', () => {
  class Teacher {
    constructor(type) {
      this.type = type;
    }
  }
  const teacher = new Teacher();
  expect(() => {
    const char = new PositionedCharacter(teacher, 2);
    return char;
  }).toThrow('character must be instance of Character or its children');
});

test('create class PositionedCharacter', () => {
  const vampire = new Vampire(1);
  const char = new PositionedCharacter(vampire, 1);
  const expected = {
    character: {
      level: 1, attack: 25, defence: 25, health: 50, type: 'vampire',
    },
    position: 1,
  };
  expect(char).toEqual(expected);
});
