const transitions = require('../state_transitions')

/*
 * Add "_links" property to HAL response (and embedded resources) using the predefined state transitions
 */
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
        // 
        // If some parameters are available to fill the template, we fill it (a filled link is easier to follow than a templated one)
        // 
        if (transitions.isForEachItem(transition, state)) {
          let resourceName = /^\w+/.exec(state)[0] // Assuming the resource name is the first word from the state
          for (let item of halResponse._embedded[resourceName]) {
            item._links = {}
            item._links[transition.rel] = {}
            item._links[transition.rel].href = host + transitions.fillTemplateWithParams(transition, state, item)
          }
        } else {
          newResponse._links[transition.rel].href = host + transitions.fillTemplateWithParams(transition, state, halResponse)
        }
      } else {
        newResponse._links[transition.rel].templated = true
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
