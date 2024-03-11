import { useState } from 'react'
import usePartySocket from 'partysocket/react'
import type {
  ClientMessageType,
  GameState,
  GameTeam,
  ServerMessageType,
} from 'party/game'
import { GameEnd } from './game-end'

export function TugOWar({
  initialGameState,
  initialScore,
  lastWinner,
}: {
  initialGameState: GameState
  initialScore: number
  lastWinner?: GameTeam
}) {
  const [gameState, setGameState] = useState(initialGameState)
  const [gameScore, setGameScore] = useState(initialScore)
  const [winningTeam, setWinningTeam] = useState<GameTeam | undefined>(
    lastWinner,
  )

  const socket = usePartySocket({
    party: 'game',
    room: 'index',
    onMessage(event) {
      const message = JSON.parse(event.data) as ServerMessageType

      switch (message.type) {
        case 'game-state': {
          setGameState(message.payload.nextState)

          if (message.payload.nextState === 'waiting' && gameScore !== 0) {
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
          <button className="h-32 w-32" onClick={handleReset}>
            Reset game
          </button>
        </>
      ) : (
        <>
          <input
            name="rope"
            type="range"
            min={-100}
            max={100}
            step={10}
            value={gameScore}
          />
          <button className="h-32 w-32" onClick={() => addScore('team-left')}>
            Left
          </button>
          <button className="h-32 w-32" onClick={() => addScore('team-right')}>
            Right
          </button>

          <button className="h-32 w-32" onClick={handleReady}>
            READY!
          </button>
        </>
      )}
    </div>
  )
}
