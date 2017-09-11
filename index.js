const transitions = require('./state_transitions')
const expressInterceptors = require('./interceptors/express')
const hapiInterceptors = require('./interceptors/hapi')

module.exports = {
  addTransition: transitions.addTransition,
  addTransitionList: transitions.addTransitionList,
  getTransitionList: transitions.getTransitionList,
  halInterceptor: expressInterceptors.halInterceptor,
  sirenInterceptor: expressInterceptors.sirenInterceptor,
  hapiRegister: hapiInterceptors.register
}
