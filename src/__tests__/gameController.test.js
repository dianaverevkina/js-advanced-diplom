import GameController from '../js/GameController';
import Vampire from '../js/Vampire';

test('check function addEvents', () => {
  const gameController = new GameController();
  const vampire = new Vampire(1);
  const result = gameController.createTooltipMessage(vampire);
  const expected = '\u{1F396} 1 \u{2694} 25 \u{1F6E1} 25 \u{2764} 50';
  expect(result).toEqual(expected);
});