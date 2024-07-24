'use strict'
const path = require('path')
const cp = require('child_process')

/**
 * 检查给定的值是否为对象
 * @param {*} o - 要检查的值
 * @returns {boolean} - 如果值是对象，则返回 true；否则返回 false
 */
function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

/**
 * 格式化路径字符串，将反斜杠转换为斜杠
 * 在 Windows 系统中，路径分隔符是反斜杠（\）
 * 在 Unix 或类 Unix 系统（如 Linux 和 macOS）中，路径分隔符是正斜杠（/）
 * @param {string} p - 要格式化的路径字符串
 * @returns {string} - 格式化后的路径字符串
 */
function formatPath(p) {
  if (p && typeof p === 'string') {
    const sep = path.sep
    if (sep === '/') {
      return p
    } else {
      return p.replace(/\\/g, '/')
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
function exec(command, args, options) {
  if (!command) throw new Error('exec 函数的第一个参数不能为空')
  const win32 = process.platform === 'win32'
  const cmd = win32 ? 'cmd' : command
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args
  return cp.spawn(cmd, cmdArgs, options)
}

/**
 * 异步执行给定的命令，并在执行完成时解析或拒绝 Promise
 * @param {string} command - 要执行的命令
 * @param {string[]} args - 命令参数列表
 * @param {Object} options - 执行命令的选项对象
 * @return {Promise} - 一个 Promise 对象，当命令成功完成时 resolve，失败时 reject
 */
function execAsync(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = exec(command, args, options)
    child.on('error', (err) => {
      reject(err)
    })
    child.on('exit', (data) => {
      resolve(data)
    })
  })
}

module.exports = {
  isObject,
  formatPath,
  exec,
  execAsync,
}
