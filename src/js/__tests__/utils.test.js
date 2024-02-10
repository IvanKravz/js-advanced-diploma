import { random } from 'lodash';
import { calcTileType } from '../utils';

test("Результат выполнениния функции calcTileType строка top-left", () => {
    const str = 'top-left';
    const tile = calcTileType(0, 8);
    expect(tile).toBe(str);
})

test("Результат выполнениния функции calcTileType строка top-right", () => {
    const str = 'top-right';
    const tile = calcTileType(7, 8);
    expect(tile).toBe(str);
})

test("Результат выполнениния функции calcTileType строка top", () => {
    const str = 'top';
    const tile = calcTileType(random(2, 6), 8);
    expect(tile).toBe(str);
})

test("Результат выполнениния функции calcTileType строка bottom-right", () => {
    const str = 'bottom-right';
    const tile = calcTileType(63, 8);
    expect(tile).toBe(str);
})

test("Результат выполнениния функции calcTileType строка bottom", () => {
    const str = 'bottom';
    const tile = calcTileType(random(57, 62), 8);
    expect(tile).toBe(str);
})

test("Результат выполнениния функции calcTileType строка bottom-left", () => {
    const str = 'bottom-left';
    const tile = calcTileType(56, 8);
    expect(tile).toBe(str);
})

test("Результат выполнениния функции calcTileType строка left", () => {
    const str = 'left';
    const tile = calcTileType(8, 8);
    expect(tile).toBe(str);
})

test("Результат выполнениния функции calcTileType строка right", () => {
    const str = 'right';
    const tile = calcTileType(15, 8);
    expect(tile).toBe(str);
})

test("Результат выполнениния функции calcTileType строка center", () => {
    const str = 'center';
    const tile = calcTileType(14, 8);
    expect(tile).toBe(str);
})