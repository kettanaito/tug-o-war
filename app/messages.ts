export const MIN_SCORE = -100
export const MAX_SCORE = 100

export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  END = 'END',
}

export type GameTeam = 'team-left' | 'team-right'

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
