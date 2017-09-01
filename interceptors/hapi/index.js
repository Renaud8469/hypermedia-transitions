const translators = require('../../translators')
const transitions = require('../../state_transitions')

const formatFunctions = {
  hal: {
    header: /application\/vnd\.hal\+json/,
    translate: translators.translateToHal
  },
  siren: {
    header: /application\/vnd\.siren\+json/,
    translate: translators.translateToSiren
  }
}

function modify (format) {
  return function (request, reply) {
    if (formatFunctions[format].header.test(request.headers['accept'])) {
      try {
        let body = request.response.source
        let state = transitions.getState(request.url.path, request.method)
        let host = request.connection.info.protocol + '://' + request.info.host
        let isAuth = request.isAuthenticated
        let newResponse = formatFunctions[format].translate(body, state, host, isAuth)
        reply(newResponse)
      } catch (e) {
        console.log(e)
        reply.continue()
      }
    } else {
      reply.continue()
    }
  }
}

/*
 * Register this as Hapi plugin. 
 * Options should be : 
 * { mediaTypes: ['hal', 'siren'], transitions: [...] }
 */
function register (server, options, next) {
  if (!options || !options.mediaTypes) {
    next()
  } else {
    if (options.transitions) {
      for (let tr of options.transitions) {
        transitions.addTransition(tr)
      }
    }
    for (let format of options.mediaTypes) {
      server.ext('onPreResponse', modify(format))
    }
    next()
  }
}

register.attributes = {
  pkg: require('../../package.json')
}

module.exports = {
  modify,
  register
}
