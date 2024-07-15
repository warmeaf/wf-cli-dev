'use strict'

const got = require('got')
const log = require('@wf-cli-dev/log')

// 设置全局的请求超时
const TIMEOUT = 5000
const PRE_FIX_URL = process.env.WF_CLI_PRE_FIX_URL
  ? process.env.WF_CLI_PRE_FIX_URL
  : 'http://127.0.0.1:7001'

const httpClient = got.extend({
  prefixUrl: PRE_FIX_URL,
  timeout: TIMEOUT,
  hooks: {
    beforeRetry: [
      (response, retryCount) => {
        if (retryCount > 3) {
          throw new Error('Max retries exceeded')
        }
        return true
      },
    ],
    afterResponse: [
      (response) => {
        if (response.statusCode === 200) {
          return response
        } else {
          throw new Error(`[${response.statusCode}] ${response.body.message}`)
        }
      },
    ],
  },
  responseType: 'json', // 默认返回 JSON 格式的数据
  retry: {
    limit: 3,
    methods: ['GET'],
  },
  throwHttpErrors: false, // 不要立即抛出 HTTP 错误，以便我们可以统一处理
})

// 错误处理函数
function handleError(error) {
  if (error.response) {
    // 如果有响应，则可能是 HTTP 错误码
    log.error('请求错误，错误码为：', error.response.statusCode)
  } else if (error.request) {
    // 如果没有响应，则可能是网络问题
    log.error('请检查网络连接')
  } else {
    // 其他错误
    log.error('接口异常', error.message)
  }
}

async function get(path, query) {
  try {
    const response = await httpClient.get(path, { searchParams: query })
    // console.log('response', response)
    return response.body
  } catch (error) {
    handleError(error)
  }
}

// 发送 POST 请求
async function post(path, body) {
  try {
    const response = await httpClient.post(path, { json: body })
    return response.body
  } catch (error) {
    handleError(error)
  }
}

module.exports = {
  get,
  post,
}
