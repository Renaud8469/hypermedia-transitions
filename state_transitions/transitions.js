const _ = require('lodash')

let list_transitions = []

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
  list_transitions.push(transition)
}

function getTransitionList () { return list_transitions }

function isActionable (state, isAuth) {
  return function (transition) {
    if (!isAuth && transition.authRequired) return false
    else { 
      for (let origin of transition.accessibleFrom) {
        if (origin === state) {
          return true
        }
      }
      return false
    }
  }
}

function getAvailableTransitions (state, isAuth) {
    return _.filter(list_transitions, isActionable(state, isAuth))
}

// Use with caution ! Should only be used for tests.
function clearTransitionList () {
  list_transitions = []
}

module.exports = {
  addTransition,
  getTransitionList,
  getAvailableTransitions,
  clearTransitionList
}
