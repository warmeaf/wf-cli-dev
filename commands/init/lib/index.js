'use strict'

const fs = require('fs')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const Command = require('@wf-cli-dev/command')
const log = require('@wf-cli-dev/log')
const prompt = inquirer.createPromptModule()

class InitCommand extends Command {
  constructor(args) {
    super(args)
    this.init()
    this.exec()
  }

  // 初始化参数
  init() {}

  async exec() {
    try {
      // 1. 准备阶段
      await this.prepare()
      // 2. 下载模板
      // 3. 安装模板
    } catch (e) {
      log.error(e.message)
    }
  }

  async prepare() {
    // 1. 判断当前目录是否为空
    if (!this._isCwdEmpty()) {
      // 1.1. 询问用户是否继续创建
      const { action } = await prompt({
        type: 'list',
        name: 'action',
        message: '当前目录不为空，继续初始化项目吗？',
        choices: [
          {
            name: '清空当前目录',
            value: true,
          },
          {
            name: '放弃初始化，退出',
            value: false,
          },
        ],
      })
      if (!action) {
        return
      } else {
        // 清空文件夹里的内容
        fse.emptyDirSync(process.cwd())
      }
    } else {
    }
  }

  _isCwdEmpty() {
    let files = fs.readdirSync(process.cwd())
    // 过滤隐藏文件
    files = files.filter((f) => !f.startsWith('.') && f !== 'node_modules')
    return !files || files.length === 0
  }
}

function init(...args) {
  new InitCommand(args)
}

module.exports = init
