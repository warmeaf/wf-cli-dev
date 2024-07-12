const { get } = require('@wf-cli-dev/request')

function getProjectTemplate() {
  return get('project/template')
}

module.exports = {
  getProjectTemplate,
}
