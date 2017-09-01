const transitions = require('./state_transitions')
const expressInterceptors = require('./interceptors/express')
const hapiInterceptors = require('./interceptors/hapi')

module.exports = {
  addTransition: transitions.addTransition,
  getTransitionList: transitions.getTransitionList,
  halInterceptor: expressInterceptors.halInterceptor,
  halDefaultInterceptor: expressInterceptors.halDefaultInterceptor,
  sirenInterceptor: expressInterceptors.sirenInterceptor,
  sirenDefaultInterceptor: expressInterceptors.sirenDefaultInterceptor,
  hapiRegister: hapiInterceptors.register
}
