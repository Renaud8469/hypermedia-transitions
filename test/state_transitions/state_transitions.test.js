const fs = require('fs')
const chai = require('chai')
const expect = chai.expect
const transitions = require('../../state_transitions/transitions')

describe('Add wrongly constructed transition', () => {
  describe('Add empty transition', () => {
    it('Should throw an error', () => {
      expect(() => transitions.addTransition({})).to.throw(/Missing attributes : rel, target, accessibleFrom, href, method/)
    })
  })

  describe('Add transition with rel', () => {
    it('Should throw a precise error', () => {
      expect(() => transitions.addTransition({
        rel: "Relation"
      })).to.throw(/Missing attributes : target, accessibleFrom, href, method/)
    })
  })
})

describe('Add correctly labeled transition', () => {
  // When I create a transition
  let transition_test = {
    rel: "Relation", 
    target: "Resource",
    accessibleFrom: [{ state: "somewhere" }],
    href: "/resources",
    method: "get"
  }
  before(() => {
    transitions.addTransition(transition_test)
  })

  it('Should fill the list_transitions variable', () => {
    expect(transitions.getTransitionList()).to.include(transition_test)
  })

  after(() => {
    transitions.clearTransitionList()
  })
})

describe('Retrieve available transitions', () => {
  // Adding three transitions
  let transition_test = {
    rel: "resource-list", 
    target: "resource list",
    accessibleFrom: [{ state: "home" }],
    href: "/resources",
    method: "get"
  }
  let transition_test2 = {
    rel: "resource", 
    target: "resource",
    accessibleFrom: [{ state: "resource list" }],
    href: "/resources/{id}",
    isUrlTemplate: true,
    method: "get"
  }
  let transition_test3 = {
    rel: "resource-delete", 
    target: "resource",
    accessibleFrom: [{ state: "resource list" }],
    href: "/resources/{id}",
    isUrlTemplate: true,
    method: "delete",
    authRequired: true
  }

  before(() => {
    transitions.addTransition(transition_test)
    transitions.addTransition(transition_test2)
    transitions.addTransition(transition_test3)
  })

  describe('Check accessible transitions from home', () => {
    it('Should return only the transition accessible from home', () => {
      expect(transitions.getAvailableTransitions("home")).to.include(transition_test)
      expect(transitions.getAvailableTransitions("home").length).to.equals(1)
    })
  })

  describe('Check accessible transitions from resource list without authent', () => {
    it('Should return only the transition accessible without authentication', () => {
      expect(transitions.getAvailableTransitions("resource list")).to.include(transition_test2)
      expect(transitions.getAvailableTransitions("resource list").length).to.equals(1)
    })
  })

  describe('Check accessible transitions from resource list with authent', () => {
    it('Should return only the transitions accessible with authentication', () => {
      expect(transitions.getAvailableTransitions("resource list", true)).to.include(transition_test2)
      expect(transitions.getAvailableTransitions("resource list", true)).to.include(transition_test3)
      expect(transitions.getAvailableTransitions("resource list", true).length).to.equals(2)
    })
  })

  after(() => {
    transitions.clearTransitionList()
  })
})


