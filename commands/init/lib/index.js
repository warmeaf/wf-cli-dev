'use strict'
// 选择项目模板
// 1. 通过 API 获取模板信息
// 1.1. 通过egg.js搭建一套后端系统
// 1.2. 通过npm存储项目模板
// 1.3. 讲项目模板信息存储到mongodb数据库中
// 1.4. 通过egg.js获取mongodb中的数据并通过api返回

const fs = require('fs')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const Command = require('@wf-cli-dev/command')
const semver = require('semver')
const log = require('@wf-cli-dev/log')
const Package = require('@wf-cli-dev/package')
const { getProjectTemplate } = require('./api/index')

const TYPE_PROJECT = 'project'
const TYPE_COMPONENT = 'component'

class InitCommand extends Command {
  projectName = ''
  force = null
  templates = null
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
      const projectInfo = await this._prepare()
      // console.log(projectInfo)
      if (projectInfo && projectInfo.template) {
        // 2. 下载模板
        await this._downloadTemplate(projectInfo)
        // 3. 安装模板
        await this._installTemplate(projectInfo)
      }
    } catch (e) {
      log.error(e.message)
    }
  }

  async _installTemplate(projectInfo) {
    console.log(projectInfo)
  }

  /**
   * 下载模板
   * @returns {Promise<void>} - 下载或更新完成后的 Promise
   */
  async _downloadTemplate(projectInfo) {
    const homePath = process.env.CLI_HOME_PATH
    const targetPath = path.resolve(homePath, 'templates')
    const storeDir = path.resolve(homePath, 'templates', 'node_modules')
    const { npmName: packageName, version: packageVersion } =
      projectInfo.template

    const pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    })
    // console.log(pkg)
    if (await pkg.isExist()) {
      await pkg.update()
    } else {
      await pkg.install()
    }
  }

  /**
   * 准备工作，包括获取项目模板信息、处理当前目录非空的情况
   * @throws {Error} 如果获取项目模板信息失败或模板信息为空，抛出错误
   * @returns {Promise} 一个 Promise，当初始化流程完成后，解析为项目信息
   */
  async _prepare() {
    const res = await getProjectTemplate()
    if (!res || !Array.isArray(res) || res.length === 0) {
      throw new Error('没有找到项目模板信息')
    } else {
      this.templates = res
    }

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
    let project = {}
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
      project = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: '请输入项目名称',
          default: this.projectName,
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
        {
          type: 'list',
          name: 'projectTemplate',
          message: '请选择项目模板',
          choices: this.templates.map((item) => {
            return {
              name: item.name,
              value: item.npmName,
            }
          }),
        },
      ])
    } else if (type === TYPE_COMPONENT) {
      // 3. 获取组件描述信息
    }

    const { projectTemplate: packageName } = project
    const currentTemplate = this.templates.find(
      (item) => item.npmName === packageName
    )

    return {
      projectType: type,
      projectName: project.projectName,
      projectVersion: project.projectVersion,
      template: {
        ...currentTemplate,
      },
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
  try {
    new InitCommand(args)
  } catch (e) {
    log.error(e.message)
  }
}

module.exports = init
