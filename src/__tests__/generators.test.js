import { characterGenerator, generateTeam } from '../js/generators';
import Swordsman from '../js/Swordsman';
import Bowman from '../js/Bowman';
import Magician from '../js/Magician';

const chars = [Bowman, Swordsman, Magician];
const maxLevel = 3;

test('check function generator characterGenerator ', () => {
  const generator = characterGenerator(chars, 3);

  let count = 0;
  for (let i = 0; i <= 10; i++) {
    const char = generator.next().value;
    expect(char).toBeDefined();
    count++;
    if (count === 10) {
      break;
    }
  }

  expect(count).toBe(10);
});

test('check function generateTeam, creating certain amount of characters, maxLevel', () => {
  const characterCount = 4;

  const team = generateTeam(chars, maxLevel, characterCount);

  const maxLevelLessThree = team.characters.every((char) => char.level <= 3);

  expect(maxLevelLessThree).toBeTruthy();
  expect(team.characters.length).toBe(4);
});
