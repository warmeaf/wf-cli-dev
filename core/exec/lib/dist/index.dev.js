'use strict'; // 思路
// 1. targetPath -> modulePath
// 2. modulePath -> Package(npm module)
// 3. Package.getRootFile(获取入口文件)
// 4. Package.update / Package.install
// 应用面向对象的思想，封装对象，复用逻辑

var path = require('path');

var log = require('@wf-cli-dev/log');

var Package = require('@wf-cli-dev/package');

module.exports = exec;
var SETTINGS = {
  // init: '@wf-cli-dev/init',
  init: '@imooc-cli/init' // 用于调试

};
var CATCH_DIR = 'dependencies';

function exec() {
  var targetPath,
      homePath,
      _len,
      args,
      _key,
      command,
      packageName,
      packageVersion,
      storeDir,
      pkg,
      rootFile,
      _args = arguments;

  return regeneratorRuntime.async(function exec$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          targetPath = process.env.CLI_TARGET_PATH;
          homePath = process.env.CLI_HOME_PATH;
          log.verbose('targetPath', targetPath);
          log.verbose('homePath', homePath);

          for (_len = _args.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = _args[_key];
          }

          command = args.at(-1);
          packageName = SETTINGS[command.name()];
          packageVersion = 'latest'; // const packageVersion = '1.1.0' // 用于测试

          storeDir = '', pkg = null;

          if (targetPath) {
            _context.next = 26;
            break;
          }

          targetPath = path.resolve(homePath, CATCH_DIR);
          storeDir = path.resolve(targetPath, 'node_modules');
          log.verbose('targetPath', targetPath);
          log.verbose('storeDir', storeDir);
          pkg = new Package({
            targetPath: targetPath,
            storeDir: storeDir,
            packageName: packageName,
            packageVersion: packageVersion
          });
          _context.next = 17;
          return regeneratorRuntime.awrap(pkg.isExist());

        case 17:
          if (!_context.sent) {
            _context.next = 22;
            break;
          }

          _context.next = 20;
          return regeneratorRuntime.awrap(pkg.update());

        case 20:
          _context.next = 24;
          break;

        case 22:
          _context.next = 24;
          return regeneratorRuntime.awrap(pkg.install());

        case 24:
          _context.next = 27;
          break;

        case 26:
          pkg = new Package({
            targetPath: targetPath,
            packageName: packageName,
            packageVersion: packageVersion
          });

        case 27:
          rootFile = pkg.getRootFilePath();
          log.verbose('rootFile', rootFile);

          if (rootFile) {
            require(rootFile).apply(void 0, args);
          }

        case 30:
        case "end":
          return _context.stop();
      }
    }
  });
}