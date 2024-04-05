import '@testing-library/jest-dom/vitest'
import { server } from './app/mocks/node.js'

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
