import { ws } from 'msw'

export const game = ws.link('ws://127.0.0.1:3009/parties/game/index')

export const handlers = []
