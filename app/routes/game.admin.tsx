import { useWebSocketClient } from '~/hooks/useWebSocketClient.ts'
import { ClientMessageType } from '~/messages.ts'

export default function GameAdminPanel() {
  const socket = useWebSocketClient()

  const handleReady = () => {
    socket.send(
      JSON.stringify({ type: 'admin/ready' } satisfies ClientMessageType),
    )
  }
  const handleReset = () => {
    socket.send(
      JSON.stringify({ type: 'admin/reset' } satisfies ClientMessageType),
    )
  }

  return (
    <div style={{ padding: '1rem', color: '#eee' }}>
      <h1>Game admin</h1>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleReady}
          style={{ padding: '2rem', width: '250px' }}
        >
          READY!
        </button>
        <button onClick={handleReset} style={{ padding: '2rem' }}>
          RESET
        </button>
      </div>
    </div>
  )
}
