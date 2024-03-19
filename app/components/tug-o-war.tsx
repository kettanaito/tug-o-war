import { useState } from 'react'
import usePartySocket from 'partysocket/react'
import type {
  ClientMessageType,
  GameState,
  GameTeam,
  ServerMessageType,
} from 'party/game'
import { GameEnd } from './game-end'

export const WEBSOCKET_SERVER_PARTY = 'game'
export const WEBSOCKET_SERVER_ROOM = 'index'

export function TugOWar({
  initialGameState,
  initialScore,
  initialTimeElapsed,
  lastWinner,
}: {
  initialGameState: GameState
  initialScore: number
  initialTimeElapsed?: number
  lastWinner?: GameTeam
}) {
  const [gameState, setGameState] = useState(initialGameState)
  const [gameScore, setGameScore] = useState(initialScore)
  const [winningTeam, setWinningTeam] = useState<GameTeam | undefined>(
    lastWinner,
  )
  const [timeElapsed, setTimeElapsed] = useState(initialTimeElapsed ?? 0)

  const socket = usePartySocket({
    party: WEBSOCKET_SERVER_PARTY,
    room: WEBSOCKET_SERVER_ROOM,
    onMessage(event) {
      const message = JSON.parse(event.data) as ServerMessageType

      console.log('[component] message:', message)

      switch (message.type) {
        case 'game-state': {
          setGameState(message.payload.nextState)

          if (message.payload.nextState === 'waiting' && gameScore !== 0) {
            setTimeElapsed(0)
            setGameScore(0)
          }

          if (message.payload.nextState === 'ended') {
            setWinningTeam(message.payload.winningTeam)
          }
          break
        }

        case 'score': {
          setGameScore(message.payload.nextScore)
          break
        }

        case 'game-time': {
          console.log('GAME TIME', message.payload)
          setTimeElapsed(message.payload.timeElapsed)
          break
        }
      }
    },
  })

  const addScore = (team: GameTeam) => {
    socket.send(
      JSON.stringify({
        type: 'pull',
        payload: {
          team,
        },
      } satisfies ClientMessageType),
    )
  }

  const handleReady = () => {
    socket.send(
      JSON.stringify({ type: 'admin/ready' } satisfies ClientMessageType),
    )
  }
  const handleReset = () => {
    socket.send(
      JSON.stringify({ type: 'admin/reset' } satisfies ClientMessageType),
    )
  }

  return (
    <div>
      {gameState === 'ended' ? (
        <>
          <GameEnd winningTeam={winningTeam!} />
          <button className="w-32 h-32" onClick={handleReset}>
            Reset game
          </button>
        </>
      ) : (
        <>
          <h2>00:{timeElapsed.toString().padStart(2, '0')}</h2>
          <input
            name="rope"
            type="range"
            min={-100}
            max={100}
            step={10}
            value={gameScore}
          />
          <button
            className="w-32 h-32"
            onClick={() => addScore('team-left')}
            disabled={gameState !== 'playing'}
          >
            Left
          </button>
          <button
            className="w-32 h-32"
            onClick={() => addScore('team-right')}
            disabled={gameState !== 'playing'}
          >
            Right
          </button>

          <button className="w-32 h-32" onClick={handleReady}>
            READY!
          </button>
        </>
      )}
    </div>
  )
}
