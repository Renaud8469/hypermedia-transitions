const expect = require('chai').expect
const interceptors = require('../../../interceptors/express')

describe('Instanciating the HAL interceptor', () => {

  it('Should be properly instanciated', () => {
    expect(interceptors.halInterceptor).to.exist
  })
  it('Should be properly instanciated', () => {
    expect(interceptors.halDefaultInterceptor).to.exist
  })
})

describe('Selecting requests to intercept', () => {

  let req1 = {
    get: function (str) {
      if (str === 'Accept') {
        return 'application/vnd.hal+json'
      } else {
        return 'Something else'
      }
    }
  }
  let req2 = {
    get: function (str) {
      if (str === 'Accept') {
        return 'application/json'
      } else {
        return 'Something else'
      }
    }
  }

  it('Should match req1', () => {
    expect(interceptors.isHalInterceptable(req1)()).to.be.true
  })

  it('Should not match req2', () => {
    expect(interceptors.isHalInterceptable(req2)()).to.be.false
  })
})


describe('Intercepting the response', () => {

  let resultStorage = {
    headerType: '',
    headerValue: '',
    sentJson: {}
  }

  let req = {
    originalUrl: '/resource',
    method: 'GET',
    protocol: 'http',
    hostname: 'example.org',
    get: function (str) {
      if (str === 'Accept') {
        return 'application/vnd.hal+json'
      } else {
        return 'Something else'
      }
    }
  }
  let res = {
    set: function (str1, str2) {
      resultStorage.headerType = str1
      resultStorage.headerValue = str2
    }
  }

  let send = function (str) {
    try {
      resultStorage.sentJson = JSON.parse(str)
    } catch (e) {
      resultStorage.sentJson = str
    }
  }


  describe('Sending an empty object body', () => {
    before(() => {
      interceptors.halIntercept(req, res)("{}", send)
    })

    it('Should return the right content-type', () => {
      expect(resultStorage.headerType).to.equal('Content-type')
      expect(resultStorage.headerValue).to.equal('application/vnd.hal+json')
    })

    it('Should return an empty HAL object', () => {
      expect(resultStorage.sentJson).to.deep.equal({ _links: {} })
    })
  })

  describe('Sending an empty array', () => {
    before(() => {
      interceptors.halIntercept(req, res)("[]", send)
    })

    it('Should return the right content-type', () => {
      expect(resultStorage.headerType).to.equal('Content-type')
      expect(resultStorage.headerValue).to.equal('application/vnd.hal+json')
    })

    it('Should return an empty HAL object with embedded property', () => {
      expect(resultStorage.sentJson).to.deep.equal(
          { 
            _links: {},
            _embedded: {
              list: []
            }
          })
    })
  })

  describe('Sending malformed JSON', () => {
    before(() => {
      interceptors.halIntercept(req, res)("Some error", send)
    })

    it('Should return the right content-type', () => {
      expect(resultStorage.headerType).to.equal('Content-type')
      expect(resultStorage.headerValue).to.equal('application/vnd.hal+json')
    })

    it('Should return the same string', () => {
      expect(resultStorage.sentJson).to.equal('Some error')
    })
  })


  describe('Interceptor setup function gives the right properties', () => {
    it('Should have isInterceptable and intercept properties', () => {
      expect(interceptors.setupHalInterceptor(req, res)).to.have.property('isInterceptable')
      expect(interceptors.setupHalInterceptor(req, res)).to.have.property('intercept')
    })
  })
})

// =========================================
// Siren interceptor
// =========================================

describe('Instanciating the Siren interceptor', () => {

  it('Should be properly instanciated', () => {
    expect(interceptors.sirenInterceptor).to.exist
  })
  it('Should be properly instanciated', () => {
    expect(interceptors.sirenDefaultInterceptor).to.exist
  })
})

describe('Selecting requests to intercept (siren)', () => {

  let req1 = {
    get: function (str) {
      if (str === 'Accept') {
        return 'application/vnd.siren+json'
      } else {
        return 'Something else'
      }
    }
  }
  let req2 = {
    get: function (str) {
      if (str === 'Accept') {
        return 'application/json'
      } else {
        return 'Something else'
      }
    }
  }

  it('Should match req1', () => {
    expect(interceptors.isSirenInterceptable(req1)()).to.be.true
  })

  it('Should not match req2', () => {
    expect(interceptors.isSirenInterceptable(req2)()).to.be.false
  })
})


describe('Intercepting the response', () => {

  let resultStorage = {
    headerType: '',
    headerValue: '',
    sentJson: {}
  }

  let req = {
    originalUrl: '/resource',
    method: 'GET',
    protocol: 'http',
    hostname: 'example.org',
    get: function (str) {
      if (str === 'Accept') {
        return 'application/vnd.siren+json'
      } else {
        return 'Something else'
      }
    }
  }
  let res = {
    set: function (str1, str2) {
      resultStorage.headerType = str1
      resultStorage.headerValue = str2
    }
  }

  let send = function (str) {
    try {
      resultStorage.sentJson = JSON.parse(str)
    } catch (e) {
      resultStorage.sentJson = str
    }
  }


  describe('Sending an empty object body', () => {
    before(() => {
      interceptors.sirenIntercept(req, res)("{}", send)
    })

    it('Should return the right content-type', () => {
      expect(resultStorage.headerType).to.equal('Content-type')
      expect(resultStorage.headerValue).to.equal('application/vnd.siren+json')
    })

    it('Should return an empty Siren object', () => {
      expect(resultStorage.sentJson).to.deep.equal({})
    })
  })

  describe('Sending an empty array', () => {
    before(() => {
      interceptors.sirenIntercept(req, res)("[]", send)
    })

    it('Should return the right content-type', () => {
      expect(resultStorage.headerType).to.equal('Content-type')
      expect(resultStorage.headerValue).to.equal('application/vnd.siren+json')
    })

    it('Should return an empty Siren object with embedded entities', () => {
      expect(resultStorage.sentJson).to.deep.equal({
        entities: []
      })
    })
  })

  describe('Sending malformed JSON', () => {
    before(() => {
      interceptors.sirenIntercept(req, res)("Some error", send)
    })

    it('Should return the right content-type', () => {
      expect(resultStorage.headerType).to.equal('Content-type')
      expect(resultStorage.headerValue).to.equal('application/vnd.siren+json')
    })

    it('Should return the same string', () => {
      expect(resultStorage.sentJson).to.equal('Some error')
    })
  })


  describe('Interceptor setup function gives the right properties', () => {
    it('Should have isInterceptable and intercept properties', () => {
      expect(interceptors.setupSirenInterceptor(req, res)).to.have.property('isInterceptable')
      expect(interceptors.setupSirenInterceptor(req, res)).to.have.property('intercept')
    })
  })

  // ================================
  // Generic interceptor function test
  // ================================

  describe('When specifying a media type as default', () => {
    it('Should return true', () => {
      expect(interceptors.setupHalDefaultInterceptor(req, res).isInterceptable()).to.be.true
      expect(interceptors.setupSirenDefaultInterceptor(req, res).isInterceptable()).to.be.true
    })
  })
})
