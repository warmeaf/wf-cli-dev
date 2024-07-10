'use strict'

const colors = require('colors')
const semver = require('semver')
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
    this._checkNodeVersion()
    this._initArgs()
  }

  /**
   * 初始化命令行参数
   * 这个函数用于处理命令行参数，它将最后一个参数赋值给 _cmd 属性
   * @private
   */
  _initArgs() {
    this._cmd = this._args.pop()
  }

  /**
   * 检查当前 Node 版本是否符合要求
   * 如果版本过低，将抛出错误
   * @private
   */
  _checkNodeVersion() {
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

  /**
   * 初始化函数
   * 该函数用于初始化一个操作。当前该函数作为示例，提示需要实现 init 方法。
   * @throws {Error} 如果 init 方法未实现，将抛出一个错误
   */
  init() {
    throw new Error(colors.red('必须实现 init 方法'))
  }

  /**
   * 执行函数
   * 该函数用于初始化一个操作。当前该函数作为示例，提示需要实现 exec 方法。
   * @throws {Error} 如果 exec 方法未实现，将抛出一个错误
   */
  exec() {
    throw new Error(colors.red('必须实现 exec 方法'))
  }
}

module.exports = Command
