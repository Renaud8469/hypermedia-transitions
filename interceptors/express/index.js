const interceptor = require('express-interceptor')
const translators = require('../../translators')
const transitions = require('../../state_transitions')

function isHalInterceptable (req) {
  return function () {
    return /application\/vnd\.hal\+json/.test(req.get('Accept'))
  }
}

function isSirenInterceptable (req) {
  return function () {
    return /application\/vnd\.siren\+json/.test(req.get('Accept'))
  }
}

/*
 * General interception function 
 */
function generalInterception (mediaType, translateFunc) {
  return function (req, res) {
    return function (body, send) {
      res.set('Content-type', mediaType)

      let data
      try {
        data = JSON.parse(body)
      } catch (error) {
        send(body)
        return
      }
      let state = transitions.getState(req.originalUrl, req.method)
      let host = req.hostname ? req.hostname : req.get('host')
      let halResponse = translateFunc(data, state, req.protocol + '://' + host, req.isAuth) // It uses a custom req.isAuth property

      send(JSON.stringify(halResponse))
    }
  }
}

const halIntercept = generalInterception('application/vnd.hal+json', translators.translateToHal)
const sirenIntercept = generalInterception('application/vnd.siren+json', translators.translateToSiren)

function setupHalInterceptor (req, res) {
  return {
    isInterceptable: isHalInterceptable(req),
    intercept: halIntercept(req, res)
  }
}

function setupSirenInterceptor (req, res) {
  return {
    isInterceptable: isSirenInterceptable(req),
    intercept: sirenIntercept(req, res)
  }
}

const halInterceptor = interceptor(setupHalInterceptor)
const sirenInterceptor = interceptor(setupSirenInterceptor)

module.exports = {
  isHalInterceptable,
  halIntercept,
  setupHalInterceptor,
  isSirenInterceptable,
  sirenIntercept,
  setupSirenInterceptor,
  halInterceptor,
  sirenInterceptor,
}
