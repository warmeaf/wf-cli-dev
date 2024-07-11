'use strict'

const fs = require('fs')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const Command = require('@wf-cli-dev/command')
const semver = require('semver')
const log = require('@wf-cli-dev/log')

const TYPE_PROJECT = 'project'
const TYPE_COMPONENT = 'component'

class InitCommand extends Command {
  projectName = ''
  force = null
  constructor(args) {
    super(args)
    this.init()
    this.exec()
  }

  // 初始化参数
  init() {
    this.projectName = this.args[0]
    this.force = this.args[1]?.force || false
  }

  async exec() {
    try {
      // 1. 准备阶段
      const res = await this._prepare()
      // 2. 下载模板
      // 3. 安装模板
    } catch (e) {
      log.error(e.message)
    }
  }

  async _prepare() {
    // 1. 判断当前目录是否为空
    if (!this._isCwdEmpty()) {
      // 1.1. 询问用户是否继续创建
      let isContinue = true
      if (!this.force) {
        isContinue = (
          await inquirer.prompt({
            type: 'list',
            name: 'isContinue',
            message: '当前目录不为空，继续初始化项目吗？',
            choices: [
              {
                name: '初始化项目，清空当前目录',
                value: true,
              },
              {
                name: '放弃初始化，退出',
                value: false,
              },
            ],
          })
        ).isContinue
      }

      if (!isContinue) {
        return
      }

      if (isContinue) {
        // 给用户二次确认
        isContinue = (
          await inquirer.prompt({
            type: 'confirm',
            name: 'isContinue',
            message: '请确认是否清空当前目录',
            default: false,
          })
        ).isContinue
        if (isContinue) {
          // 清空文件夹里的内容
          fse.emptyDirSync(process.cwd())
        } else {
          return
        }
      }
    }

    return this._getProjectInfo()
  }

  async _getProjectInfo() {
    // 1. 选择项目类型
    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: '请选择项目类型',
      choices: [
        {
          name: '项目',
          value: TYPE_PROJECT,
        },
        {
          name: '组件',
          value: TYPE_COMPONENT,
        },
      ],
    })
    if (type === TYPE_PROJECT) {
      // 2. 获取项目基本信息
      const projectInfo = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: '请输入项目名称',
          default: 'my-project',
          // 1. 首字符必须是字母
          // 2. 尾字符必须是字母或数字
          // 3. 特殊字符仅仅允许-_
          validate: function (v) {
            const done = this.async()
            const projectNameRegex = /^[a-zA-Z][a-zA-Z0-9\-_]*[a-zA-Z0-9]$/
            setTimeout(function () {
              if (!projectNameRegex.test(v)) {
                done(
                  '请输入合法的项目名称（首字符必须是字母，尾字符必须是字母或数字，特殊字符仅仅允许-_）'
                )
                return
              }
              done(null, true)
            }, 0)
          },
        },
        {
          type: 'input',
          name: 'projectVersion',
          message: '请输入项目版本号',
          default: '0.0.1',
          validate: function (v) {
            const done = this.async()
            setTimeout(function () {
              if (!semver.valid(v)) {
                done('请输入合法的项目版本号（示例：1.0.1、v1.0.0）')
                return
              }
              done(null, true)
            }, 0)
          },
          filter: function (v) {
            if (!semver.valid(v)) {
              return v
            } else {
              return semver.valid(v)
            }
          },
        },
      ])
      console.log(projectInfo)
    } else if (type === TYPE_COMPONENT) {
      // 3. 获取组件描述信息
    }
  }

  /**
   * 检查当前工作目录是否为空
   * 此函数读取当前工作目录中的文件列表，并进行过滤，移除了以点`.`开头的文件，因为它们通常是隐藏文件
   * 同时移除了名为`node_modules`的文件，然后检查过滤后的文件列表是否为空，或者其长度是否为`0`，以确定目录是否为空
   * @private
   * @returns {boolean} 如果当前工作目录为空或者文件列表长度为`0`，则返回`true`，否则返回`false`
   */
  _isCwdEmpty() {
    let files = fs.readdirSync(process.cwd())
    // 过滤隐藏文件
    files = files.filter((f) => !f.startsWith('.') && f !== 'node_modules')
    return !files || files.length === 0
  }
}

/**
 * 初始化函数
 * @param {Arrary} args - 初始化参数
 */
function init(args) {
  new InitCommand(args)
}

module.exports = init
