import { useEffect } from 'react'
import { Sign } from './sign.tsx'
import { GameState, GameTeam, MAX_SCORE, MIN_SCORE } from '~/messages.ts'
import { options } from '~/question.ts'

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
  const teamLeftProgress = useTeamProgress(score, 'team-left')
  const teamRightProgress = useTeamProgress(score, 'team-right')

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
          color: '#111',
        }}
      >
        00:{timeElapsed.toString().padStart(2, '0')}
      </h2>
      <div id="arena">
        <div
          style={{
            background: 'url(/assets/rope.png) top left no-repeat',
            backgroundSize: 'contain',
            aspectRatio: '32.34 / 1',
            height: '1.73vw',
            position: 'absolute',
            top: '40.4%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />

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
              gap: '1vw',
              transform: `translateX(calc(-10vw + ${
                teamRightProgress / 10
              }vw))`,
            }}
          >
            <Character sprite={1} />
            <Character sprite={2} />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1vw',
              transform: `translateX(calc(10vw - ${teamLeftProgress / 10}vw))`,
            }}
          >
            <Character sprite={3} />
            <Character sprite={4} />
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
        <Sign>{options['team-left']}</Sign>
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
        <Sign reversed>{options['team-right']}</Sign>
      </div>
    </div>
  )
}

function Character({ sprite }: { sprite: 1 | 2 | 3 | 4 }) {
  return (
    <div
      className="character"
      style={{
        position: 'relative',
        width: 'auto',
        height: '10vw',
        aspectRatio: '1 / 1.22',
        background: `url(/assets/player-${sprite}.png) no-repeat top left`,
        backgroundSize: 'contain',
      }}
    />
  )
}

function getNextTeamProgress(score: number, maxScore: number) {
  return Math.max(0, Math.min(100, (score * 100) / maxScore))
}

function useTeamProgress(score: number, team: GameTeam) {
  const prevProgress = Number(sessionStorage.getItem(`${team}-progress`) || 0)
  const nextProgress = getNextTeamProgress(
    score,
    team === 'team-left' ? MIN_SCORE : MAX_SCORE,
  )
  const resolvedProgress = Math.max(prevProgress || 0, nextProgress)

  // Keep the previous value of the progress
  // because it can never decrease, only increase.
  useEffect(() => {
    sessionStorage.setItem(`${team}-progress`, resolvedProgress.toString())
  }, [resolvedProgress])

  return resolvedProgress
}
