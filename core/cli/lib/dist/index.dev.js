'use strict';

module.exports = core;

var semver = require('semver');

var colors = require('colors/safe');

var homedir = require('os').homedir();

var existsSync = require('fs').existsSync;

var argv = require('minimist')(process.argv.slice(2)); // require: .js/.json/.node
// any -> .js


var pkg = require('../package.json');

var log = require('@wf-cli-dev/log');

var constant = require('./const');

function core() {
  return regeneratorRuntime.async(function core$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          checkPkgVersion();
          checkNodeVersion();
          checkRoot();
          checkUserHome();
          checkInputArgs();
          _context.next = 8;
          return regeneratorRuntime.awrap(checkGlobalUpdate());

        case 8:
          _context.next = 13;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          log.error(_context.t0.message);

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
} // 检查包版本号


function checkPkgVersion() {
  log.notice('wf-cli 版本', pkg.version);
} // 检查node版本号


function checkNodeVersion() {
  // 1. 获取当前node版本号
  var currentVersion = process.version; // 2. 比对最低版本号

  var lowestVersion = constant.LOWEST_NODE_VERSION;

  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red("wf-cli \u9700\u8981\u5B89\u88C5 v".concat(constant.LOWEST_NODE_VERSION, " \u4EE5\u4E0A\u7248\u672C\u7684 node")));
  }
} // 检查Root账户
// 如果使用root账户执行，那么创建的文件就是root账户的
// 因此需要检查root账户，并自动降级


function checkRoot() {
  var rootCheck = require('root-check');

  rootCheck();
} // 检查用户主目录
// 没有用户主目录，后续有些事情做不了，比如缓存


function checkUserHome() {
  if (!homedir || !existsSync(homedir)) {
    throw new Error(colors.red('当前用户主目录不存在'));
  }
} // 检查入参
// 控制开启debug模式


function checkInputArgs() {
  if (argv.debug) {
    process.env.LOG_LEVEL = 'verbose';
  } else {
    process.env.LOG_LEVEL = 'info';
  }

  log.level = process.env.LOG_LEVEL;
  log.verbose('debug', argv);
} // 检查更新


function checkGlobalUpdate() {
  var currentVersion, npmName, _require, getSemverVersions, recentVersion;

  return regeneratorRuntime.async(function checkGlobalUpdate$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // 获取当前版本号和模块名
          currentVersion = pkg.version;
          npmName = pkg.name; // 调用 npm api 获取所有版本号
          // 比对当前版本号和所有版本号，找出所有大于当前版本的版本号
          // 找出最新的版本号，提示用户更新该版本

          _require = require('@wf-cli-dev/get-npm-info'), getSemverVersions = _require.getSemverVersions;
          _context2.next = 5;
          return regeneratorRuntime.awrap(getSemverVersions(currentVersion, npmName));

        case 5:
          recentVersion = _context2.sent;

          if (recentVersion && semver.gt(recentVersion, currentVersion)) {
            log.warn(colors.yellow("\u8BF7\u624B\u52A8\u66F4\u65B0 ".concat(npmName, ", \u5F53\u524D\u7248\u672C ").concat(currentVersion, ", \u6700\u65B0\u7248\u672C ").concat(recentVersion, "\uFF0C\u66F4\u65B0\u7684\u547D\u4EE4 npm i -g ").concat(npmName)));
          }

        case 7:
        case "end":
          return _context2.stop();
      }
    }
  });
}