import { useEffect, useState } from 'react'
import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Orientation } from '~/components/orientation.tsx'
import { TugOWar } from '~/components/tug-o-war.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
  const initialState = await fetch(new URL('/initial-state', request.url)).then(
    (response) => response.json(),
  )

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
    <>
      {displayOrientationScreen ? <Orientation /> : null}
      <TugOWar
        initialGameState={initialGameState}
        initialScore={initialScore}
        initialCountdown={initialCountdown}
        initialTimeElapsed={initialTimeElapsed}
        lastWinner={lastWinner}
      />
    </>
  )
}
