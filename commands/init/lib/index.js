'use strict'

module.exports = init

function init(...args) {
  const projectName = args[0]
  const options = args[1]
  const command = args.at(-1)
  console.log(projectName, options, command)
}
