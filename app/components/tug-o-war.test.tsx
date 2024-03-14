import { ws } from 'msw'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { server } from '~/mocks/node'
import GameServer from '../../party/game'
import { TugOWar } from './tug-o-war'

const game = ws.link('ws://localhost:3000/parties/game/index')

const gameServer = new GameServer({
  name: 'test-room',
  id: crypto.randomUUID(),
  internalID: crypto.randomUUID(),
  storage: {
    put: vi.fn(),
    get: vi.fn(),
    sync: vi.fn(),
  },
  context: {
    ai: {},
    parties: {},
  } as any,
  env: {},
  parties: {},
  connections: new Map(),
  getConnection: vi.fn(),
  getConnections: vi.fn(),
  analytics: { writeDataPoint: vi.fn() },
  blockConcurrencyWhile: vi.fn(),
  broadcast(message) {
    game.broadcast(message)
  },
})

it.only('renders a winning screen once one side wins', async () => {
  server.use(
    game.on('connection', ({ client }) => {
      client.addEventListener('message', (event) => {
        console.log('client sent:', event.data)
        gameServer.onMessage(event.data, {} as any)
      })
    })
  )

  render(
    <TugOWar
      initialGameState="playing"
      initialScore={0}
      initialTimeElapsed={0}
    />
  )

  await act(() => {
    return userEvent.click(screen.getByRole('button', { name: /ready!/i }))
  })

  const leftButton = screen.getByRole('button', { name: /left/i })
  await act(() => {
    return userEvent.click(leftButton)
  })
})
