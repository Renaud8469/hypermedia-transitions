const chai = require('chai')
const expect = chai.expect
const transition_module = require('../index')

describe('Check if all functions are here', () => {
  it('should contain addTransition', () => { 
    expect(transition_module.addTransition).to.exist
  })
  it('Should contain getTransitionList', () => {
    expect(transition_module.getTransitionList).to.exist
  })
  it('Should contain halInterceptor', () => {
    expect(transition_module.halInterceptor).to.exist
  })
})
