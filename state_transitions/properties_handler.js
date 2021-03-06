const _ = require('lodash')

function isOriginState (currentState) {
  return function (origin) {
    return (origin.state === currentState)
  }
}

function getTemplateParams (transition, state) {
  const originState = _.find(transition.accessibleFrom, isOriginState(state))
  if (originState.fillTemplateWith) {
    return originState.fillTemplateWith
  } else {
    return false
  }
}

function fillTemplateWithParams (transition, state, data) {
  let params = getTemplateParams(transition, state)
  return transition.href.replace(/\{[\w]+\}/g, function (str) {
    let param = params[str.slice(1, str.length - 1)]
    return param.split('.').reduce((o, i) => o[i], data)
  })
}

function isForEachItem (transition, state) {
  const originState = _.find(transition.accessibleFrom, isOriginState(state))
  if (originState.eachItem) return true
  else return false
}

function isSelfRel (transition, state) {
  const originState = _.find(transition.accessibleFrom, isOriginState(state))
  if (originState.withSelfRel) return true
  else return false
}

/*
 * Get link to display from transition (handles template case)
 */
function getUrl (transition, state, data) {
  if (transition.isUrlTemplate) {
    if (getTemplateParams(transition, state)) {
      return { href: fillTemplateWithParams(transition, state, data) }
    } else {
      return { href: transition.href, isUrlTemplate: true }
    }
  } else {
    return { href: transition.href }
  }
}

module.exports = {
  getTemplateParams,
  fillTemplateWithParams,
  isForEachItem,
  isSelfRel,
  getUrl
}
