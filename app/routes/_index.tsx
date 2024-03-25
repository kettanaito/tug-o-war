import { useEffect, useState } from 'react'
import { json, useLoaderData } from '@remix-run/react'
import type {
  LinksFunction,
  LoaderFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from 'partymix'
import { Orientation } from '~/components/orientation'
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

export const links: LinksFunction = () => {
  return [
    {
      rel: 'manifest',
      href: '/manifest.json',
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
    initialCountdown: initialState.countdown,
    initialTimeElapsed: initialState.timeElapsed,
    lastWinner: initialState.lastWinner,
  })
}

export default function Index() {
  const [displayOrientationScreen, setDisplayOrientationScreen] = useState<
    boolean | undefined
  >(undefined)
  const {
    initialGameState,
    initialScore,
    initialCountdown,
    initialTimeElapsed,
    lastWinner,
  } = useLoaderData<typeof loader>()

  useEffect(() => {
    function checkOrientationAndUpdate() {
      setDisplayOrientationScreen(
        !screen.orientation.type.includes('landscape'),
      )
    }
    checkOrientationAndUpdate()

    screen.orientation.addEventListener('change', checkOrientationAndUpdate)

    return () => {
      screen.orientation.removeEventListener(
        'change',
        checkOrientationAndUpdate,
      )
    }
  }, [])

  if (displayOrientationScreen === undefined) {
    return null
  }

  return (
    <div>
      {displayOrientationScreen ? <Orientation /> : null}
      <TugOWar
        initialGameState={initialGameState}
        initialScore={initialScore}
        initialCountdown={initialCountdown}
        initialTimeElapsed={initialTimeElapsed}
        lastWinner={lastWinner}
      />
    </div>
  )
}
