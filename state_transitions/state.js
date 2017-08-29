const transitions = require('./transitions')
const _ = require('lodash')
const url = require('url')

function urlMatch (reqUrl, transitionUrl) {
  // The transitionUrl might be a template 
  // The reqUrl might have additionnal parameters
  let path = url.parse(reqUrl).pathname
  let convertedTransitionUrl = transitionUrl.replace(/\{\w+\}/g, '(\\w+)')
  let regex = new RegExp('^' + convertedTransitionUrl + '$')
  return regex.test(path)
}

function isTriggeredTransition (reqUrl, reqMethod) {
  return function (transition) {
    if (transition.method.toUpperCase() !== reqMethod.toUpperCase()) return false
    else return urlMatch(reqUrl, transition.href)
  }
}

function getState (reqUrl, reqMethod) {
  const triggeredTransition = _.find(transitions.getTransitionList(), isTriggeredTransition(reqUrl, reqMethod))
  return triggeredTransition ? triggeredTransition.target : undefined
}

module.exports = {
  urlMatch,
  getState
}
