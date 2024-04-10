import { ws, RequestHandler, WebSocketLink, WebSocketHandler } from 'msw'
import { ClientMessageType, GameState, ServerMessageType } from '~/messages.ts'

export const game: WebSocketLink = ws.link('ws://localhost:3000')

export const handlers: Array<RequestHandler | WebSocketHandler> = [
  // game.on('connection', ({ client, server }) => {
  //   // 1. Send data to the client.
  //   // client.send(
  //   //   JSON.stringify({
  //   //     type: 'game/state-change',
  //   //     payload: { nextState: GameState.PLAYING },
  //   //   } as ServerMessageType),
  //   // )
  //   // 2. Intercept outgoing client messages.
  //   client.addEventListener('message', (event) => {
  //     // console.log(event.data)
  //   })
  //   // 3. Modify outgoing messages.
  //   // client.addEventListener('message', (event) => {
  //   //   const message = JSON.parse(event.data.toString()) as ClientMessageType
  //   //   switch (message.type) {
  //   //     case 'pull': {
  //   //       client.send(
  //   //         JSON.stringify({
  //   //           type: 'game/state-change',
  //   //           payload: {
  //   //             nextState: GameState.END,
  //   //             winningTeam: message.payload.team,
  //   //           },
  //   //         } as ServerMessageType),
  //   //       )
  //   //       break
  //   //     }
  //   //   }
  //   // })
  //   // 4. Passthrough mode.
  //   // server.connect()
  //   // 5. Mock client messages.
  //   // client.addEventListener('message', (event) => {
  //   //   const message = JSON.parse(event.data.toString()) as ClientMessageType
  //   //   switch (message.type) {
  //   //     case 'pull': {
  //   //       // Do not forward pulls to the server.
  //   //       event.preventDefault()
  //   //       // Send mocked pulls instead.
  //   //       server.send(JSON.stringify(message))
  //   //       server.send(JSON.stringify(message))
  //   //       server.send(JSON.stringify(message))
  //   //       break
  //   //     }
  //   //   }
  //   // })
  //   // 6. Mock server messages.
  //   // server.addEventListener('message', (event) => {
  //   //   const message = JSON.parse(event.data.toString()) as ServerMessageType
  //   //   switch (message.type) {
  //   //     case 'game/score': {
  //   //       // Do not forward score to the client.
  //   //       event.preventDefault()
  //   //       const { nextScore } = message.payload
  //   //       // Send a mocked score instead.
  //   //       client.send(
  //   //         JSON.stringify({
  //   //           type: 'game/score',
  //   //           payload: {
  //   //             // Spaces can never win! Whahaha!
  //   //             nextScore: -nextScore + 10,
  //   //           },
  //   //         } as ServerMessageType),
  //   //       )
  //   //       break
  //   //     }
  //   //   }
  //   // })
  // }),
]
