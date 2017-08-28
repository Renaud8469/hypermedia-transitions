const transitions = require('../state_transitions/transitions')

function addLinks (halResponse, state, host, isAuth) {
  let newResponse = halResponse
  let possibleTransitions = transitions.getAvailableTransitions(state, isAuth)
  newResponse._links = {}
  for (let transition of possibleTransitions) {
    newResponse._links[transition.rel] = {
      href: host + transition.href
    }
    if (transition.isUrlTemplate) {
      if (transitions.getTemplateParams(transition, state)) {
        if (transitions.isForEachItem(transition, state)) {
          //
          // Assuming the name can be found before "list"
          let resourceName = /^\w+/.exec(state)[0]
          for (let item of halResponse._embedded[resourceName]) {
            item._links = {}
            item._links[transition.rel] = {}
            item._links[transition.rel].href = host + transitions.fillTemplateWithParams(transition.href, transition, state, item)
          }
        } else {
          newResponse._links[transition.rel].href = host + transitions.fillTemplateWithParams(transition.href, transition, state, halResponse)
        }
      } else {
        newResponse._links[transition.rel].templated = true
      }
    }
  }

  return newResponse
}

function translate (data, state, host, isAuth) {
  let halResponse = {}
  if (data instanceof Array) {
    halResponse._embedded = {}
    let resourceName = /^\w+/.exec(state)[0]
    halResponse._embedded[resourceName] = data
  } else {
    halResponse = data
  }
  halResponse = addLinks(halResponse, state, host, isAuth)
  return halResponse
}

module.exports = {
  translate,
  addLinks
}
