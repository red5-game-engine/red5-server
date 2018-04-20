import { Client, ClientState } from '../Client'
import { Server } from '../Server'
import * as cp from 'child_process'
import { WaitList } from './WaitList'

export interface MatchMaker {
  clientLeft(client: Client): void
  clientJoined(client: Client): void
  autoStartClientCount: number
}

export enum MatchStyle {
  FirstComeFirstServer
}

export interface MatchMakerType<T extends MatchMaker> {
  new(server: Server, game: string): T
}

export abstract class MatchMaker {

  private server!: Server
  private readonly game: string

  public waitList: WaitList = new WaitList

  public constructor(server: Server, game: string) {
    this.server = server
    this.game = game
    this.waitList.eventEmitter.on('player-joined', (client: Client) => {
      if (typeof this.autoStartClientCount == 'number' && this.autoStartClientCount > 0) {
        if (this.waitList.clients.length >= this.autoStartClientCount) {
          this.start(this.waitList.get(this.autoStartClientCount))
        }
      }
    })
  }

  public get players() { return this.server.clients.filter(c => c.state == ClientState.Searching) }

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