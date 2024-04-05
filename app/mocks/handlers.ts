import { ws, RequestHandler, WebSocketLink, WebSocketHandler } from 'msw'

export const game: WebSocketLink = ws.link('ws://localhost:3000')

export const handlers: Array<RequestHandler | WebSocketHandler> = [
  game.on('connection', ({ client, server }) => {
    server.connect()
    client.addEventListener('message', (event) => {
      server.send(event.data)
    })
  }),
]
