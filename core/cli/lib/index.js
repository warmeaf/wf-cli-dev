'use strict'

module.exports = core

const semver = require('semver')
const colors = require('colors/safe')
const homedir = require('os').homedir()
const commander = require('commander')
const dotenv = require('dotenv')
const existsSync = require('fs').existsSync
const path = require('path')
const pkg = require('../package.json')
const log = require('@wf-cli-dev/log')
const init = require('@wf-cli-dev/init')
const constant = require('./const')
const program = new commander.Command()

async function core() {
  // try catch 包裹，不显示不必要的报错堆栈信息
  try {
    await prepare()
    registerCommand()
  } catch (e) {
    log.error(e.message)
  }
}

// 脚手架准备阶段
async function prepare() {
  checkPkgVersion()
  checkRoot()
  checkUserHome()
  checkEnv()
  await checkGlobalUpdate()
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

// 检查Root账户
// 如果使用root账户执行，那么创建的文件就是root账户的
// 因此需要检查root账户，并自动降级
function checkRoot() {
  const rootCheck = require('root-check')
  rootCheck()
}

// 检查用户主目录
// 没有用户主目录，后续有些事情做不了，比如缓存
function checkUserHome() {
  if (!homedir || !existsSync(homedir)) {
    throw new Error(colors.red('当前用户主目录不存在'))
  }
}

// 检查环境变量
function checkEnv() {
  const dotenvPath = path.resolve(homedir, '.env')
  if (existsSync(dotenvPath)) {
    // 用于加载 .env 文件中的环境变量到 Node.js 的 process.env 对象中
    dotenv.config({
      path: dotenvPath,
    })
  }

  createDefaultConfig()
}

// 创建默认的环境变量配置
function createDefaultConfig() {
  const cliConfig = {
    home: homedir,
    cliHome: '',
  }
  if (process.env.CLI_HOME) {
    cliConfig.cliHome = path.join(cliConfig.home, process.env.CLI_HOME)
  } else {
    cliConfig.cliHome = path.join(cliConfig.home, constant.DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome
}

// 检查更新
async function checkGlobalUpdate() {
  // 获取当前版本号和模块名
  const currentVersion = pkg.version
  const npmName = pkg.name
  // 调用 npm api 获取所有版本号
  // 比对当前版本号和所有版本号，找出所有大于当前版本的版本号
  // 找出最新的版本号，提示用户更新该版本
  const { getSemverVersions } = require('@wf-cli-dev/get-npm-info')
  const recentVersion = await getSemverVersions(currentVersion, npmName)
  if (recentVersion && semver.gt(recentVersion, currentVersion)) {
    log.warn(
      colors.yellow(
        `请手动更新 ${npmName}, 当前版本 ${currentVersion}, 最新版本 ${recentVersion}，更新的命令 npm i -g ${npmName}`
      )
    )
  }
}

// 注册命令
function registerCommand() {
  // 脚手架初始化
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件夹', '')

  // 注册 init 命令
  program
    .command('init [projectName]')
    .description('初始化项目')
    .option('-f, --force', '是否强制初始化项目')
    .action(init)

  const options = program.opts()
  // 监听 targetPath option
  program.on('option:targetPath', () => {
    // 为 targetPath 设置全局环境变量（这是一个开发技巧）
    process.env.CLI_TARGET_PATH = options.targetPath
  })
  // 监听 debug option
  program.on('option:debug', () => {
    if (options.debug) {
      process.env.LOG_LEVEL = 'verbose'
    } else {
      process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
  })

  // 监听未知命令
  program.on('command:*', (obj) => {
    const availableCommands = program.commands.map((cmd) => cmd.name())
    log.error(
      colors.red(`未知的命令 ${obj[0]}，请使用 -h, --help 参数查看命令列表`)
    )
    if (availableCommands.length > 0) {
      log.info(colors.blue(`可用的命令有 ${availableCommands.join(',')}`))
    }
  })

  program.parse(process.argv)
}
