import { useState } from 'react'
import { GameEnd } from '~/components/game-end.tsx'
import { Arena } from '~/components/arena.tsx'
import { useWebSocketClient } from '~/hooks/useWebSocketClient.ts'
import { ClientMessageType, GameState, GameTeam } from '~/messages.ts'
import { AdminControls } from './admin-controls.tsx'

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
  const [countdown, setCountdown] = useState(initialCountdown ?? -1)
  const [timeElapsed, setTimeElapsed] = useState(initialTimeElapsed ?? 0)

  // Conditionally display the admin controls.
  const shouldDisplayAdmin =
    new URLSearchParams(window.location.search).get('admin') === 'true'

  const socket = useWebSocketClient({
    onMessage(event) {
      const { data } = event

      if (typeof data !== 'string') {
        return
      }

      const message = JSON.parse(data)

      switch (message.type) {
        case 'game/state-change': {
          setGameState(message.payload.nextState)

          // Handle reset.
          if (message.payload.nextState === GameState.IDLE && gameScore !== 0) {
            setGameScore(0)
            setCountdown(-1)
            setTimeElapsed(0)

            sessionStorage.removeItem('team-left-progress')
            sessionStorage.removeItem('team-right-progress')
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

  return (
    <div id="gameplay-area">
      {(() => {
        switch (gameState) {
          case GameState.END: {
            return <GameEnd winningTeam={winningTeam!} />
          }

          default: {
            return (
              <>
                {countdown > 0 ? (
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#00000070',
                      color: '#fff',
                      zIndex: 10,
                      userSelect: 'none',
                    }}
                  >
                    <h1 style={{ margin: 0, fontSize: '10rem' }}>
                      {countdown}
                    </h1>
                  </div>
                ) : null}

                <Arena
                  // Force the arena to return to its initial state
                  // since the score of 0 is not indicative of the game reset.
                  // The score can also become 0 when pulling.
                  gameState={gameState}
                  score={gameScore}
                  timeElapsed={timeElapsed}
                  onPull={(team) => {
                    if (gameState === GameState.PLAYING) {
                      addScore(team)
                    }
                  }}
                />
              </>
            )
          }
        }
      })()}

      {shouldDisplayAdmin ? <AdminControls /> : null}
    </div>
  )
}
