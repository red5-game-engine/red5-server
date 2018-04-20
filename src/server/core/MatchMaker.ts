import { Client, ClientState } from './Client'
import { Server } from './Server'
import { GameType, Game } from '..'
import * as cp from 'child_process'

export interface MatchMaker {
  clientLeft(client: Client): void
}

export enum MatchStyle {
  FirstComeFirstServer
}

export interface MatchMakerType<T extends MatchMaker> {
  new(game: string)
}

export abstract class MatchMaker {

  private server!: Server
  private readonly game: string

  // public abstract matchStyle: MatchStyle
  // public abstract minClients: number
  // public abstract maxClients: number

  public constructor(game: string) {
    this.game = game
  }

  public get players() { return this.server.clients.filter(c => c.state == ClientState.Searching) }

  public abstract clientJoined(client: Client): void

  private setServer(server: Server) {
    this.server = server
  }

  public start(clients: Client[]) {
    let fork = cp.fork(this.game, [clients.length.toString()], { silent: true })
    // this.server.workers.push(fork)
    console.log('created new game fork')
    let startAttempts = 0
    fork.on('message', (message) => {
      if (message.event == 'game-created') {
        let ip = message.message.ip
        let port = message.message.port
        clients.forEach(client => client.send('joined', { ip, port }))
      } else if (message.event == 'no-port') {
        fork.kill('SIGINT')
        if (startAttempts < 3) {
          this.start(clients)
        } else {
          // TODO: Handle too many start attempts
        }
        startAttempts++
      } else {
        console.log(message)
      }
    }).on('exit', () => {
      console.log('exit game fork')
      // let forkIdx = this.server.workers.indexOf(fork)
      // forkIdx > -1 && this.server.workers.splice(forkIdx, 1)
    })
  }

}