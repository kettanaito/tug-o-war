import { useEffect, useState } from 'react'
import { useWebSocketClient } from '~/hooks/useWebSocketClient.ts'
import { ClientMessageType } from '~/messages.ts'

export function AdminControls() {
  const [playersCount, setPlayersCount] = useState(0)
  const socket = useWebSocketClient()

  const handleReady = () => {
    socket.send(
      JSON.stringify({ type: 'admin/ready' } satisfies ClientMessageType),
    )
  }

  const handleReset = () => {
    sessionStorage.removeItem('team-left-progress')
    sessionStorage.removeItem('team-right-progress')
    socket.send(
      JSON.stringify({ type: 'admin/reset' } satisfies ClientMessageType),
    )
  }

  useEffect(() => {
    const pollPlayersCount = async () => {
      const response = await fetch('/clients-count')
      const playersCount = await response.text()
      setPlayersCount(Number(playersCount))
    }

    pollPlayersCount()
    const interval = setInterval(() => pollPlayersCount(), 3_000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        margin: 'auto',
        padding: '1rem',
        color: '#fff',
        background: '#00000095',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={handleReady} style={{ padding: '0.5rem 2rem' }}>
          <strong>Start game</strong>
        </button>
        <button onClick={handleReset} style={{ padding: '0.5rem 2rem' }}>
          Reset
        </button>
        <p>{playersCount} player(s)</p>
      </div>
    </div>
  )
}
