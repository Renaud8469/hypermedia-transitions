const transitions = require('../state_transitions')

/*
 * Generates a Siren "entity". Useful for both resources,
 * sub-resources and collection members.
 */
function generateSirenEntity (resource, name, host, subEntityRel) {
  let entity = {
    class: [name]
  }
  if (subEntityRel) {
    entity.rel = [subEntityRel]
  }
  
  entity.properties = resource

  return entity
}

/*
 * Generates the response
 */
function translate (data, state, host, isAuth) {
  let resourceName = /^[a-zA-Z0-9]+/.exec(state)[0]
  let sirenResponse = {}

  if (data instanceof Array) {
    sirenResponse.entities = []
    for (let elem of data) {
      sirenResponse.entities.push(generateSirenEntity(elem, resourceName, host, resourceName))
    }
  } else {
    sirenResponse = generateSirenEntity(data, resourceName, host)
  }

  return sirenResponse
}

module.exports = {
  translate
}
