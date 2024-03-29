import { ws } from 'msw'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { server } from '~/mocks/node'
import {
  type ServerMessageType,
  type ClientMessageType,
  GameState,
} from '../../party/game'
import {
  TugOWar,
  WEBSOCKET_SERVER_PARTY,
  WEBSOCKET_SERVER_ROOM,
} from './tug-o-war'

const game = ws.link(
  `ws://*/parties/${WEBSOCKET_SERVER_PARTY}/${WEBSOCKET_SERVER_ROOM}`,
)

it('starts in a waiting mode', async () => {
  render(
    <TugOWar
      initialGameState={GameState.IDLE}
      initialScore={0}
      initialTimeElapsed={0}
    />,
  )

  const pullRightButton = screen.getByRole('button', { name: /right/i })
  const pullLeftButton = screen.getByRole('button', { name: /left/i })

  // The pull buttons are disabled until the game starts.
  expect(pullRightButton).toBeDisabled()
  expect(pullLeftButton).toBeDisabled()
})

it('enables pulling buttons once the server starts the game', async () => {
  server.use(
    game.on('connection', ({ client }) => {
      client.send(
        JSON.stringify({
          type: 'game/state-change',
          payload: {
            nextState: GameState.PLAYING,
          },
        } satisfies ServerMessageType),
      )
    }),
  )

  render(
    <TugOWar
      initialGameState={GameState.IDLE}
      initialScore={0}
      initialTimeElapsed={0}
    />,
  )

  const pullRightButton = screen.getByRole('button', { name: /right/i })
  const pullLeftButton = screen.getByRole('button', { name: /left/i })

  // Once the server starts the game, the pull buttons are enabled.
  await waitFor(() => {
    expect(pullRightButton).toBeEnabled()
    expect(pullLeftButton).toBeEnabled()
  })
})

it('emits the "pull" event when pulling the rope to the right', async () => {
  const clientMessageListener = vi.fn()
  server.use(
    game.on('connection', ({ client }) => {
      client.addEventListener('message', (event) => {
        clientMessageListener(JSON.parse(event.data))
      })
    }),
  )

  render(
    <TugOWar
      initialGameState={GameState.PLAYING}
      initialScore={0}
      initialTimeElapsed={0}
    />,
  )

  const pullRightButton = screen.getByRole('button', { name: /right/i })
  await userEvent.click(pullRightButton)

  // Clicking on the pull button emits the event to the server.
  await waitFor(() => {
    expect(clientMessageListener).toHaveBeenLastCalledWith({
      type: 'pull',
      payload: {
        team: 'team-right',
      },
    } satisfies ClientMessageType)
  })
})

it('emits the "pull" event when pulling the rope to the left', async () => {
  const clientMessageListener = vi.fn()
  server.use(
    game.on('connection', ({ client }) => {
      client.addEventListener('message', (event) => {
        clientMessageListener(JSON.parse(event.data))
      })
    }),
  )

  render(
    <TugOWar
      initialGameState={GameState.PLAYING}
      initialScore={0}
      initialTimeElapsed={0}
    />,
  )

  const pullLeftButton = screen.getByRole('button', { name: /left/i })
  await userEvent.click(pullLeftButton)

  // Clicking on the pull button emits the event to the server.
  await waitFor(() => {
    expect(clientMessageListener).toHaveBeenLastCalledWith({
      type: 'pull',
      payload: {
        team: 'team-left',
      },
    } satisfies ClientMessageType)
  })
})

it('shows the winning screen once one side wins', async () => {
  server.use(
    game.on('connection', ({ client }) => {
      // Send the game state change from the server on the
      // next tick to isolate the component's behavior.
      queueMicrotask(() => {
        client.send(
          JSON.stringify({
            type: 'game/state-change',
            payload: {
              nextState: GameState.END,
              winningTeam: 'team-right',
            },
          } satisfies ServerMessageType),
        )
      })
    }),
  )

  render(
    <TugOWar
      initialGameState={GameState.PLAYING}
      initialScore={0}
      initialTimeElapsed={0}
    />,
  )

  // Wait for the UI to show the winning message.
  expect(
    await screen.findByRole('heading', { name: /The game is over/i }),
  ).toBeVisible()
  expect(screen.getByText(/team-right has won/i)).toBeVisible()

  // Pulling buttons are not present on the winning screen.
  expect(
    screen.queryByRole('button', { name: /right/i }),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: /left/i }),
  ).not.toBeInTheDocument()
})
