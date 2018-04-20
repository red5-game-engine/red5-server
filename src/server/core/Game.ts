import * as WebSocket from 'uws'
import { Server as WebSocketServer } from 'uws'
import * as http from 'http'
import { Client } from './Client'
import { Team } from './Team'
import * as cp from 'child_process'
import { publicDecrypt } from 'crypto';
import * as getPort from 'get-port'

export interface GameType<T extends Game> {
  new(): T
}

export interface Game {
  init(): void
  clientDisconnected(client: Client): void
}

export abstract class Game {

  public abstract shutdown(): void
  public abstract clientsReady(): void

  protected teams: Team[] = []
  protected clients: Client[] = []
  protected startingClientCount: number
  private wss!: WebSocketServer

  public constructor() {
    this.startingClientCount = parseInt(process.argv[2])
  }

  public static async run<T extends Game>(game: GameType<T>) {
    let g = new game()
    await g['initialize']()
    g.init()
    return g
  }

  public gameExit() {
    this.clients.forEach(client => client.gameOver())
    process.exit(0)
  }

  protected createTeam(name: string, client?: Client) {
    let team = this.teams.find(t => t.name == name)
    if (!team) {
      team = new Team(name)
      this.teams.push(team)
    } else {
      client && team.join(client)
    }
    return team
  }

  protected joinTeam(team: Team, client: Client): boolean
  protected joinTeam(name: string, client: Client): boolean
  protected joinTeam(...args: any[]): boolean {
    let team = typeof args[0] == 'string' ? this.teams.find(t => t.name == args[0]) : args[0]
    let client: Client = args[1]
    if (team instanceof Team) {
      return team.join(client)
    }
    return false
  }

  protected leaveTeam(team: Team, client: Client): boolean
  protected leaveTeam(name: string, client: Client): boolean
  protected leaveTeam(...args: any[]): boolean {
    let team = typeof args[0] == 'string' ? this.teams.find(t => t.name == args[0]) : args[0]
    return team ? team.leave(args[1]) : false
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
        this.shutdown()
      })
    } else {
      process.exit()
    }
  }

}