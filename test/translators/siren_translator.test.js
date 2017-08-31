const transitions = require('../../state_transitions')
const siren_translator = require('../../translators/siren_translator')
const chai = require('chai')
const expect = chai.expect

describe('Translate data into siren', () => {
  describe('Translate single object', () => {
    it('Should contain the original data', () => {
      let data = {
        first_key: "first value",
        second_key: "second value"
      }
      expect(siren_translator.translate(data, 'resource', "http://www.example.org").properties).to.include(data)
    })
  })

  describe('Translate array', () => {
    it("Should be contained in the entities property", () => {
      let data = [
      {
        first_elem_first_key: "value1",
        first_elem_last_key: "value2"
      },
      {
        last_elem_first_key: "value3",
        last_elem_last_key: "value4"
      }]
      let expected = [
      {
        class: ['resource'],
        rel: ['resource'],
        properties: {
          first_elem_first_key: "value1",
          first_elem_last_key: "value2"
        }
      },
      {
        class: ['resource'],
        rel: ['resource'],
        properties: {
          last_elem_first_key: "value3",
          last_elem_last_key: "value4"
        }
      }]
      const response = siren_translator.translate(data, 'resource-list', "http://www.example.org")
      expect(response.entities).to.have.deep.members(expected)
    })
  })
})

// Below are test duplicated from HAL translator for simplicity. Will be uncovered one at a time.
/*
describe('Add links to siren Response', () => {
    
  // Add transition to list before test
  let transition_test = {
    rel: "resource_list", 
    target: "resource list",
    accessibleFrom: [{ state: "home" }],
    href: "/resources",
    method: "get"
  }

  before(() => {
    transitions.addTransition(transition_test)
  })

  it('Should contain the available transition', () => {
    expect(siren_translator.addLinks({}, "home", "http://www.example.org")).to.deep.include({
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

describe('Complete templates in siren response', () => {

  describe('No template', () => {
    // Add transition to list before test
    let transition_test = {
      rel: "resource", 
      target: "resource",
      accessibleFrom: [{ state: "home"}],
      href: "/resources/{id}",
      isUrlTemplate: true,
      method: "get"
    }

    before(() => {
      transitions.addTransition(transition_test)
    })

    it('Should contain a link with template', () => {
      const response = siren_translator.addLinks({}, "home", "http://www.example.org")
      expect(response).to.deep.include({
        _links: {
          resource: {
            href: "http://www.example.org/resources/{id}",
            templated: true
          }
        }
      })
    })

    after(() => {
      transitions.clearTransitionList()
    })
  })

  describe('Simple template', () => {
    // Add transition to list before test
    let transition_test = {
      rel: "resource", 
      target: "resource",
      accessibleFrom: [{ state: "home", fillTemplateWith: {id: "res_id"}}],
      href: "/resources/{id}",
      isUrlTemplate: true,
      method: "get"
    }

    let data = {
      res_id: 2,
      other_stuff: "something"
    }

    before(() => {
      transitions.addTransition(transition_test)
    })

    it('Should contain a link without template but with the ID instead', () => {
      const response = siren_translator.addLinks(data, "home", "http://www.example.org")
      expect(response).to.deep.include({
        _links: {
          resource: {
            href: "http://www.example.org/resources/2"
          }
        }
      })
    })

    after(() => {
      transitions.clearTransitionList()
    })
  })

  describe('Complex template', () => {
    // Add transition to list before test
    let transition_test = {
      rel: "other_resource", 
      target: "other_resource",
      accessibleFrom: [{ state: "home", fillTemplateWith: {
        id: "res_id",
        second_id: "embedded_stuff.more_embedded_stuff.id"
      }}],
      href: "/resources/{id}/complexity/{second_id}",
      isUrlTemplate: true,
      method: "get"
    }

    let data = {
      res_id: 2,
      other_stuff: "something",
      embedded_stuff: {
        more_embedded_stuff: {
          id: 42
        }
      }
    }

    before(() => {
      transitions.addTransition(transition_test)
    })

    it('Should contain a link without template but with the two IDs instead', () => {
      const response = siren_translator.addLinks(data, "home", "http://www.example.org")
      expect(response).to.deep.include({
        _links: {
          other_resource: {
            href: "http://www.example.org/resources/2/complexity/42"
          }
        }
      })
    })

    after(() => {
      transitions.clearTransitionList()
    })
  })

})

describe('Add links to embedded resources', () => {

  let data = [
  {
    id: 1,
    first_elem_first_key: "value1",
    first_elem_last_key: "value2"
  },
  {
    id: 2,
    last_elem_first_key: "value3",
    last_elem_last_key: "value4"
  }]

  let expected = [
  {
    id: 1,
    first_elem_first_key: "value1",
    first_elem_last_key: "value2",
    _links: {
      resource: {
        href: "http://www.example.org/resources/1"
      }
    }
  },
  {
    id: 2,
    last_elem_first_key: "value3",
    last_elem_last_key: "value4",
    _links: {
      resource: {
        href: "http://www.example.org/resources/2"
      }
    }
  }]

  // Add transition to list before test
  let transition_test = {
    rel: "resource", 
    target: "resource",
    accessibleFrom: [{ state: "home"}, { state: "resource_list", fillTemplateWith: { id: "id"}, eachItem: true}],
    href: "/resources/{id}",
    isUrlTemplate: true,
    method: "get"
  }

  let response

  before(() => {
    transitions.addTransition(transition_test)
    response = siren_translator.translate(data, 'resource_list', 'http://www.example.org')
  })

  it('Should contain resources with their own links', () => {
    expect(response._embedded.resource).to.be.an('array').that.deep.include.members(expected)
  })

  after(() => {
    transitions.clearTransitionList()
  })
})



describe('Add self relation', () => {
  describe('To own resource', () => {
    // Add transition to list before test
    let transition_test = {
      rel: "resource", 
      target: "resource",
      accessibleFrom: [{ state: "home", fillTemplateWith: {id: "res_id"}, withSelfRel: true}],
      href: "/resources/{id}",
      isUrlTemplate: true,
      method: "get"
    }

    let data = {
      res_id: 2,
      other_stuff: "something"
    }

    before(() => {
      transitions.addTransition(transition_test)
    })

    it('Should contain a link without template but with the ID instead', () => {
      const response = siren_translator.addLinks(data, "home", "http://www.example.org")
      expect(response).to.deep.include({
        _links: {
          self: {
            href: "http://www.example.org/resources/2"
          }
        }
      })
    })

    after(() => {
      transitions.clearTransitionList()
    })
  })

  describe('To embedded resources', () => {
    let data = [
    {
      id: 1,
      first_elem_first_key: "value1",
      first_elem_last_key: "value2"
    },
    {
      id: 2,
      last_elem_first_key: "value3",
      last_elem_last_key: "value4"
    }]

    let expected = [
    {
      id: 1,
      first_elem_first_key: "value1",
      first_elem_last_key: "value2",
      _links: {
        self: {
          href: "http://www.example.org/resources/1"
        }
      }
    },
    {
      id: 2,
      last_elem_first_key: "value3",
      last_elem_last_key: "value4",
      _links: {
        self: {
          href: "http://www.example.org/resources/2"
        }
      }
    }]

    // Add transition to list before test
    let transition_test = {
      rel: "resource", 
      target: "resource",
      accessibleFrom: [{ state: "home"}, { state: "resource list", fillTemplateWith: { id: "id"}, eachItem: true, withSelfRel: true}],
      href: "/resources/{id}",
      isUrlTemplate: true,
      method: "get"
    }
    let response

    before(() => {
      transitions.addTransition(transition_test)
      response = siren_translator.translate(data, 'resource list', 'http://www.example.org')
    })

    it('Should contain resources with their own links', () => {
      expect(response._embedded.resource).to.be.an('array').that.deep.include.members(expected)
    })

    it('Should have a link without "self" at root object', () => {
      expect(response._links).to.not.have.property('self')
    })

    after(() => {
      transitions.clearTransitionList()
    })
  })
})
*/
