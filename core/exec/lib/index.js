'use strict'

// 思路
// 1. targetPath -> modulePath
// 2. modulePath -> Package(npm module)
// 3. Package.getRootFile(获取入口文件)
// 4. Package.update / Package.install

// 应用面向对象的思想，封装对象，复用逻辑

const path = require('path')
const log = require('@wf-cli-dev/log')
const Package = require('@wf-cli-dev/package')
const { exec: spawn } = require('@wf-cli-dev/utils')

const SETTINGS = {
  init: '@wf-cli-dev/init'
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
      const argsString = JSON.stringify(args.slice(0, args.length - 1))
      const code = `require('${rootFile}')(${argsString})`
      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit',
      })
      child.on('exit', (e) => {
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

module.exports = exec
