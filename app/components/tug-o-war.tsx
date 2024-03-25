import { useState } from 'react'
import usePartySocket from 'partysocket/react'
import { GameState } from 'party/game'
import type { ClientMessageType, GameTeam, ServerMessageType } from 'party/game'
import { GameEnd } from './game-end'

export const WEBSOCKET_SERVER_PARTY = 'game'
export const WEBSOCKET_SERVER_ROOM = 'index'

export function TugOWar({
  initialGameState,
  initialScore,
  initialCountdown,
  initialTimeElapsed,
  lastWinner,
}: {
  initialGameState: GameState
  initialScore: number
  initialCountdown?: number
  initialTimeElapsed?: number
  lastWinner?: GameTeam
}) {
  const [gameState, setGameState] = useState(initialGameState)
  const [gameScore, setGameScore] = useState(initialScore)
  const [winningTeam, setWinningTeam] = useState<GameTeam | undefined>(
    lastWinner,
  )
  const [countdown, setCountdown] = useState(initialCountdown ?? 0)
  const [timeElapsed, setTimeElapsed] = useState(initialTimeElapsed ?? 0)

  const socket = usePartySocket({
    party: WEBSOCKET_SERVER_PARTY,
    room: WEBSOCKET_SERVER_ROOM,
    onMessage(event) {
      const message = JSON.parse(event.data) as ServerMessageType

      switch (message.type) {
        case 'game/state-change': {
          setGameState(message.payload.nextState)

          if (message.payload.nextState === GameState.IDLE && gameScore !== 0) {
            setTimeElapsed(0)
            setGameScore(0)
          }

          if (message.payload.nextState === GameState.END) {
            setWinningTeam(message.payload.winningTeam)
          }
          break
        }

        case 'game/score': {
          setGameScore(message.payload.nextScore)
          break
        }

        case 'time/countdown': {
          setCountdown(message.payload.countdown)
          break
        }

        case 'time/elapsed': {
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
      {(() => {
        switch (gameState) {
          case GameState.END: {
            return (
              <>
                <GameEnd winningTeam={winningTeam!} />
                <button className="h-32 w-32" onClick={handleReset}>
                  Reset game
                </button>
              </>
            )
          }

          default: {
            return (
              <>
                {countdown > 0 ? <h1>{countdown}</h1> : null}
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
                  className="h-32 w-32"
                  onClick={() => addScore('team-left')}
                  disabled={gameState !== GameState.PLAYING}
                >
                  Left
                </button>
                <button
                  className="h-32 w-32"
                  onClick={() => addScore('team-right')}
                  disabled={gameState !== GameState.PLAYING}
                >
                  Right
                </button>

                <button className="h-32 w-32" onClick={handleReady}>
                  READY!
                </button>
                <button
                  className="h-32 w-32"
                  onClick={() => {
                    socket.send(
                      JSON.stringify({
                        type: 'admin/reset',
                      } satisfies ClientMessageType),
                    )
                  }}
                >
                  Reset
                </button>
              </>
            )
          }
        }
      })()}
    </div>
  )
}
