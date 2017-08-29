const transitions = require('../state_transitions')

/*
 * Add "_links" property to HAL response (and embedded resources) using the predefined state transitions
 */
function addLinks (halResponse, state, host, isAuth) {
  let newResponse = halResponse
  let possibleTransitions = transitions.getAvailableTransitions(state, isAuth)
  newResponse._links = {}
  for (let transition of possibleTransitions) {
    //
    // Define the link rel
    let relation = transition.rel
    if (transitions.isSelfRel(transition, state)) {
      relation = 'self'
    }
    newResponse._links[relation] = {
      href: host + transition.href
    }
    //
    // Handle URL template case
    if (transition.isUrlTemplate) {
      // If some parameters are available to fill the template, we fill it (a filled link is easier to follow than a templated one)
      if (transitions.getTemplateParams(transition, state)) {
        if (transitions.isForEachItem(transition, state)) {
          let resourceName = /^\w+/.exec(state)[0] // Assuming the resource name is the first word from the state
          for (let item of halResponse._embedded[resourceName]) {
            item._links = {}
            item._links[relation] = {}
            item._links[relation].href = host + transitions.fillTemplateWithParams(transition, state, item)
          }
        } else {
          newResponse._links[relation].href = host + transitions.fillTemplateWithParams(transition, state, halResponse)
        }
      } else {
        newResponse._links[relation].templated = true
      }
    }
  }

  return newResponse
}

/*
 * Create HAL response from response data and other parameters.
 * The data can arrive in Array form so the first step is to convert this array into HAL's "_embedded" property
 * Next we add the links. 
 */
function translate (data, state, host, isAuth) {
  let halResponse = {}
  if (data instanceof Array) {
    halResponse._embedded = {}
    let resourceName
    if (state) {
      resourceName = /^\w+/.exec(state)[0]
    } else {
      resourceName = 'list'
    }
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
