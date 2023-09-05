import Character from '../js/Character';
import Bowman from '../js/Bowman';
import Undead from '../js/Undead';

test('check creating classes', () => {
  expect(() => {
    const char = new Character(2);
    console.log(char);
  }).toThrow('Нельзя создать этот класс');
});

test('check creating object new Character - throw error', () => {
  const expetedBowman = {
    level: 1,
    attack: 25,
    defence: 25,
    health: 50,
    type: 'Bowman',
  };
  const expectedUndead = {
    level: 1,
    attack: 40,
    defence: 10,
    health: 50,
    type: 'Undead',
  };
  expect(new Bowman(1)).toEqual(expetedBowman);
  expect(new Undead(1)).toEqual(expectedUndead);
});
