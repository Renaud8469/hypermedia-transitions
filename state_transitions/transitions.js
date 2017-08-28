const _ = require('lodash')

let transitionList = []

function addTransition (transition) {
  // Wrong arguments handling
  let missingArguments = []
  for (let prop of ['rel', 'target', 'accessibleFrom', 'href', 'method']) {
    if (!transition[prop]) { missingArguments.push(prop) }
  }
  if (missingArguments.length > 0) {
    let message = 'Missing attributes : '
    for (let prop of missingArguments) {
      message += prop + ', '
    }
    throw new Error(message.slice(0, -2))
  }

  // If no error, register it
  transitionList.push(transition)
}

function getTransitionList () { return transitionList }

function isActionable (state, isAuth) {
  return function (transition) {
    if (!isAuth && transition.authRequired) return false
    else {
      for (let origin of transition.accessibleFrom) {
        if (origin.state === state) {
          return true
        }
      }
      return false
    }
  }
}

function getAvailableTransitions (state, isAuth) {
  return _.filter(transitionList, isActionable(state, isAuth))
}

// Use with caution ! Should only be used for tests.
function clearTransitionList () {
  transitionList = []
}

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

module.exports = {
  addTransition,
  getTransitionList,
  getAvailableTransitions,
  clearTransitionList,
  getTemplateParams
}
