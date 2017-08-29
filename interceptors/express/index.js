const interceptor = require('express-interceptor')
const translators  = require('../../translators')
const transitions = require('../../state_transitions')

function isHalInterceptable (req) {
  return function () {
    return /application\/vnd\.hal\+json/.test(req.get('Accept'))
  }
}

function halIntercept (req, res) {
  return function (body, send) {
    res.set('Content-type', 'application/vnd.hal+json')
  
    let data
    try {
      data = JSON.parse(body)
    } catch (error) {
      send(body)
      return
    }
    let state = transitions.getState(req.originalUrl, req.method)
    let halResponse = translators.translateToHal(data, state, req.hostname, req.isAuth) // It uses a custom req.isAuth property

    send(JSON.stringify(halResponse))
  }
}

function setupInterceptor (req, res) {
  return {
    isInterceptable : isHalInterceptable(req),
    intercept: halIntercept (req, res)
  }
}

const halInterceptor = interceptor(setupInterceptor)

module.exports = {
  isHalInterceptable,
  halIntercept,
  setupInterceptor,
  halInterceptor
}
