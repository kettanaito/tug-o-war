import { ws } from 'msw'

export const game = ws.link('ws://*/parties/game/index')

export const handlers = [
  game.on('connection', ({ client, server }) => {
    server.connect()
    client.addEventListener('message', (event) => {
      server.send(event.data)
    })
  }),
]
