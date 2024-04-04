import { useEffect, useRef } from 'react'
import { Sign } from './sign.tsx'
import { GameState, GameTeam, MAX_SCORE, MIN_SCORE } from '~/messages.ts'

export function Arena({
  gameState,
  score,
  timeElapsed,
  onPull,
}: {
  gameState: GameState
  score: number
  timeElapsed: number
  onPull: (team: GameTeam) => void
}) {
  const teamLeftProgress = useTeamProgress(score, MIN_SCORE)
  const teamRightProgress = useTeamProgress(score, MAX_SCORE)

  return (
    <div style={{ marginTop: '2vw' }}>
      <button
        aria-label="Pull left"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '50%',
          zIndex: 1,
          background: 'transparent',
          border: 0,
        }}
        onClick={() => onPull('team-left')}
        disabled={gameState !== GameState.PLAYING}
      />
      <button
        aria-label="Pull right"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: '50%',
          zIndex: 1,
          background: 'transparent',
          border: 0,
        }}
        onClick={() => onPull('team-right')}
        disabled={gameState !== GameState.PLAYING}
      />

      <h2
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          margin: 0,
          textAlign: 'center',
          fontSize: '12vw',
          color: '#333',
        }}
      >
        00:{timeElapsed.toString().padStart(2, '0')}
      </h2>
      <div id="arena">
        <div
          style={{
            position: 'absolute',
            top: 'calc(50% - 5vw)',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2vw',
              marginRight: '10vw',
              transform: `translateX(${teamRightProgress}px)`,
            }}
          >
            <Character color="red" />
            <Character color="red" />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2vw',
              marginLeft: '10vw',
              transform: `translateX(-${teamLeftProgress}px)`,
            }}
          >
            <Character color="blue" />
            <Character color="blue" />
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '1.5vw',
          fontSize: '3.75vw',
          width: '20%',
        }}
      >
        <Sign>Tabs</Sign>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: '1.5vw',
          fontSize: '3.75vw',
          width: '20%',
        }}
      >
        <Sign reversed>Spaces</Sign>
      </div>
    </div>
  )
}

function Character({ color }: { color: string }) {
  return (
    <div
      style={{
        width: 'auto',
        height: '10vw',
        aspectRatio: '1/2',
        background: color,
      }}
    />
  )
}

function getNextTeamProgress(score: number, maxScore: number) {
  return Math.max(0, Math.min(100, (score * 100) / maxScore))
}

function useTeamProgress(score: number, maxScore: number) {
  const prevProgress = useRef(score)
  const nextProgress = getNextTeamProgress(score, maxScore)
  const resolvedProgress = Math.max(prevProgress.current || 0, nextProgress)

  // Keep the previous value of the progress
  // because it can never decrease, only increase.
  useEffect(() => {
    prevProgress.current = resolvedProgress
  }, [resolvedProgress])

  return resolvedProgress
}
