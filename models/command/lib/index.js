'use strict'

const colors = require('colors')
const semver = require('semver')
const log = require('@wf-cli-dev/log')
const LOWEST_NODE_VERSION = '14.0.0'

class Command {
  constructor(args) {
    if (!args) {
      throw new Error(colors.red('未传入参数'))
    }
    if (!Array.isArray(args)) {
      throw new Error(colors.red('参数必须是数组类型'))
    }
    if (args.length === 0) {
      throw new Error(colors.red('参数列表不能为空'))
    }

    this._args = args
    this.checkNodeVersion()
    this.initArgs()
  }

  initArgs() {
    this._cmd = this._args.pop()
  }

  /**
   * 检查当前 Node 版本是否符合要求
   * 如果版本过低，将抛出错误
   */
  checkNodeVersion() {
    // 1. 获取当前node版本号
    const currentVersion = process.version
    // 2. 比对最低版本号
    const lowestVersion = LOWEST_NODE_VERSION
    if (!semver.gte(currentVersion, lowestVersion)) {
      throw new Error(
        colors.red(`wf-cli 需要安装 v${LOWEST_NODE_VERSION} 以上版本的 node`)
      )
    }
  }

  init() {
    throw new Error(colors.red('必须实现 init 方法'))
  }

  exec() {
    throw new Error(colors.red('必须实现 exec 方法'))
  }
}

module.exports = Command
