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

  // If no error, register it to the JSON file
  list_transitions.push(transition)
}

function getTransitionList () { return list_transitions }

module.exports = {
  addTransition,
  getTransitionList
}
