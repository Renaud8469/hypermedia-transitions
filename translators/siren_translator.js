const transitions = require('../state_transitions')
const _ = require('lodash')

/*
 * Generates a Siren "entity". Useful for both resources,
 * sub-resources and collection members.
 */
function generateSirenEntity (resource, name, host, state, isAuth, subEntityRel) {
  let entity = {}
  if (name !== 'undefined') entity.class = [name]
  if (subEntityRel) {
    entity.rel = [subEntityRel]
  }

  if (!_.isEmpty(resource)) entity.properties = resource

  let possibleTransitions = transitions.getAvailableTransitions(state, isAuth)
  let controls = getActionsAndLinks(possibleTransitions, resource, state, host, subEntityRel, isAuth)
  if (controls.actions && controls.actions.length > 0) entity.actions = controls.actions
  if (controls.links && controls.links.length > 0) entity.links = controls.links

  return entity
}

/*
 * Transforms a template into Siren fields
 */
function transformTemplate (template) {
  let fields = []
  for (let prop in template) {
    if (template[prop] instanceof Object) {
      fields.push({
        name: prop,
        type: transformTemplate(template[prop])
      })
    } else {
      fields.push({
        name: prop,
        type: template[prop]
      })
    }
  }
  return fields
}

/*
 * Returns actions to add to a siren Response
 */
function getActionsAndLinks (possibleTr, data, state, host, isSubEntity, isAuth) {
  let actions = []
  let links = []
  for (let tr of possibleTr) {
    if ((transitions.isForEachItem(tr, state) && isSubEntity) || (!transitions.isForEachItem(tr, state) && !isSubEntity)) {
      let action = {}
      action.href = host + transitions.getUrl(tr, state, data).href

      if (transitions.isSelfRel(tr, state)) {
        action.rel = 'self'
        links.push(action)
      } else {
        action.name = tr.rel
        action.method = tr.method
        if (tr.template) action.fields = transformTemplate(tr.template)
        actions.push(action)
      }
    }
  }
  return { actions, links }
}

/*
 * Generates the response
 */
function translate (data, state, host, isAuth) {
  let resourceName = /^[a-zA-Z0-9]+/.exec(state)[0]
  let sirenResponse = {}

  if (data instanceof Array) {
    sirenResponse = generateSirenEntity({}, resourceName, host, state, isAuth)
    sirenResponse.entities = []
    for (let elem of data) {
      sirenResponse.entities.push(generateSirenEntity(elem, resourceName, host, state, isAuth, resourceName))
    }
  } else {
    sirenResponse = generateSirenEntity(data, resourceName, host, state, isAuth)
  }

  return sirenResponse
}

module.exports = {
  translate
}
