const state = require('../../state_transitions/state')
const transitions = require('../../state_transitions/transitions')
const chai = require('chai')
const expect = chai.expect

describe('Matching url with transition template', () => {
  let reqUrl = '/users/2/orders/47?someParam=something'
  let slashUrl = '/users/2/orders/47/?someParam=something' 
  let easyWrongUrl = '/otherstuff'
  let hardWrongUrl = '/users/2/orders?parameters'
  let transitionUrl = '/users/{userId}/orders/{orderId}'

  it('Should match', () => {
    expect(state.urlMatch(reqUrl, transitionUrl)).to.be.true
  })

  it('Should match even with the ending /', () => {
    expect(state.urlMatch(slashUrl, transitionUrl)).to.be.true
  })

  it('Should not match', () => {
    expect(state.urlMatch(easyWrongUrl, transitionUrl)).to.be.false
  })

  it('Should not match either', () => {
    expect(state.urlMatch(hardWrongUrl, transitionUrl)).to.be.false
  })
})    

describe('Get state from incoming request', () => {
  
  let transition1 = {
    rel: "Relation", 
    target: "resource list",
    accessibleFrom: [{ state: "somewhere" }],
    href: "/resources",
    method: "get"
  }
  let transition2 = {
    rel: "Relation", 
    target: "resource",
    accessibleFrom: [{ state: "somewhere" }],
    href: "/resources/{id}",
    method: "get"
  }
  let transition3 = {
    rel: "Relation", 
    target: "resource modified",
    accessibleFrom: [{ state: "somewhere" }],
    href: "/resources/{id}",
    method: "put"
  }
  before(() => {
    transitions.addTransition(transition1)
    transitions.addTransition(transition2)
    transitions.addTransition(transition3)
  })

  it('Should be the target from transition 2', () => {
    expect(state.getState('/resources/2', 'GET')).to.equal(transition2.target)
  })

  it('Should be the target from transition 3', () => {
    expect(state.getState('/resources/43', 'PUT')).to.equal(transition3.target)
  })

  after(() => {
    transitions.clearTransitionList()
  })
})
