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
  function Package(options) {
    _classCallCheck(this, Package);

    if (!options) {
      throw new Error('package options is required');
    }

    if (!isObject(options)) {
      throw new Error('package options must be an object');
    } // package 的目标路径


    this.targetPath = options.targetPath; // package 缓存路径

    this.storeDir = options.storeDir; // package 的 packageName

    this.packageName = options.packageName;
    this.packageVersion = options.packageVersion;
  }

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
    } // 更新包

  }, {
    key: "update",
    value: function update() {
      console.log('package update');
    }
    /**
     * 获取根文件路径
     * 此函数用于获取指定目录下 package.json 文件中的 main 或 lib 属性所对应的文件路径
     * 如果目录下不存在 package.json 文件，或者文件中没有 main 或 lib 属性，函数将返回 null
     * @param {string} targetPath - 要检查的目标路径
     * @returns {string|null} - 格式化后的文件路径，如果获取失败或没有相关属性，则返回 null
     */

  }, {
    key: "getRootFilePath",
    value: function getRootFilePath() {
      // 1. 获取目标路径 package.json 所在目录
      var dir = pkgDir.sync(this.targetPath);

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

      return this.packageName.slice(0, endIndex);
    }
  }]);

  return Package;
}();

module.exports = Package;