'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var fs = require('fs');

var inquirer = require('inquirer');

var fse = require('fs-extra');

var Command = require('@wf-cli-dev/command');

var log = require('@wf-cli-dev/log');

var prompt = inquirer.createPromptModule();

var InitCommand =
/*#__PURE__*/
function (_Command) {
  _inherits(InitCommand, _Command);

  function InitCommand(args) {
    var _this;

    _classCallCheck(this, InitCommand);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(InitCommand).call(this, args));

    _this.init();

    _this.exec();

    return _this;
  } // 初始化参数


  _createClass(InitCommand, [{
    key: "init",
    value: function init() {}
  }, {
    key: "exec",
    value: function exec() {
      return regeneratorRuntime.async(function exec$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return regeneratorRuntime.awrap(this.prepare());

            case 3:
              _context.next = 8;
              break;

            case 5:
              _context.prev = 5;
              _context.t0 = _context["catch"](0);
              log.error(_context.t0.message);

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[0, 5]]);
    }
  }, {
    key: "prepare",
    value: function prepare() {
      var _ref, action, _ref2, _action;

      return regeneratorRuntime.async(function prepare$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (this._isCwdEmpty()) {
                _context2.next = 13;
                break;
              }

              _context2.next = 3;
              return regeneratorRuntime.awrap(prompt({
                type: 'list',
                name: 'action',
                message: '当前目录不为空，继续初始化项目吗？',
                choices: [{
                  name: '初始化项目，清空当前目录',
                  value: true
                }, {
                  name: '放弃初始化，退出',
                  value: false
                }]
              }));

            case 3:
              _ref = _context2.sent;
              action = _ref.action;

              if (!action) {
                _context2.next = 11;
                break;
              }

              _context2.next = 8;
              return regeneratorRuntime.awrap(prompt({
                type: 'confirm',
                name: 'action',
                message: '请确认是否清空当前目录',
                "default": false
              }));

            case 8:
              _ref2 = _context2.sent;
              _action = _ref2.action;

              if (_action) {
                // 清空文件夹里的内容
                fse.emptyDirSync(process.cwd());
              }

            case 11:
              _context2.next = 13;
              break;

            case 13:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "_isCwdEmpty",
    value: function _isCwdEmpty() {
      var files = fs.readdirSync(process.cwd()); // 过滤隐藏文件

      files = files.filter(function (f) {
        return !f.startsWith('.') && f !== 'node_modules';
      });
      return !files || files.length === 0;
    }
  }]);

  return InitCommand;
}(Command);

function init(args) {
  new InitCommand(args);
}

module.exports = init;