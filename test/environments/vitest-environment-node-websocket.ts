import type { Environment } from 'vitest'
import { builtinEnvironments } from 'vitest/environments'
import { WebSocket } from 'undici'

export default <Environment>{
  name: 'vitest-environment-node-websocket',
  transformMode: 'ssr',
  async setup(global, options) {
    const { teardown } = await builtinEnvironments['happy-dom'].setup(
      global,
      options
    )

    Reflect.set(globalThis, 'WebSocket', WebSocket)

    return {
      teardown,
    }
  },
}
