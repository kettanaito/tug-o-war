import { DeferredPromise } from '@open-draft/deferred-promise'
import { Data, WebSocketServer } from 'ws'
import {
  ClientMessageType,
  GameState,
  GameTeam,
  MAX_SCORE,
  MIN_SCORE,
  ServerMessageType,
} from '~/messages.ts'

const COUNTDOWN_SECONDS = 3
const GAME_DURATION_MS = 15_000

export class Game {
  score = 0
  gameState: GameState = GameState.IDLE
  countdown = -1
  timeElapsed = 0
  lastWinner?: GameTeam

  private countdownTimer?: NodeJS.Timeout
  private gameTimer?: NodeJS.Timeout
  private gameEndTimer?: NodeJS.Timeout

  constructor(private readonly ws: WebSocketServer) {
    ws.addListener('connection', (ws) => {
      ws.addEventListener('message', (event) => {
        this.onMessage(event.data)
      })
    })
  }

  getState() {
    return {
      gameState: this.gameState,
      score: this.score,
      countdown: this.countdown,
      timeElapsed: this.timeElapsed,
      lastWinner: this.lastWinner,
    }
  }

  onMessage(rawMessage: Data) {
    if (typeof rawMessage !== 'string') {
      return
    }

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

  private broadcast(message: string) {
    this.ws.clients.forEach((client) => {
      client.send(message)
    })
  }

  private async startGame(): Promise<void> {
    if (this.gameState !== GameState.IDLE) {
      return
    }

    // Start and await the countdown for players.
    await this.startCountdown()

    // Broadcast the start of the game.
    this.gameState = GameState.PLAYING
    // this.room.storage.put('gameState', this.gameState)
    this.broadcast(
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
      // this.room.storage.put('timeElapsed', this.timeElapsed)
      this.broadcast(
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
    this.countdown = COUNTDOWN_SECONDS

    this.broadcast(
      JSON.stringify({
        type: 'time/countdown',
        payload: {
          countdown: this.countdown,
        },
      } satisfies ServerMessageType),
    )

    this.countdownTimer = setInterval(() => {
      this.countdown -= 1

      // Send the countdown state to the client.
      this.broadcast(
        JSON.stringify({
          type: 'time/countdown',
          payload: {
            countdown: this.countdown,
          },
        } satisfies ServerMessageType),
      )

      if (this.countdown === 0) {
        this.countdown = -1
        clearInterval(this.countdownTimer)
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
    this.countdown = -1
    this.lastWinner = undefined

    clearInterval(this.countdownTimer)
    clearInterval(this.gameTimer)
    clearTimeout(this.gameEndTimer)

    // this.room.storage.put('gameState', this.gameState)
    // this.room.storage.put('score', this.score)
    // this.room.storage.put('timeElapsed', this.timeElapsed)
    // this.room.storage.put('countdown', this.countdown)
    // this.room.storage.put('lastWinner', undefined)

    this.broadcast(
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

    this.broadcast(
      JSON.stringify({
        type: 'game/state-change',
        payload: {
          nextState: GameState.END,
          winningTeam,
        },
      } satisfies ServerMessageType),
    )

    this.gameState = GameState.END
    this.timeElapsed = 0
    this.lastWinner = winningTeam

    // this.room.storage.put('gameState', this.gameState)
    // this.room.storage.put('timeElapsed', 0)
    // this.room.storage.put('lastWinner', this.lastWinner)
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
    // this.room.storage.put('score', this.score)

    this.broadcast(
      JSON.stringify({
        type: 'game/score',
        payload: {
          nextScore: this.score,
        },
      } satisfies ServerMessageType),
    )

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
