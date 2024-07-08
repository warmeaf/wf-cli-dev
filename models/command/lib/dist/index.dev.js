'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var colors = require('colors');

var semver = require('semver');

var log = require('@wf-cli-dev/log');

var LOWEST_NODE_VERSION = '14.0.0';

var Command =
/*#__PURE__*/
function () {
  function Command(args) {
    _classCallCheck(this, Command);

    if (!args) {
      throw new Error(colors.red('未传入参数'));
    }

    if (!Array.isArray(args)) {
      throw new Error(colors.red('参数必须是数组类型'));
    }

    if (args.length === 0) {
      throw new Error(colors.red('参数列表不能为空'));
    }

    this._args = args;

    this._checkNodeVersion();

    this._initArgs();
  }
  /**
   * 初始化命令行参数
   * 这个函数用于处理命令行参数，它将最后一个参数赋值给 _cmd 属性
   * @private
   */


  _createClass(Command, [{
    key: "_initArgs",
    value: function _initArgs() {
      this._cmd = this._args.pop();
    }
    /**
     * 检查当前 Node 版本是否符合要求
     * 如果版本过低，将抛出错误
     * @private
     */

  }, {
    key: "_checkNodeVersion",
    value: function _checkNodeVersion() {
      // 1. 获取当前node版本号
      var currentVersion = process.version; // 2. 比对最低版本号

      var lowestVersion = LOWEST_NODE_VERSION;

      if (!semver.gte(currentVersion, lowestVersion)) {
        throw new Error(colors.red("wf-cli \u9700\u8981\u5B89\u88C5 v".concat(LOWEST_NODE_VERSION, " \u4EE5\u4E0A\u7248\u672C\u7684 node")));
      }
    }
    /**
     * 初始化函数
     * 该函数用于初始化一个操作。当前该函数作为示例，提示需要实现 init 方法。
     * @throws {Error} 如果 init 方法未实现，将抛出一个错误
     */

  }, {
    key: "init",
    value: function init() {
      throw new Error(colors.red('必须实现 init 方法'));
    }
    /**
     * 执行函数
     * 该函数用于初始化一个操作。当前该函数作为示例，提示需要实现 exec 方法。
     * @throws {Error} 如果 exec 方法未实现，将抛出一个错误
     */

  }, {
    key: "exec",
    value: function exec() {
      throw new Error(colors.red('必须实现 exec 方法'));
    }
  }]);

  return Command;
}();

module.exports = Command;