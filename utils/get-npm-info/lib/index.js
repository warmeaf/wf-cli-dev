'use strict'
const axios = require('axios')
const semver = require('semver')

function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return null
  }

  const registryUrl = registry || getDefaultRegistry()
  const npmInfoUrl = `${registryUrl}/${npmName}`
  return axios
    .get(npmInfoUrl)
    .then((res) => {
      if (res.status === 200) {
        return res.data
      } else {
        return null
      }
    })
    .catch((err) => {
      return Promise.reject(err)
    })
}

function getDefaultRegistry(isOrignal = true) {
  return isOrignal
    ? 'https://registry.npmjs.org'
    : 'https://registry.npm.taobao.org'
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry)
  if (data?.versions) {
    const versionsArray = Object.keys(data.versions)
    return versionsArray
  } else {
    return []
  }
}

async function getSemverVersions(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry)
  const newVersions = []
  for (const version of versions) {
    if (semver.satisfies(version, `^${baseVersion}`)) {
      newVersions.push(version)
    }
  }
  // 版本由高到底排序
  newVersions.sort((a, b) => {
    return semver.compare(b, a)
  })

  if (newVersions.length > 0) {
    return newVersions[0]
  }
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getSemverVersions,
}
