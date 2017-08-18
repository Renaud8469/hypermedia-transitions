const transitions = require('../../state_transitions/transitions')
const hal_translator = require('../../translators/hal_translator')
const chai = require('chai')
const expect = chai.expect

describe('Translate data into HAL', () => {
  describe('Translate single object', () => {
    it('Should contain the original data', () => {
      let data = {
        first_key: "first value",
        second_key: "second value"
      }
      expect(hal_translator.translate(data, 'resource')).to.include(data)
    })
  })

  describe('Translate array', () => {
    it("Should be contained in the embedded property", () => {
      let data = [
      {
        first_elem_first_key: "value1",
        first_elem_last_key: "value2"
      },
      {
        last_elem_first_key: "value3",
        last_elem_last_key: "value4"
      }]
      const response = hal_translator.translate(data, 'resource-list')
      expect(response._embedded.resource).to.be.an('array').that.deep.include.members(data)
    })
  })
})

describe('Add links to HAL Response', () => {
    
  // Add transition to list before test
  let transition_test = {
    rel: "resource_list", 
    target: "resource list",
    accessibleFrom: ["home"],
    href: "/resources",
    method: "get"
  }

  before(() => {
    transitions.addTransition(transition_test)
  })

  it('Should contain the available transition', () => {
    expect(hal_translator.addLinks({}, "home", "http://www.example.org")).to.deep.include({
      _links: {
        resource_list: {
          href: "http://www.example.org/resources"
        }
      }
    })
  })

  after(() => {
    transitions.clearTransitionList()
  })
})

