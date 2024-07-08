'use strict'

const Command = require('@wf-cli-dev/command')

class InitCommand extends Command {
  constructor(args) {
    super(args)
    this.init()
    this.exec()
  }

  init() {}

  exec() {}
}

function init(...args) {
  new InitCommand(args)
}

module.exports = init
