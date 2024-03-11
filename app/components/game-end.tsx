import type { GameTeam } from 'party/game'

export function GameEnd({ winningTeam }: { winningTeam: GameTeam }) {
  return (
    <div>
      <h2>The game is over!</h2>
      <p>
        <strong>{winningTeam}</strong> has won!
      </p>
    </div>
  )
}
