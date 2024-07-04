'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var path = require('path');

var existsSync = require('fs').existsSync;

var pkgDir = require('pkg-dir');

var npminstall = require('npminstall');

var fse = require('fs-extra');

var _require = require('@wf-cli-dev/utils'),
    isObject = _require.isObject,
    formatPath = _require.formatPath;

var _require2 = require('@wf-cli-dev/get-npm-info'),
    getDefaultRegistry = _require2.getDefaultRegistry,
    getNpmLatestVersion = _require2.getNpmLatestVersion;

var Package =
/*#__PURE__*/
function () {
  /**
   * Package 类的构造函数
   * 这个构造函数用于创建一个 Package 的实例，它代表一个 NPM 包或类似的可安装组件
   *
   * @param {Object} options - 包含构造函数所需配置的对象
   * @throws {Error} 如果缺少 options 参数，将抛出错误
   * @throws {Error} 如果 options 不是对象，将抛出错误
   * @property {string} options.targetPath - 包的目标安装路径，用于指定包将被安装到文件系统的哪个位置
   * @property {string} options.storeDir - 包的缓存目录，用于指定包缓存文件的存储位置，提高依赖包的安装效率，可以加快下次的安装速度
   * @property {string} options.packageName - 包的名称，用于唯一标识 NPM 注册表中的一个包
   * @property {string} options.packageVersion - 包的版本号，用于指定要安装的包的具体版本，可以是一个固定版本，如 '1.0.0'，也可以是一个语义化版本号范围，如 '^2.0.0'，还可以是 'latest'，表示安装最新版本
   */
  function Package(options) {
    _classCallCheck(this, Package);

    if (!options) {
      throw new Error('package options is required');
    }

    if (!isObject(options)) {
      throw new Error('package options must be an object');
    }

    this.targetPath = options.targetPath;
    this.storeDir = options.storeDir;
    this.packageName = options.packageName;
    this.packageVersion = options.packageVersion;
  }
  /**
   * 准备安装目标包所需的环境
   * 如果 storeDir 不存在，它将被创建
   * 如果 packageVersion 是 'latest'，它将被更新为最新版本
   * 这个方法为后续的安装操作做好了准备
   *
   * @async
   * @returns {Promise<void>} 一个 Promise，当准备工作完成时解析
   */


  _createClass(Package, [{
    key: "prepare",
    value: function prepare() {
      return regeneratorRuntime.async(function prepare$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (this.storeDir && !existsSync(this.storeDir)) {
                fse.mkdirpSync(this.storeDir);
              }

              if (!(this.packageVersion === 'latest')) {
                _context.next = 5;
                break;
              }

              _context.next = 4;
              return regeneratorRuntime.awrap(getNpmLatestVersion(this.packageName));

            case 4:
              this.packageVersion = _context.sent;

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
    /**
     * 获取缓存命令文件的完整文件路径
     * 这个文件路径是根据 this.storeDir、this.catchFilePathPrefix、this.packageVersion 和 this.catchFilePathEnd 计算出来的
     * 路径字符串的格式为：${this.storeDir}/_${this.catchFilePathPrefix}@${this.packageVersion}@${this.catchFilePathEnd}
     *
     * @returns {String} 获取缓存命令文件的完整文件路径
     */

  }, {
    key: "isExist",

    /**
     * 检查文件或目录是否存在
     * 如果 storeDir 存在，等待 prepare() 函数执行完毕
     * 然后检查 catchFilePath 是否存在
     * 如果 storeDir 不存在，直接检查 targetPath 是否存在
     * @returns {Promise<boolean>} 检查的结果是 true 或 false
     */
    value: function isExist() {
      return regeneratorRuntime.async(function isExist$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!this.storeDir) {
                _context2.next = 6;
                break;
              }

              _context2.next = 3;
              return regeneratorRuntime.awrap(this.prepare());

            case 3:
              return _context2.abrupt("return", existsSync(this.catchFilePath));

            case 6:
              return _context2.abrupt("return", existsSync(this.targetPath));

            case 7:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
    /**
     * 安装指定的 NPM 包
     * 这个方法首先执行一个 prepare() 方法，可能是在安装前的一些准备工作
     * 然后使用 npminstall 包来安装指定的 NPM 包
     *
     * @async
     * @returns {Promise<void>} 一个 Promise，当初始化完成时解析
     */

  }, {
    key: "install",
    value: function install() {
      return regeneratorRuntime.async(function install$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(this.prepare());

            case 2:
              return _context3.abrupt("return", npminstall({
                root: this.targetPath,
                storeDir: this.storeDir,
                registry: getDefaultRegistry(),
                pkgs: [{
                  name: this.packageName,
                  version: this.packageVersion
                }]
              }));

            case 3:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
    /**
     * 更新模块到最新版本
     * 这个方法首先执行一个 prepare() 方法，可能是在更新前的一些准备工作
     * 然后使用 getNpmLatestVersion() 函数获取指定包的最新版本号
     * 使用这个版本号，通过 getLatestCatchFilePath() 方法获取最新的捕获文件路径
     * 检查这个文件路径是否存在；如果不存在，使用 npminstall 包安装最新版本的包
     * 安装完成后，更新 this.packageVersion 为最新版本号
     *
     * @async
     * @returns {Promise<void>} 一个 Promise，当更新完成时解析
     */

  }, {
    key: "update",
    value: function update() {
      var latestVersion, latestCatchFilePath;
      return regeneratorRuntime.async(function update$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return regeneratorRuntime.awrap(this.prepare());

            case 2:
              _context4.next = 4;
              return regeneratorRuntime.awrap(getNpmLatestVersion(this.packageName));

            case 4:
              latestVersion = _context4.sent;
              latestCatchFilePath = this.getLatestCatchFilePath(latestVersion);

              if (existsSync(latestCatchFilePath)) {
                _context4.next = 10;
                break;
              }

              _context4.next = 9;
              return regeneratorRuntime.awrap(npminstall({
                root: this.targetPath,
                storeDir: this.storeDir,
                registry: getDefaultRegistry(),
                pkgs: [{
                  name: this.packageName,
                  version: latestVersion
                }]
              }));

            case 9:
              this.packageVersion = latestVersion;

            case 10:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getLatestCatchFilePath",
    value: function getLatestCatchFilePath(packageVersion) {
      return path.resolve(this.storeDir, "_".concat(this.catchFilePathPrefix, "@").concat(packageVersion, "@").concat(this.catchFilePathEnd));
    }
    /**
     * 获取入口文件的完整文件路径
     * 这个方法首先检查 this.storeDir 是否存在
     * 如果存在，它使用 this.catchFilePath 作为参数调用 _getRootFile 函数
     * 如果 this.storeDir 不存在，它使用 this.targetPath 作为参数调用 _getRootFile 函数
     * _getRootFile 函数内部实现了具体的逻辑来获取入口文件路径
     * 如果找到了入口文件路径，这个方法就返回该路径
     * 如果没有找到（包括 _getRootFile 函数返回 null），这个方法也返回 null
     *
     * @returns {String|Null} 入口文件的完整文件路径，如果没有找到则为 null
     */

  }, {
    key: "getRootFilePath",
    value: function getRootFilePath() {
      function _getRootFile(targetPath) {
        // 1. 获取目标路径 package.json 所在目录
        var dir = pkgDir.sync(targetPath);

        if (dir) {
          // 2. 读取 package.json
          var pkgFile = require(path.resolve(dir, 'package.json')); // 3. 寻找 main/lib
          // 4. formatPath 路径的兼容（mac/windows）


          if (pkgFile && pkgFile.main) {
            return formatPath(path.resolve(dir, pkgFile.main));
          } else if (pkgFile && pkgFile.lib) {
            return formatPath(path.resolve(dir, pkgFile.lib));
          } else {
            return null;
          }
        } else {
          return null;
        }
      }

      if (this.storeDir) {
        return _getRootFile(this.catchFilePath);
      } else {
        return _getRootFile(this.targetPath);
      }
    }
  }, {
    key: "catchFilePath",
    get: function get() {
      return path.resolve(this.storeDir, "_".concat(this.catchFilePathPrefix, "@").concat(this.packageVersion, "@").concat(this.catchFilePathEnd));
    }
  }, {
    key: "catchFilePathPrefix",
    get: function get() {
      return this.packageName.replace('/', '_');
    }
  }, {
    key: "catchFilePathEnd",
    get: function get() {
      var endIndex = this.packageName.indexOf('/');

      if (endIndex === -1) {
        return this.packageName;
      }

      var start = this.packageName.slice(0, endIndex);
      var end = this.packageName.slice(endIndex + 1);
      return "".concat(start, "/").concat(end);
    }
  }]);

  return Package;
}();

module.exports = Package;