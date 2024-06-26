#!/usr/bin/env node

const importLocal = require('import-local')

// 使用了 import-local 模块来检查当前模块是否被本地安装的版本覆盖
// 如果是本地版本，它会优先使用本地版本而不是全局安装的版本
if (importLocal(__filename)) {
  require('npmlog').info('cli', '正在使用 wf-cli 本地版本')
} else {
  require('../lib')(process.argv.slice(2))
}
