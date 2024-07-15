'use strict';
const {describe, test, expect} = require('@jest/globals')

describe('isObject 函数测试', () => {
  const isObject = require('../lib/index').isObject;

  test('值为对象应该返回 true', () => {
    expect(isObject({})).toBe(true);
  });

  test('值不是对象返回false', () => {
    expect(isObject(123)).toBe(false);
    expect(isObject('abc')).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
  });
});

describe('formatPath 函数测试', () => {
  const formatPath = require('../lib/index').formatPath;

  // 测试路径为空的情况
  test('路径为空', () => {
    expect(formatPath('')).toEqual(undefined);
  });

  // 测试路径为非字符串的情况
  test('路径为非字符串', () => {
    expect(formatPath(123)).toEqual(undefined);
  });

  // 测试路径为斜杠的情况
  test('路径为斜杠', () => {
    expect(formatPath('/')).toEqual('/');
  });

  // 测试路径为反斜杠的情况
  test('路径为反斜杠', () => {
    expect(formatPath('\\')).toEqual('/');
  });

  // 测试路径包含反斜杠的情况
  test('路径包含反斜杠', () => {
    expect(formatPath('C:\\Program Files')).toEqual('C:/Program Files');
  });
});
