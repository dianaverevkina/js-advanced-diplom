import { calcTileType } from '../js/utils';

test('check function calcTileType', () => {
  expect(calcTileType(0, 8)).toEqual('top-left');
  expect(calcTileType(7, 8)).toEqual('top-right');
  expect(calcTileType(3, 8)).toEqual('top');
  expect(calcTileType(16, 8)).toEqual('left');
  expect(calcTileType(15, 8)).toEqual('right');
  expect(calcTileType(56, 8)).toEqual('bottom-left');
  expect(calcTileType(26, 8)).toEqual('center');
});
