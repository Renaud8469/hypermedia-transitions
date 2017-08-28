const transitions = require('../state_transitions/transitions')

function fillTemplateWithParams (template, params, data) {
  return template.replace(/\{[\w]+\}/g, function (str) {
    let param = params[str.slice(1, str.length - 1)]
    return param.split('.').reduce((o, i) => o[i], data)
  })
}

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
        newResponse._links[transition.rel].href = host + fillTemplateWithParams(transition.href, transitions.getTemplateParams(transition, state), halResponse)
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
