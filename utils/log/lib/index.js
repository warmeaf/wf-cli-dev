'use strict'

const log = require('npmlog')

// 根据环境设置日志级别，实现 debug 模式
log.level = process.env.LOG_LEVEL || 'info'
// 修改前缀
log.heading = '[wf-cli]'
// 添加自定义的日志级别
log.addLevel('success', 2000, { fg: 'green', bold: true })

module.exports = log
