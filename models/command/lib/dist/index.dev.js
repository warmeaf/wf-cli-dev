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
    this.checkNodeVersion();
    this.initArgs();
  }

  _createClass(Command, [{
    key: "initArgs",
    value: function initArgs() {
      this._cmd = this._args.pop();
    }
    /**
     * 检查当前 Node 版本是否符合要求
     * 如果版本过低，将抛出错误
     */

  }, {
    key: "checkNodeVersion",
    value: function checkNodeVersion() {
      // 1. 获取当前node版本号
      var currentVersion = process.version; // 2. 比对最低版本号

      var lowestVersion = LOWEST_NODE_VERSION;

      if (!semver.gte(currentVersion, lowestVersion)) {
        throw new Error(colors.red("wf-cli \u9700\u8981\u5B89\u88C5 v".concat(LOWEST_NODE_VERSION, " \u4EE5\u4E0A\u7248\u672C\u7684 node")));
      }
    }
  }, {
    key: "init",
    value: function init() {
      throw new Error(colors.red('必须实现 init 方法'));
    }
  }, {
    key: "exec",
    value: function exec() {
      throw new Error(colors.red('必须实现 exec 方法'));
    }
  }]);

  return Command;
}();

module.exports = Command;