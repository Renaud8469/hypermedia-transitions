const transitions = require('./transitions')
const templateHandler = require('./template_handler')

module.exports = {
  addTransition: transitions.addTransition,
  getTransitionList: transitions.getTransitionList,
  getAvailableTransitions: transitions.getAvailableTransitions,
  clearTransitionList: transitions.clearTransitionList,
  getTemplateParams: templateHandler.getTemplateParams,
  fillTemplateWithParams: templateHandler.fillTemplateWithParams,
  isForEachItem: templateHandler.isForEachItem
}
