import type { GameTeam } from 'party/game'

export function GameEnd({
  winningTeam,
}: {
  winningTeam: GameTeam | undefined
}) {
  return (
    <div>
      <h2>The game is over!</h2>
      {winningTeam ? (
        <p>
          <strong>{winningTeam}</strong> has won!
        </p>
      ) : (
        <p>It is a draw!</p>
      )}
    </div>
  )
}
