'use strict'

module.exports = core
// require: .js/.json/.node
// any -> .js
const pkg = require('../package.json')
const log = require('@wf-cli-dev/log')

function core() {
  checkVersion()
}

// 检查版本号
function checkVersion() {
  log.notice('wf-cli', pkg.version)
}
