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
    expect(siren_translator.translate({}, "home", "http://www.example.org").actions).to.be.an('array').that.deep.include({
      name: "resource_list",
      method: "get",
      href: "http://www.example.org/resources"
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
      const response = siren_translator.translate({}, "home", "http://www.example.org")
      expect(response.actions).to.be.an('array').that.deep.include({
        name: "resource",
        href: "http://www.example.org/resources/{id}",
        method: "get"
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
      const response = siren_translator.translate(data, "home", "http://www.example.org")
      expect(response.actions).to.be.an('array').that.deep.include({
        name: "resource",
        href: "http://www.example.org/resources/2",
        method: "get"
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
      const response = siren_translator.translate(data, "home", "http://www.example.org")
      expect(response.actions).to.be.an('array').that.deep.include({
        name: "other_resource",
        href: "http://www.example.org/resources/2/complexity/42",
        method: "get"
      })
    })

    after(() => {
      transitions.clearTransitionList()
    })
  })

})

describe('When a transition has a template', () => {
  // Add transition to list before test
  let transition_test = {
    rel: "resource", 
    target: "resource",
    accessibleFrom: [{ state: "home"}],
    href: "/resources",
    isUrlTemplate: true,
    method: "post",
    template: {
      name: "string",
      content: {
        title: "string",
        text: "string"
      }
    }
  }

  before(() => {
    transitions.addTransition(transition_test)
  })

  it('Should contain a link with template', () => {
    const response = siren_translator.translate({}, "home", "http://www.example.org")
    expect(response.actions).to.be.an('array').that.deep.include({
      name: "resource",
      href: "http://www.example.org/resources",
      method: "post",
      fields: [
      {
        name: "name",
        type: "string"
      },{
        name: "content",
        type: [
        {
          name: "title",
          type: "string"
        },{
          name: "text",
          type: "string"
        }]
      }]
    })
  })

  after(() => {
    transitions.clearTransitionList()
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
    class: ['resource'],
    rel: ['resource'],
    properties: {
      id: 1,
      first_elem_first_key: "value1",
      first_elem_last_key: "value2"
    },
    actions: [{
      name: "resource",
      method: "get",
      href: "http://www.example.org/resources/1"
    }]
  },
  {
    class: ['resource'],
    rel: ['resource'],
    properties: {
      id: 2,
      last_elem_first_key: "value3",
      last_elem_last_key: "value4"
    },
    actions: [{
      name: "resource",
      method: "get",
      href: "http://www.example.org/resources/2"
    }]
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
    expect(response.entities).to.be.an('array').that.deep.include.members(expected)
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
      const response = siren_translator.translate(data, "home", "http://www.example.org")
      expect(response.links).to.be.an('array').that.deep.include({
        rel: 'self',
        href: "http://www.example.org/resources/2"
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
      class: ['resource'],
      rel: ['resource'],
      properties: {
        id: 1,
        first_elem_first_key: "value1",
        first_elem_last_key: "value2"
      },
      links: [{
        rel: "self",
        href: "http://www.example.org/resources/1"
      }]
    },
    {
      class: ['resource'],
      rel: ['resource'],
      properties: {
        id: 2,
        last_elem_first_key: "value3",
        last_elem_last_key: "value4"
      },
      links: [{
        rel: "self",
        href: "http://www.example.org/resources/2"
      }]
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
      expect(response.entities).to.be.an('array').that.deep.include.members(expected)
    })

    it('Should have a link without "self" at root object', () => {
      expect(response).to.not.have.property('links')
    })

    after(() => {
      transitions.clearTransitionList()
    })
  })
})
