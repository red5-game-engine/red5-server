import * as WebSocket from 'uws'
import { Server as WebSocketServer } from 'uws'
import * as http from 'http'
import { Client } from './Client'
import * as cp from 'child_process'
import { publicDecrypt } from 'crypto';
import * as getPort from 'get-port'

export interface GameType<T extends Game> {
  new(): T
}

export interface Game {
  init(): void
  shutdown(): void
  clientDisconnected(client: Client): void
}

export abstract class Game {

  protected abstract clientsReady(): void
  protected abstract joined(client: Client): void

  protected clients: Client[] = []
  protected startingClientCount: number
  private wss!: WebSocketServer

  public constructor() {
    this.startingClientCount = parseInt(process.argv[2])
  }

  public static async run<T extends Game>(game: GameType<T>) {
    let g = new game()
    await g.initialize()
    typeof g.init == 'function' && g.init()
    process.on('SIGINT', () => g.serverExit())
    return g
  }

  private serverExit() {
    this.clients.forEach(client => client.serverKilled())
  }

  public gameExit() {
    this.clients.forEach(client => client.gameOver())
    process.exit(0)
  }

  private async initialize() {
    if (process.send) {
      let port = await getPort()
      // if (err) return process.send({ event: 'no-port' })
      let server = http.createServer().listen(port)
      let address = server.address()
      address.address = address.address.replace(/^::$/, '127.0.0.1')
      this.wss = new WebSocketServer({ server })
      this.wss.on('connection', (ws) => {
        let client = new Client(ws)
        this.clients.push(client)
        this.joined(client)
        if (this.clients.length == this.startingClientCount) {
          this.clientsReady()
        }
        client.disconnected(() => {
          typeof this.clientDisconnected == 'function' && this.clientDisconnected(client)
        })
      })
      process.send({ event: 'game-created', message: { ip: address.address, port: address.port } })
      process.once('exit', () => {
        this.wss.close()
        typeof this.shutdown == 'function' && this.shutdown()
      })
    } else {
      process.exit()
    }
  }

}