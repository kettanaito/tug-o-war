import type * as Party from 'partykit/server'
import { DeferredPromise } from '@open-draft/deferred-promise'

const MIN_SCORE = -100
const MAX_SCORE = 100

export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  END = 'END',
}

export type GameTeam = 'team-left' | 'team-right'
const COUNTDOWN_SECONDS = 3
const GAME_DURATION_MS = 15_000

export type ServerMessageType =
  | {
      type: 'game/score'
      payload: {
        nextScore: number
      }
    }
  | {
      type: 'game/state-change'
      payload:
        | {
            nextState: GameState.IDLE | GameState.PLAYING
          }
        | {
            nextState: GameState.END
            winningTeam: GameTeam | undefined
          }
    }
  | {
      type: 'time/elapsed'
      payload: {
        timeElapsed: number
      }
    }
  | {
      type: 'time/countdown'
      payload: {
        countdown: number
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
  gameState: GameState = GameState.IDLE
  countdown = COUNTDOWN_SECONDS
  timeElapsed = 0
  lastWinner?: GameTeam

  private gameTimer?: NodeJS.Timeout
  private gameEndTimer?: NodeJS.Timeout

  constructor(private readonly room: Party.Room) {}

  async onStart() {
    this.score = (await this.room.storage.get('score')) ?? 0
    this.gameState =
      (await this.room.storage.get('gameState')) ?? GameState.IDLE
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

  private async startGame(): Promise<void> {
    if (this.gameState !== GameState.IDLE) {
      return
    }

    // Start and await the countdown for players.
    await this.startCountdown()

    // Broadcast the start of the game.
    this.gameState = GameState.PLAYING
    this.room.storage.put('gameState', this.gameState)
    this.room.broadcast(
      JSON.stringify({
        type: 'game/state-change',
        payload: {
          nextState: GameState.PLAYING,
        },
      } satisfies ServerMessageType),
    )

    // Broadcast the elapsed game time.
    this.gameTimer = setInterval(() => {
      this.timeElapsed += 1
      this.room.storage.put('timeElapsed', this.timeElapsed)
      this.room.broadcast(
        JSON.stringify({
          type: 'time/elapsed',
          payload: {
            timeElapsed: this.timeElapsed,
          },
        } satisfies ServerMessageType),
      )
    }, 1_000)

    // Forcefully end the game after a timeout.
    this.gameEndTimer = setTimeout(() => {
      this.endGame()
    }, GAME_DURATION_MS)
  }

  private startCountdown(): Promise<void> {
    const countdownPromise = new DeferredPromise<void>()

    this.room.broadcast(
      JSON.stringify({
        type: 'time/countdown',
        payload: {
          countdown: this.countdown,
        },
      } satisfies ServerMessageType),
    )

    const countdownTimer = setInterval(() => {
      this.countdown -= 1

      // Send the countdown state to the client.
      this.room.broadcast(
        JSON.stringify({
          type: 'time/countdown',
          payload: {
            countdown: this.countdown,
          },
        } satisfies ServerMessageType),
      )

      if (this.countdown === 0) {
        this.countdown = COUNTDOWN_SECONDS
        clearInterval(countdownTimer)
        countdownPromise.resolve()
        return
      }
    }, 1_000)

    return countdownPromise
  }

  private resetGame(): void {
    this.gameState = GameState.IDLE
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
        type: 'game/state-change',
        payload: {
          nextState: GameState.IDLE,
        },
      } satisfies ServerMessageType),
    )
  }

  private endGame(): void {
    if (this.gameState === GameState.END) {
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
        type: 'game/state-change',
        payload: {
          nextState: GameState.END,
          winningTeam,
        },
      } satisfies ServerMessageType),
    )

    this.gameState = GameState.END
    this.lastWinner = winningTeam

    this.room.storage.put('gameState', this.gameState)
    this.room.storage.put('timeElapsed', 0)
    this.room.storage.put('lastWinner', this.lastWinner)
  }

  private handlePull(team: GameTeam): void {
    if (this.gameState !== GameState.PLAYING) {
      return
    }

    const scoreDelta = team === 'team-left' ? -10 : 10
    this.score = Math.max(
      MIN_SCORE,
      Math.min(MAX_SCORE, this.score + scoreDelta),
    )

    this.room.broadcast(
      JSON.stringify({
        type: 'game/score',
        payload: {
          nextScore: this.score,
        },
      } satisfies ServerMessageType),
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
