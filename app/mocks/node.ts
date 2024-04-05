import { setupServer } from 'msw/node'

// We aren't reusing the handlers here because
// we want to develop and test this WebSocket app independently.
export const server = setupServer()
