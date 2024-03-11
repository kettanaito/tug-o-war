import type * as Party from 'partykit/server'

const MIN_SCORE = -100
const MAX_SCORE = 100

export type GameTeam = 'team-left' | 'team-right'
export type GameState = 'waiting' | 'playing' | 'ended'

export type ServerMessageType =
  | {
      type: 'score'
      payload: {
        nextScore: number
      }
    }
  | {
      type: 'game-state'
      payload:
        | {
            nextState: 'waiting' | 'playing'
          }
        | {
            nextState: 'ended'
            winningTeam: GameTeam
          }
    }

export type ClientMessageType =
  | {
      type: 'admin/ready'
    }
  | {
      type: 'admin/reset'
    }
  | {
      type: 'pull'
      payload: {
        team: GameTeam
      }
    }

export default class GameServer implements Party.Server {
  static options = {
    hibernate: true,
  }

  score = 0
  gameState: GameState = 'waiting'
  lastWinner?: GameTeam

  constructor(private readonly room: Party.Room) {}

  async onStart() {
    this.score = (await this.room.storage.get('score')) ?? 0
    this.gameState = (await this.room.storage.get('gameState')) ?? 'waiting'
    this.lastWinner = await this.room.storage.get('lastWinner')
  }

  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    connection.send(this.score.toString())
  }

  onRequest(request: Party.Request): Response | Promise<Response> {
    if (request.method === 'GET') {
      return Response.json({
        gameState: this.gameState,
        score: this.score,
        lastWinner: this.lastWinner,
      })
    }

    return new Response(null, { status: 405 })
  }

  onMessage(rawMessage: string, sender: Party.Connection<unknown>) {
    const message = JSON.parse(rawMessage) as ClientMessageType

    switch (message.type) {
      case 'admin/ready': {
        this.startGame()
        break
      }

      case 'admin/reset': {
        this.resetGame()
        break
      }

      case 'pull': {
        this.handlePull(message.payload.team)
        break
      }
    }
  }

  private startGame(): void {
    if (this.gameState === 'playing') {
      return
    }

    this.gameState = 'playing'
    this.room.storage.put('gameState', this.gameState)

    this.room.broadcast(
      JSON.stringify({
        type: 'game-state',
        payload: {
          nextState: 'playing',
        },
      } satisfies ServerMessageType),
    )
  }

  private endGame(winningTeam: GameTeam): void {
    if (this.gameState === 'ended') {
      return
    }

    this.room.broadcast(
      JSON.stringify({
        type: 'game-state',
        payload: {
          nextState: 'ended',
          winningTeam,
        },
      } satisfies ServerMessageType),
    )

    this.gameState = 'ended'
    this.lastWinner = winningTeam
    this.room.storage.put('gameState', this.gameState)
    this.room.storage.put('lastWinner', this.lastWinner)
  }

  private resetGame(): void {
    this.gameState = 'waiting'
    this.score = 0
    this.lastWinner = undefined
    this.room.storage.put('gameState', this.gameState)
    this.room.storage.put('score', this.score)
    this.room.storage.put('lastWinner', undefined)

    this.room.broadcast(
      JSON.stringify({
        type: 'game-state',
        payload: {
          nextState: 'waiting',
        },
      } satisfies ServerMessageType),
    )
  }

  private handlePull(team: GameTeam): void {
    if (this.gameState !== 'playing') {
      return
    }

    const scoreDelta = team === 'team-left' ? -10 : 10
    this.score = Math.max(
      MIN_SCORE,
      Math.min(MAX_SCORE, this.score + scoreDelta),
    )

    this.room.broadcast(
      JSON.stringify({
        type: 'score',
        payload: {
          nextScore: this.score,
        },
      } satisfies ServerMessageType),
    )
    this.room.storage.put('score', this.score)

    const winningTeam =
      this.score === MIN_SCORE
        ? 'team-left'
        : this.score === MAX_SCORE
        ? 'team-right'
        : undefined

    if (winningTeam) {
      this.endGame(winningTeam)
    }
  }
}

GameServer satisfies Party.Worker
