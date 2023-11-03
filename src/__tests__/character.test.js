import Character from '../js/Character';
import Bowman from '../js/characters/Bowman';
import Undead from '../js/characters/Undead';
import Daemon from '../js/characters/Daemon';

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
    type: 'bowman',
  };
  const expectedUndead = {
    level: 1,
    attack: 40,
    defence: 10,
    health: 50,
    type: 'undead',
  };
  const expectedDaemon = {
    level: 1,
    attack: 10,
    defence: 10,
    health: 50,
    type: 'daemon',
  };
  expect(new Bowman(1)).toEqual(expetedBowman);
  expect(new Undead(1)).toEqual(expectedUndead);
  expect(new Daemon(1)).toEqual(expectedDaemon);
});
