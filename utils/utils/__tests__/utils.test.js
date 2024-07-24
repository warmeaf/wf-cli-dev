'use strict'
const { describe, test, expect } = require('@jest/globals')
const cp = require('child_process')

jest.mock('child_process')

describe('isObject 函数测试', () => {
  const isObject = require('../lib/index').isObject

  test('值为对象应该返回 true', () => {
    expect(isObject({})).toBe(true)
  })

  test('值不是对象返回false', () => {
    expect(isObject(123)).toBe(false)
    expect(isObject('abc')).toBe(false)
    expect(isObject(null)).toBe(false)
    expect(isObject(undefined)).toBe(false)
    expect(isObject([1, 2, 3])).toBe(false)
  })
})

describe('formatPath 函数测试', () => {
  const formatPath = require('../lib/index').formatPath

  // 测试路径为空的情况
  test('路径为空', () => {
    expect(formatPath('')).toEqual(undefined)
  })

  // 测试路径为非字符串的情况
  test('路径为非字符串', () => {
    expect(formatPath(123)).toEqual(undefined)
  })

  // 测试路径为斜杠的情况
  test('路径为斜杠', () => {
    expect(formatPath('/')).toEqual('/')
  })

  // 测试路径为反斜杠的情况
  test('路径为反斜杠', () => {
    expect(formatPath('\\')).toEqual('/')
  })

  // 测试路径包含反斜杠的情况
  test('路径包含反斜杠', () => {
    expect(formatPath('C:\\Program Files')).toEqual('C:/Program Files')
  })
})

describe('exec 函数测试', () => {
  const exec = require('../lib/index').exec
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('命令参数为空，抛出错误', () => {
    expect(() => exec('', [], {})).toThrow(Error)
  })

  it('windows 系统执行命令', () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
    })

    exec('echo', ['hello'], {})

    expect(cp.spawn).toHaveBeenCalledWith('cmd', ['/c', 'echo', 'hello'], {})
  })

  it('非 windows 系统执行命令', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
    })

    exec('echo', ['hello'], {})

    expect(cp.spawn).toHaveBeenCalledWith('echo', ['hello'], {})
  })

  it('携带参数调用 spawn', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
    })

    const options = { cwd: '/some/path' }
    exec('echo', ['hello'], options)

    expect(cp.spawn).toHaveBeenCalledWith('echo', ['hello'], options)
  })
})

describe('execAsync 函数', () => {
  const execAsync = require('../lib/index').execAsync
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('exit 事件触发 resolve 状态', async () => {
    const mockChild = {
      on: jest.fn((event, callback) => {
        if (event === 'exit') {
          callback(0)
        }
      }),
    }
    cp.spawn.mockReturnValue(mockChild)

    const exitCode = await execAsync('echo', ['hello'], {})
    expect(exitCode).toBe(0)
    expect(cp.spawn).toHaveBeenCalledWith('echo', ['hello'], {})
  })

  it('error 事件触发 reject 状态', async () => {
    const mockChild = {
      on: jest.fn((event, callback) => {
        if (event === 'error') {
          callback(new Error('Test error'))
        }
      }),
    }
    cp.spawn.mockReturnValue(mockChild)

    await expect(execAsync('echo', ['hello'], {})).rejects.toThrow('Test error')
    expect(cp.spawn).toHaveBeenCalledWith('echo', ['hello'], {})
  })

  it('Windows 系统测试', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
    })

    const mockChild = {
      on: jest.fn((event, callback) => {
        if (event === 'exit') {
          callback(0)
        }
      }),
    }
    cp.spawn.mockReturnValue(mockChild)

    const exitCode = await execAsync('echo', ['hello'], {})
    expect(exitCode).toBe(0)
    expect(cp.spawn).toHaveBeenCalledWith('cmd', ['/c', 'echo', 'hello'], {})
  })

  it('命令为空，抛出错误', async () => {
    await expect(execAsync('', [], {})).rejects.toThrow(
      'exec 函数的第一个参数不能为空'
    )
  })
})
