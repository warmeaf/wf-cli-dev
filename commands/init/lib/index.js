'use strict'
// 选择项目模板
// 1. 通过 API 获取模板信息
// 1.1. 通过egg.js搭建一套后端系统
// 1.2. 通过npm存储项目模板
// 1.3. 讲项目模板信息存储到mongodb数据库中
// 1.4. 通过egg.js获取mongodb中的数据并通过api返回

const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const Command = require('@wf-cli-dev/command')
const semver = require('semver')
const { glob } = require('glob')
const ejs = require('ejs')
const log = require('@wf-cli-dev/log')
const Package = require('@wf-cli-dev/package')
const { execAsync } = require('@wf-cli-dev/utils')
const { getProjectTemplate } = require('./api/index')
const { exec: spawn, formatPath } = require('@wf-cli-dev/utils')

const {
  TYPE_PROJECT,
  TYPE_COMPONENT,
  TEMPLATEE_TYPE_NORMAL,
  WHITE_COMMANDS,
} = require('./const')

class InitCommand extends Command {
  projectName = ''
  force = null
  templates = null
  templatePkg = null
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
      console.log(projectInfo)
      if (projectInfo && projectInfo.template) {
        // 2. 下载模板
        await this._downloadTemplate(projectInfo)
        // 3. 安装模板
        await this._installTemplate(projectInfo)
      }
    } catch (e) {
      log.error(e.message)
    } finally {
      process.exit(0)
    }
  }

  async _installTemplate(projectInfo) {
    if (!projectInfo.template.type) {
      projectInfo.template.type = TEMPLATEE_TYPE_NORMAL
    }
    if (projectInfo.template.type === TEMPLATEE_TYPE_NORMAL) {
      // 标准安装
      await this._installNormalTemplate(projectInfo)
    } else {
      // 自定义安装
      await this._installCustomTemplate(projectInfo)
    }
  }

  async _installNormalTemplate(projectInfo) {
    const templatePath = path.resolve(
      this.templatePkg.catchFilePath,
      'template'
    )
    const targetPath = path.resolve(process.cwd())
    log.info('开始安装模板...')
    fse.ensureDir(targetPath)
    fse.copySync(templatePath, targetPath)
    log.success('安装模板成功')
    // 渲染项目信息到文件中
    await this._ejsRender(projectInfo)
    // 安装依赖
    if (projectInfo.template.installCommand) {
      const initCommand = projectInfo.template.installCommand.split(' ')
      await this._execCmd(initCommand, '安装依赖')
    }
    // 启动项目
    if (projectInfo.template.startCommand) {
      const initCommand = projectInfo.template.startCommand.split(' ')
      await this._execCmd(initCommand, '启动项目')
    }
  }

  async _installCustomTemplate(projectInfo) {
    const templatePath = formatPath(
      path.resolve(this.templatePkg.catchFilePath, 'template')
    )
    const targetPath = formatPath(path.resolve(process.cwd()))
    const argsString = JSON.stringify(projectInfo)
    const rootFile = this.templatePkg.getRootFilePath()
    log.verbose('自定义安装入口文件路径', rootFile)
    log.verbose('自定义安装模板路径', templatePath)
    log.verbose('自定义安装目标路径', targetPath)

    if(!rootFile) {
      throw new Error('自定义安装入口文件路径不存在')
    }

    return new Promise((resolve, reject) => {
      const code = `require('${rootFile}')('${templatePath}', '${targetPath}', ${argsString})`
      const child = spawn('node', ['-e', code], {
        stdio: 'inherit',
      })
      child.on('exit', () => {
        resolve()
      })
      child.on('error', (e) => {
        reject(e)
      })
    })
  }

  /**
   * 渲染项目信息到文件中
   * @param {Object} projectInfo - 包含项目名和项目版本的对象
   * @returns {Promise} - 一个 Promise，当初始渲染完成后解决
   */
  async _ejsRender(projectInfo) {
    const data = {
      name: projectInfo.projectName,
      version: projectInfo.projectVersion,
      description: projectInfo.projectDescription,
    }
    const { renderIgnore = [] } = projectInfo.template
    const cwd = process.cwd()
    return new Promise((resolve, reject) => {
      glob('**', {
        cwd,
        ignore: ['node_modules/**', ...renderIgnore],
        nodir: true,
      })
        .then((files) => {
          Promise.all(
            files.map((file) => {
              return new Promise((resolve1, reject1) => {
                const filePath = path.resolve(cwd, file)
                // console.log(filePath)
                ejs.renderFile(filePath, data, (err, str) => {
                  if (err) {
                    reject1(err)
                  } else {
                    // console.log(str)
                    fse.writeFileSync(filePath, str)
                    resolve1()
                  }
                })
              })
            })
          )
            .then(() => {
              resolve()
            })
            .catch((err) => {
              reject(err)
            })
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  /**
   * 执行给定的命令并在控制台中显示结果
   * 如果命令执行失败，将抛出错误
   *
   * @param {Array} initCommand - 命令和参数的数组
   * @param {string} execText - 标识要执行的操作的文本
   * @throws {Error} 如果命令不支持或执行失败，抛出相应的错误
   */
  async _execCmd(initCommand, execText) {
    log.info(`开始${execText}...`)
    const cmd = WHITE_COMMANDS.includes(initCommand[0]) ? initCommand[0] : null
    if (!cmd) {
      throw new Error(
        `不支持的命令: ${initCommand[0]}，可执行的命令为：${WHITE_COMMANDS.join(
          ', '
        )}`
      )
    }
    const args = initCommand[1]
    const res = await execAsync(cmd, [args], {
      cwd: process.cwd(),
      stdio: 'inherit',
    })
    if (parseInt(res) !== 0) {
      throw new Error(`${execText}失败`)
    } else {
      log.success(`${execText}成功`)
    }
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

    this.templatePkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    })
    if (await this.templatePkg.isExist()) {
      await this.templatePkg.update()
    } else {
      await this.templatePkg.install()
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
      throw new Error('没有找到项目/组件模板信息')
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
    this.templates = this.templates.filter((item) => item.tags.includes(type))
    if (this.templates.length === 0) {
      throw new Error('没有找到项目/组件模板信息')
    }
    // 2. 获取项目组件基本信息，选择模板
    project = await this._getInfo(type)

    const { projectTemplate: packageName } = project
    const currentTemplate = this.templates.find(
      (item) => item.npmName === packageName
    )

    return {
      projectType: type,
      projectName: project.projectName,
      projectVersion: project.projectVersion,
      projectDescription: project.projectDescription,
      template: {
        ...currentTemplate,
      },
    }
  }

  /**
   * 获取用户输入的信息，包括项目或组件的名称、版本号、描述和模板选择
   *
   * @param {string} type - 项目或组件的类型（'TYPE_PROJECT'表示项目，'TYPE_COMPONENT'表示组件）
   * @return {Promise} - 包含用户输入信息的 Promise
   */
  _getInfo(type) {
    const typeText = type === TYPE_PROJECT ? '项目' : '组件'
    return inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: `请输入${typeText}名称`,
        default: this.projectName,
        // 1. 首字符必须是小写字母
        // 2. 尾字符必须是小写字母或数字
        // 3. 特殊字符仅仅允许-
        validate: function (v) {
          const done = this.async()
          const projectNameRegex = /^[a-z][a-z0-9\-]*[a-z0-9]$/
          setTimeout(function () {
            if (!projectNameRegex.test(v)) {
              done(
                `请输入合法的${typeText}名称（首字符必须是小写字母，尾字符必须是小写字母或数字，特殊字符仅仅允许-）`
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
        message: `请输入${typeText}版本号`,
        default: '0.0.1',
        validate: function (v) {
          const done = this.async()
          setTimeout(function () {
            if (!semver.valid(v)) {
              done(`请输入合法的${typeText}版本号（示例：1.0.1、v1.0.0）`)
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
        type: 'input',
        name: 'projectDescription',
        message: `请输入${typeText}描述`,
        default: '',
        validate: function (v) {
          const done = this.async()
          setTimeout(function () {
            if (!v) {
              done(`${typeText}描述不能为空`)
              return
            }
            done(null, true)
          }, 0)
        },
      },
      {
        type: 'list',
        name: 'projectTemplate',
        message: `请选择${typeText}模板`,
        choices: this.templates.map((item) => {
          return {
            name: item.name,
            value: item.npmName,
          }
        }),
      },
    ])
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
