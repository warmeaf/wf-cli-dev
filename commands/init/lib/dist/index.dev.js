'use strict';

module.exports = init;

function init() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var projectName = args[0];
  var options = args[1];
  var command = args.at(-1); // console.log(projectName, options, command)
}