import * as WebSocket from 'uws'
import { Server as WebSocketServer } from 'uws'
import { Client } from './Client'
import { MatchMaker, MatchMakerType } from './MatchMaker';
import * as http from 'http'
import * as net from 'net'
import { Socket } from 'net';

export interface Red5Options {
  port?: number
  redis?: string
  workers?: number
  type: 'socket' | 'websocket' | 'both'
  matchMaker: MatchMakerType<MatchMaker>
  game: string
}

export class Server {

  public readonly clients: Client[] = []
  // public readonly workers: ChildProcess[] = []
  private readonly matchMaker!: MatchMaker
  public address!: { port: number, family: string, address: string }

  public readonly settings: Red5Options
  public readonly ps: Partial<Red5Options> = {
    port: 5555,
    workers: -1,
    game: undefined,
    type: undefined,
    redis: undefined,
    matchMaker: undefined
  }

  public constructor(options: Red5Options) {
    this.settings = Object.assign(this.ps, options) as Red5Options
    this.matchMaker = new this.settings.matchMaker(this, this.settings.game)
    this.initServer()
    // process.on('SIGINT', () => this.workers.forEach(worker => worker.kill('SIGINT')))
  }

  // public startServer() {
  //   if (cluster.isMaster) {
  //     console.log(`Master ${process.pid} is running`)
  //     let clusterSize = typeof this.settings.workers === 'number' ? this.settings.workers : -1
  //     if (clusterSize == -1) clusterSize = os.cpus().length
  //     if (clusterSize > 0) {
  //       for (let i = 0; i < clusterSize; i++) {
  //         this.workers.push(cluster.fork())
  //       }
  //       cluster.on('exit', (worker, code, signal) => {
  //         if (signal == 'SIGINT') {
  //           console.log(`Worker ${worker.process.pid} shutdown`)
  //         } else {
  //           console.log(`Worker ${worker.process.pid} died. Restarting...`)
  //           let idx = this.workers.indexOf(worker)
  //           idx > -1 && this.workers.splice(idx, 1)
  //           this.workers.push(cluster.fork())
  //         }
  //       })
  //       // Kill the workers
  //       process.on('SIGINT', () => this.workers.forEach(worker => worker.kill('SIGINT')))
  //     } else {
  //       this.initServer()
  //     }
  //   } else {
  //     console.log(`Worker ${process.pid} is running`)
  //     this.initServer()
  //   }
  // }

  private initServer() {
    if (this.settings.type == 'socket') {
      let server = new net.Server().listen(this.settings.port)
      this.getServerAddress(server)
      server.on('connection', (sock) => this.initClient(sock))
    } else {
      let server = http.createServer().listen(this.settings.port)
      let wss = new WebSocketServer({ server })
      this.getServerAddress(server)
      wss.on('connection', (sock) => this.initClient(sock))
    }
  }

  private initClient(sock: WebSocket | Socket) {
    let client = new Client(sock)
    this.clients.push(client)
    client.on('match', () => {
      this.matchMaker.waitList.add(client)
      // this.matchMaker.clientJoined(client)
    })
    client.disconnected(() => {
      let idx = this.clients.indexOf(client)
      idx > -1 && this.clients.splice(idx, 1)
    })
  }

  private getServerAddress(server: net.Server | http.Server) {
    this.address = server.address()
    this.address.address = this.address.address.replace(/^::$/, '127.0.0.1')
  }
}