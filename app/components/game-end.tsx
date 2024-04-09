import { GameTeam } from '~/messages.ts'

export function GameEnd({
  winningTeam,
}: {
  winningTeam: GameTeam | undefined
}) {
  return (
    <div
      style={{
        background: 'url(/assets/board.png) no-repeat top center',
        backgroundSize: 'cover',
        width: '50vw',
        maxWidth: '100%',
        aspectRatio: '2.85 / 1',
        margin: '16.5vw auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          marginTop: '-3vw',
          fontSize: '3vw',
          textAlign: 'center',
          textShadow: '0 0.25vw 0 rgba(255,255,255,0.25)',
        }}
      >
        <h2 style={{ fontSize: '5vw', margin: '0 0 0.5vw' }}>
          That's the game!
        </h2>
        <p style={{ margin: 0 }}>
          {winningTeam ? (
            <>{winningTeam} has won!</>
          ) : (
            <>Looks like it's a DRAW!</>
          )}
        </p>
      </div>
    </div>
  )
}
