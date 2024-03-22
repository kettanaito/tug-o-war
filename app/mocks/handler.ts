import { ws } from 'msw'

export const game = ws.link('ws://*/parties/game/index')

export const handlers = [
  game.on('connection', ({ client }) => {
    client.send(JSON.stringify({ text: 'hello world' }))
  }),
]
