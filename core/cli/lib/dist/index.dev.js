'use strict';

module.exports = core;

var semver = require('semver');

var colors = require('colors/safe');

var homedir = require('os').homedir();

var commander = require('commander');

var dotenv = require('dotenv');

var existsSync = require('fs').existsSync;

var path = require('path');

var pkg = require('../package.json');

var log = require('@wf-cli-dev/log');

var init = require('@wf-cli-dev/init');

var constant = require('./const');

var program = new commander.Command();

function core() {
  return regeneratorRuntime.async(function core$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(prepare());

        case 3:
          registerCommand();
          _context.next = 9;
          break;

        case 6:
          _context.prev = 6;
          _context.t0 = _context["catch"](0);
          log.error(_context.t0.message);

        case 9:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 6]]);
} // 脚手架准备阶段


function prepare() {
  return regeneratorRuntime.async(function prepare$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          checkPkgVersion();
          checkRoot();
          checkUserHome();
          checkEnv();
          _context2.next = 6;
          return regeneratorRuntime.awrap(checkGlobalUpdate());

        case 6:
        case "end":
          return _context2.stop();
      }
    }
  });
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
} // 检查环境变量


function checkEnv() {
  var dotenvPath = path.resolve(homedir, '.env');

  if (existsSync(dotenvPath)) {
    // 用于加载 .env 文件中的环境变量到 Node.js 的 process.env 对象中
    dotenv.config({
      path: dotenvPath
    });
  }

  createDefaultConfig();
} // 创建默认的环境变量配置


function createDefaultConfig() {
  var cliConfig = {
    home: homedir,
    cliHome: ''
  };

  if (process.env.CLI_HOME) {
    cliConfig.cliHome = path.join(cliConfig.home, process.env.CLI_HOME);
  } else {
    cliConfig.cliHome = path.join(cliConfig.home, constant.DEFAULT_CLI_HOME);
  }

  process.env.CLI_HOME_PATH = cliConfig.cliHome;
} // 检查更新


function checkGlobalUpdate() {
  var currentVersion, npmName, _require, getSemverVersions, recentVersion;

  return regeneratorRuntime.async(function checkGlobalUpdate$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // 获取当前版本号和模块名
          currentVersion = pkg.version;
          npmName = pkg.name; // 调用 npm api 获取所有版本号
          // 比对当前版本号和所有版本号，找出所有大于当前版本的版本号
          // 找出最新的版本号，提示用户更新该版本

          _require = require('@wf-cli-dev/get-npm-info'), getSemverVersions = _require.getSemverVersions;
          _context3.next = 5;
          return regeneratorRuntime.awrap(getSemverVersions(currentVersion, npmName));

        case 5:
          recentVersion = _context3.sent;

          if (recentVersion && semver.gt(recentVersion, currentVersion)) {
            log.warn(colors.yellow("\u8BF7\u624B\u52A8\u66F4\u65B0 ".concat(npmName, ", \u5F53\u524D\u7248\u672C ").concat(currentVersion, ", \u6700\u65B0\u7248\u672C ").concat(recentVersion, "\uFF0C\u66F4\u65B0\u7684\u547D\u4EE4 npm i -g ").concat(npmName)));
          }

        case 7:
        case "end":
          return _context3.stop();
      }
    }
  });
} // 注册命令


function registerCommand() {
  // 脚手架初始化
  program.name(Object.keys(pkg.bin)[0]).usage('<command> [options]').version(pkg.version).option('-d, --debug', '是否开启调试模式', false).option('-tp, --targetPath <targetPath>', '是否指定本地调试文件夹', ''); // 注册 init 命令

  program.command('init [projectName]').description('初始化项目').option('-f, --force', '是否强制初始化项目').action(init);
  var options = program.opts(); // 监听 targetPath option

  program.on('option:targetPath', function () {
    // 为 targetPath 设置全局环境变量（这是一个开发技巧）
    process.env.CLI_TARGET_PATH = options.targetPath;
  }); // 监听 debug option

  program.on('option:debug', function () {
    if (options.debug) {
      process.env.LOG_LEVEL = 'verbose';
    } else {
      process.env.LOG_LEVEL = 'info';
    }

    log.level = process.env.LOG_LEVEL;
  }); // 监听未知命令

  program.on('command:*', function (obj) {
    var availableCommands = program.commands.map(function (cmd) {
      return cmd.name();
    });
    log.error(colors.red("\u672A\u77E5\u7684\u547D\u4EE4 ".concat(obj[0], "\uFF0C\u8BF7\u4F7F\u7528 -h, --help \u53C2\u6570\u67E5\u770B\u547D\u4EE4\u5217\u8868")));

    if (availableCommands.length > 0) {
      log.info(colors.blue("\u53EF\u7528\u7684\u547D\u4EE4\u6709 ".concat(availableCommands.join(','))));
    }
  });
  program.parse(process.argv);
}