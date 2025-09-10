// Test setup
process.env.NODE_ENV = 'test'
process.env.POLICE_RAIDER_MODE = 'mock'

// Suppress console logs during tests
const originalConsole = console.log
beforeEach(() => {
  console.log = jest.fn()
})

afterEach(() => {
  console.log = originalConsole
})