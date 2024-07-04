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

module.exports = exec

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
    await pkg.isExist()
    // if (await pkg.isExist()) {
    //   console.log('package is exist')
    // } else {
    //   await pkg.install()
    // }
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
    require(rootFile)(...args)
  }
}
