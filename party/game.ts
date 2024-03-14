import type * as Party from 'partykit/server'

const MIN_SCORE = -100
const MAX_SCORE = 100

export type GameTeam = 'team-left' | 'team-right'
export type GameState = 'waiting' | 'playing' | 'ended'
const GAME_DURATION_MS = 15_000

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
            winningTeam: GameTeam | undefined
          }
    }
  | {
      type: 'game-time'
      payload: {
        timeElapsed: number
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
  timeElapsed = 0
  lastWinner?: GameTeam

  private gameTimer?: NodeJS.Timeout
  private gameEndTimer?: NodeJS.Timeout

  constructor(private readonly room: Party.Room) {}

  async onStart() {
    this.score = (await this.room.storage.get('score')) ?? 0
    this.gameState = (await this.room.storage.get('gameState')) ?? 'waiting'
    this.timeElapsed = (await this.room.storage.get('timeElapsed')) ?? 0
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
        timeElapsed: this.timeElapsed,
        lastWinner: this.lastWinner,
      })
    }

    return new Response(null, { status: 405 })
  }

  onMessage(rawMessage: string, sender: Party.Connection<unknown>) {
    const message = JSON.parse(rawMessage) as ClientMessageType

    console.log('[server] incoming:', message)

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

    // Broadcast the time elapsed every second.
    this.gameTimer = setInterval(() => {
      this.timeElapsed += 1

      this.room.storage.put('timeElapsed', this.timeElapsed)
      this.room.broadcast(
        JSON.stringify({
          type: 'game-time',
          payload: {
            timeElapsed: this.timeElapsed,
          },
        } satisfies ServerMessageType)
      )
    }, 1_000)

    // End the game if it hasn't ended in X seconds.
    this.gameEndTimer = setTimeout(() => {
      this.endGame()
    }, GAME_DURATION_MS)

    this.room.broadcast(
      JSON.stringify({
        type: 'game-state',
        payload: {
          nextState: 'playing',
        },
      } satisfies ServerMessageType)
    )
  }

  private resetGame(): void {
    this.gameState = 'waiting'
    this.score = 0
    this.timeElapsed = 0

    clearInterval(this.gameTimer)
    clearTimeout(this.gameEndTimer)

    this.lastWinner = undefined
    this.room.storage.put('gameState', this.gameState)
    this.room.storage.put('score', this.score)
    this.room.storage.put('timeElapsed', this.timeElapsed)
    this.room.storage.put('lastWinner', undefined)

    this.room.broadcast(
      JSON.stringify({
        type: 'game-state',
        payload: {
          nextState: 'waiting',
        },
      } satisfies ServerMessageType)
    )
  }

  private endGame(): void {
    if (this.gameState === 'ended') {
      return
    }

    if (this.gameTimer) {
      clearInterval(this.gameTimer)
      this.gameTimer = undefined
    }

    // If the winner was determined before the
    // maximum game duration, clear the game end timer.
    if (this.gameEndTimer) {
      clearTimeout(this.gameEndTimer)
      this.gameEndTimer = undefined
    }

    // Determine the winner.
    const winningTeam = this.getWinner()

    this.room.broadcast(
      JSON.stringify({
        type: 'game-state',
        payload: {
          nextState: 'ended',
          winningTeam,
        },
      } satisfies ServerMessageType)
    )

    this.gameState = 'ended'
    this.lastWinner = winningTeam

    this.room.storage.put('gameState', this.gameState)
    this.room.storage.put('timeElapsed', 0)
    this.room.storage.put('lastWinner', this.lastWinner)
  }

  private handlePull(team: GameTeam): void {
    console.log('[server] handlePull', team, this.gameState)

    if (this.gameState !== 'playing') {
      return
    }

    const scoreDelta = team === 'team-left' ? -10 : 10
    this.score = Math.max(
      MIN_SCORE,
      Math.min(MAX_SCORE, this.score + scoreDelta)
    )

    this.room.broadcast(
      JSON.stringify({
        type: 'score',
        payload: {
          nextScore: this.score,
        },
      } satisfies ServerMessageType)
    )
    this.room.storage.put('score', this.score)

    if (this.getEarlyWinner()) {
      this.endGame()
    }
  }

  private getEarlyWinner(): GameTeam | undefined {
    return this.score === MIN_SCORE
      ? 'team-left'
      : this.score === MAX_SCORE
      ? 'team-right'
      : undefined
  }

  private getWinner(): GameTeam | undefined {
    if (this.score > 0) {
      return 'team-right'
    }

    if (this.score < 0) {
      return 'team-left'
    }
  }
}

GameServer satisfies Party.Worker
