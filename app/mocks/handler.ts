import { ws } from 'msw'

const game = ws.link('ws://127.0.0.1:3009/parties/game/index')

export const handlers = [
  game.on('connection', ({ client, server }) => {
    console.log('CONNECTION!', client.url)

    server.connect()
    client.addEventListener('message', (event) => {
      console.log('sending:', event.data)
      server.send(event.data)
    })
  }),
]
