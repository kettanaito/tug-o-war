import { json, useLoaderData } from '@remix-run/react'
import type { LoaderFunction, LoaderFunctionArgs, MetaFunction } from 'partymix'
import { TugOWar } from '~/components/tug-o-war'

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Tug-o-War',
    },
    {
      name: 'description',
      content: 'Realtime game of tug-o-war with Remix, PartyKit, and MSW',
    },
  ]
}

export const loader: LoaderFunction = async function ({
  request,
  context,
}: LoaderFunctionArgs) {
  // Fetch the current score of the game on initial load
  // and pass it to the client component as the initial state.

  const initialState = await context.lobby.parties.game
    .get('index')
    .fetch('/')
    .then((response) => response.json())
    .catch(() => -1)

  return json({
    initialGameState: initialState.gameState,
    initialScore: initialState.score,
    lastWinner: initialState.lastWinner,
  })
}

export default function Index() {
  const { initialGameState, initialScore, lastWinner } =
    useLoaderData<typeof loader>()

  return (
    <div>
      <TugOWar
        initialGameState={initialGameState}
        initialScore={initialScore}
        lastWinner={lastWinner}
      />
    </div>
  )
}
