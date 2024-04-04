import { useEffect, useRef } from 'react'
import type { Data } from 'ws'

interface WebSocketClientOptions {
  onOpen?: (event: Event) => void
  onMessage?: (event: MessageEvent<Data>) => void
  onError?: (event: Event) => void
  onClose?: (event: Event) => void
}

interface WebSocketClientReturnType {
  send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void
}

export function useWebSocketClient(
  options?: WebSocketClientOptions,
): WebSocketClientReturnType {
  const wsRef = useRef<WebSocket>()

  useEffect(() => {
    const wsUrl = new URL('/', document.baseURI)
    wsUrl.protocol = wsUrl.protocol.replace('http', 'ws')
    const ws = new WebSocket(wsUrl)

    if (options?.onOpen) {
      ws.addEventListener('open', options.onOpen)
    }
    if (options?.onMessage) {
      ws.addEventListener('message', options.onMessage)
    }
    if (options?.onError) {
      ws.addEventListener('error', options.onError)
    }
    if (options?.onClose) {
      ws.addEventListener('close', options.onClose)
    }

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [])

  return {
    send(data) {
      wsRef.current?.send(data)
    },
  }
}
