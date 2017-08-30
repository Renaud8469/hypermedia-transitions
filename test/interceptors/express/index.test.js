const expect = require('chai').expect
const interceptors = require('../../../interceptors/express')

describe('Instanciating the HAL interceptor', () => {

  it('Should be properly instanciated', () => {
    expect(interceptors.halInterceptor).to.exist
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
      expect(interceptors.setupInterceptor(req, res)).to.have.property('isInterceptable')
      expect(interceptors.setupInterceptor(req, res)).to.have.property('intercept')
    })
  })
})
