'use strict'

// 思路
// 1. targetPath -> modulePath
// 2. modulePath -> Package(npm module)
// 3. Package.getRootFile(获取入口文件)
// 4. Package.update / Package.install

// 应用面向对象的思想，封装对象，复用逻辑

const path = require('path')
const cp = require('child_process')
const log = require('@wf-cli-dev/log')
const Package = require('@wf-cli-dev/package')

const SETTINGS = {
  // init: '@wf-cli-dev/init',
  init: '@imooc-cli/init', // 用于调试
}
const CATCH_DIR = 'dependencies'

async function exec(...args) {
  let targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH
  log.verbose('targetPath', targetPath)
  log.verbose('homePath', homePath)

  const command = args.at(-1)
  const packageName = SETTINGS[command.name()]
  const packageVersion = 'latest'
  // const packageVersion = '1.1.0' // 用于测试

  let storeDir = '',
    pkg = null
  if (!targetPath) {
    targetPath = path.resolve(homePath, CATCH_DIR)
    storeDir = path.resolve(targetPath, 'node_modules')
    log.verbose('targetPath', targetPath)
    log.verbose('storeDir', storeDir)

    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    })
    if (await pkg.isExist()) {
      await pkg.update()
    } else {
      await pkg.install()
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    })
  }
  const rootFile = pkg.getRootFilePath()
  log.verbose('rootFile', rootFile)
  if (rootFile) {
    try {
      const argsString  = JSON.stringify(args.slice(0, args.length - 1))
      const code = `require('${rootFile}')(${argsString})`
      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit',
      })
      child.on('exit', (e) => {
        log.verbose('命令执行成功：' + e)
        process.exit(e)
      })
      child.on('error', (e) => {
        log.error(e.message)
        process.exit(1)
      })
    } catch (e) {
      log.error(e.message)
    }
  }
}

/**
 * 在 Node.js 中启动一个新的子进程，执行指定的命令。
 *
 * 这个函数接受三个参数：命令、命令参数数组和一个可选的配置对象。
 * 在 Windows 系统中，它会使用 'cmd' 作为命令，并将 '/c' 作为参数之一，以执行给定的命令。
 * 在其他操作系统中，它会直接使用给定的命令。
 *
 * @param {string} command - 要执行的命令。
 * @param {Array} args - 命令的参数。
 * @param {Object} options - 可选的配置对象。
 * @return {ChildProcess} 一个子进程对象。
 * @throws {Error} 如果命令为空，则抛出错误。
 */
function spawn(command, args, options) {
  const win32 = process.platform === 'win32'
  const cmd = win32 ? 'cmd' : command
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args
  return cp.spawn(cmd, cmdArgs, options)
}

module.exports = exec
