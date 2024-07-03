'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var path = require('path');

var pkgDir = require('pkg-dir');

var npminstall = require('npminstall');

var _require = require('@wf-cli-dev/utils'),
    isObject = _require.isObject,
    formatPath = _require.formatPath;

var _require2 = require('@wf-cli-dev/get-npm-info'),
    getDefaultRegistry = _require2.getDefaultRegistry;

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
  } // 判断当前 package 是否存在


  _createClass(Package, [{
    key: "isExist",
    value: function isExist() {
      console.log('package isExist');
    } // 安装包

  }, {
    key: "install",
    value: function install() {
      return npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [{
          name: this.packageName,
          version: this.packageVersion
        }]
      });
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
  }]);

  return Package;
}();

module.exports = Package;