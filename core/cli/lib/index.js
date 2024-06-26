'use strict'

module.exports = core

const semver = require('semver')
const colors = require('colors/safe')
// require: .js/.json/.node
// any -> .js
const pkg = require('../package.json')
const log = require('@wf-cli-dev/log')
const constant = require('./const')

function core() {
  // try catch 包裹，不显示不必要的报错堆栈信息
  try {
    checkPkgVersion()
    checkNodeVersion()
  } catch (e) {
    log.error(e.message)
  }
}

// 检查包版本号
function checkPkgVersion() {
  log.notice('wf-cli 版本', pkg.version)
}

// 检查node版本号
function checkNodeVersion() {
  // 1. 获取当前node版本号
  const currentVersion = process.version
  // 2. 比对最低版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(
      colors.red(
        `wf-cli 需要安装 v${constant.LOWEST_NODE_VERSION} 以上版本的 node`
      )
    )
  }
}
