import { GameTeam } from '~/messages.ts'

export function GameEnd({
  winningTeam,
}: {
  winningTeam: GameTeam | undefined
}) {
  return (
    <div>
      <h2>The game is over!</h2>
      {winningTeam ? (
        <p>{winningTeam} has won!</p>
      ) : (
        <p>Looks like it's a draw!</p>
      )}
    </div>
  )
}
