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
  it('Should fill the list_transitions variable', () => {
    // When I create a transition
    let transition_test = {
      rel: "Relation", 
      target: "Resource",
      accessibleFrom: ["home"],
      href: "/resources",
      method: "get"
    }
    transitions.addTransition(transition_test)

    expect(transitions.getTransitionList()).to.include(transition_test)

  })
})
