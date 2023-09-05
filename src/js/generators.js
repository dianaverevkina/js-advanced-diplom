import Team from './Team';
/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const randomLevel = Math.ceil(Math.random() * maxLevel);
    const randomIndex = Math.floor(Math.random() * allowedTypes.length);
    const char = new allowedTypes[randomIndex]();
    char.level = randomLevel;

    yield char;
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей
 * в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const generatorTeam = characterGenerator(allowedTypes, maxLevel);
  const team = [];

  for (let i = 0; i < characterCount; i++) { //eslint-disable-line
    const generatorChar = generatorTeam.next().value;
    team.push(generatorChar);
  }

  return new Team(team);
}
