import { ws } from 'msw'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { server } from '~/mocks/node'
import type { ServerMessageType, ClientMessageType } from '../../party/game'
import { TugOWar } from './tug-o-war'

const game = ws.link('ws://localhost:3000/parties/game/index')

afterEach(() => {
  server.resetHandlers()
})

it('starts in a waiting mode', async () => {
  render(
    <TugOWar
      initialGameState="waiting"
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
          type: 'game-state',
          payload: {
            nextState: 'playing',
          },
        } satisfies ServerMessageType),
      )
    }),
  )

  render(
    <TugOWar
      initialGameState="waiting"
      initialScore={0}
      initialTimeElapsed={0}
    />,
  )

  const pullRightButton = screen.getByRole('button', { name: /right/i })
  const pullLeftButton = screen.getByRole('button', { name: /left/i })

  // Once the server starts the game, the pull buttons are enabled.
  await vi.waitFor(() => {
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
      initialGameState="playing"
      initialScore={0}
      initialTimeElapsed={0}
    />,
  )

  const pullRightButton = screen.getByRole('button', { name: /right/i })
  await act(() => userEvent.click(pullRightButton))

  // Clicking on the pull button emits the event to the server.
  await vi.waitFor(() => {
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
      initialGameState="playing"
      initialScore={0}
      initialTimeElapsed={0}
    />,
  )

  const pullLeftButton = screen.getByRole('button', { name: /left/i })
  await act(() => userEvent.click(pullLeftButton))

  // Clicking on the pull button emits the event to the server.
  await vi.waitFor(() => {
    expect(clientMessageListener).toHaveBeenLastCalledWith({
      type: 'pull',
      payload: {
        team: 'team-left',
      },
    } satisfies ClientMessageType)
  })
})

it('shows a winning screen once one side wins', async () => {
  server.use(
    game.on('connection', ({ client }) => {
      // Send the game state change from the server on the
      // next tick to isolate the component's behavior.
      queueMicrotask(() => {
        client.send(
          JSON.stringify({
            type: 'game-state',
            payload: {
              nextState: 'ended',
              winningTeam: 'team-right',
            },
          } satisfies ServerMessageType),
        )
      })
    }),
  )

  render(
    <TugOWar
      initialGameState="playing"
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
