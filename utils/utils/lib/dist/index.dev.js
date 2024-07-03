'use strict';

var path = require('path');
/**
 * 检查给定的值是否为对象
 * @param {*} o - 要检查的值
 * @returns {boolean} - 如果值是对象，则返回 true；否则返回 false
 */


function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}
/**
 * 格式化路径字符串，将反斜杠转换为斜杠
 * 在 Windows 系统中，路径分隔符是反斜杠（\）
 * 在 Unix 或类 Unix 系统（如 Linux 和 macOS）中，路径分隔符是正斜杠（/）
 * @param {string} p - 要格式化的路径字符串
 * @returns {string} - 格式化后的路径字符串
 */


function formatPath(p) {
  if (p && typeof p === 'string') {
    var sep = path.sep;

    if (sep === '/') {
      return p;
    } else {
      return p.replace(/\\/g, '/');
    }
  }
}

module.exports = {
  isObject: isObject,
  formatPath: formatPath
};