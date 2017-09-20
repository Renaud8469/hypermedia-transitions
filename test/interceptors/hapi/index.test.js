const hapi_plugin = require('../../../interceptors/hapi')
const chai = require('chai')
const expect = chai.expect
const transitions = require('../../../state_transitions')

const pkg =  require('../../../package.json')

describe('Testing Hapi plugin properties', () => {
  it('Should have a register function', () => {
    expect(hapi_plugin.register).to.exist
  })

  it('Should have attributes property', () => {
    expect(hapi_plugin.register.attributes).to.exist
  })

  it('Should be set to package.json', () => {
    expect(hapi_plugin.register.attributes.pkg).to.equals(pkg)
  })
})

describe('Register function', () => {
  let results = {
    startingEvent: '',
    registeredFormats: 0,
    nextCalled: false
  }
  let serverTest = {
    ext: function (specialEvent, someFunc) {
      results.startingEvent = specialEvent
      results.registeredFormats++
    }
  }
  let nextTest = function () { results.nextCalled = true }
  let options1 = {
    mediaTypes: ['hal', 'siren']
  }
  let transition_test = {
    rel: "Relation", 
    target: "Resource",
    accessibleFrom: [{ state: "somewhere" }],
    href: "/resources",
    method: "get"
  }

  let options2 = {
    mediaTypes:  ['hal'],
    transitions: [transition_test]
  }

  beforeEach(() => {
    results.startingEvent = ''
    results.registeredFormats = 0
    nextCalled = false
  })

  describe('No options specified', () => {
    it('Should call next and nothing more', () => {
      hapi_plugin.register(serverTest, {}, nextTest)
      expect(results.registeredFormats).to.equal(0)
      expect(results.nextCalled).to.be.true
    })
  })

  describe('No transitions specified', () => {
    it('Should call server ext', () => {
      hapi_plugin.register(serverTest, options1, nextTest)
      expect(results.registeredFormats).to.equal(2)
      expect(results.nextCalled).to.be.true
      expect(results.startingEvent).to.equal('onPreResponse')
    })
  })

  describe('With transitions', () => {
    it('Should add transitions', () => {
      hapi_plugin.register(serverTest, options2, nextTest)
      expect(results.registeredFormats).to.equal(1)
      expect(results.nextCalled).to.be.true
      expect(results.startingEvent).to.equal('onPreResponse')
      expect(transitions.getTransitionList()).to.include(transition_test)
    })
  })
})

describe('Modify function', () => {
  let results = {
    continueCalled: false,
    newResponse: {}
  }
  let headers1 = {
    'accept': 'application/json'
  }
  let headers2 = {
    'accept': 'application/vnd.hal+json'
  }
  let headers3 = {}
  let transition_test = {
    rel: "relation", 
    target: "resource",
    accessibleFrom: [{ state: "somewhere" }],
    href: "/resources",
    method: "get"
  }
  let requestTest = {
    response: {
      source: {}
    },
    url: {
      path: '/resources'
    },
    method: 'get',
    connection: { info: { protocol: 'http' } },
    info: { host: 'example.org' }
  }
  let replyTest = function (resp) {
    results.newResponse = resp
  }
  replyTest.continue = function () { results.continueCalled = true }

  before(() => { transitions.addTransition(transition_test) })
  beforeEach(() => {
    results.continueCalled = false,
    results.newResponse = {}
  })

  describe('When called with wrong header', () => {
    it('Should reply.continue with no header', () => {
      requestTest.headers = headers3
      hapi_plugin.modify('hal')(requestTest, replyTest)
      expect(results.continueCalled).to.be.true
    })

    it('Should reply.continue with wrong header', () => {
      requestTest.headers = headers1
      hapi_plugin.modify('hal')(requestTest, replyTest)
      expect(results.continueCalled).to.be.true
    })
  })

  describe('When called with wrong request', () => {
    it('Should continue', () => {
      hapi_plugin.modify('hal')({headers: headers2}, replyTest)
      expect(results.continueCalled).to.be.true
    })
  })

  describe('when called with right header', () => {
    it('Should return a minimal Hal response', () => {
      requestTest.headers = headers2
      hapi_plugin.modify('hal')(requestTest, replyTest)
      expect(results.continueCalled).to.be.false
      expect(results.newResponse).to.have.property('_links')
    })
  })
})


      
