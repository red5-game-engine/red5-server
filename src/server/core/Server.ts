import { Server as WebSocketServer } from 'uws'
import { Client } from './Client'
import { Game, GameType } from './Game';
import { MatchMaker } from './MatchMaker';
import { ChildProcess } from 'child_process';
// import * as cluster from 'cluster'
// import * as os from 'os'
import * as http from 'http'

export interface Red5Options {
  port?: number
  redis?: string
  workers?: number
}

export class Server {

  public readonly clients: Client[] = []
  public readonly workers: ChildProcess[] = []
  private readonly matchMaker!: MatchMaker
  public address!: { port: number, family: string, address: string }

  public readonly settings: Red5Options = {
    port: 5555,
    redis: undefined,
    workers: -1
  }

  public constructor(matchMaker: MatchMaker, options?: Red5Options) {
    this.settings = Object.assign(this.settings, options)
    this.matchMaker = matchMaker
    process.on('SIGINT', () => this.workers.forEach(worker => worker.kill('SIGINT')))
    this.initServer()
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
    this.matchMaker['setServer'](this)

    let server = http.createServer().listen(this.settings.port)
    this.address = server.address()
    this.address.address = this.address.address.replace(/^::$/, '127.0.0.1')
    let wss = new WebSocketServer({ server })

    wss.on('connection', (ws) => {
      if (ws.upgradeReq.url == '/') {
        let client = new Client(ws)
        this.clients.push(client)
        this.matchMaker.clientJoined(client)
        client.disconnected(() => {
          let idx = this.clients.indexOf(client)
          idx > -1 && this.clients.splice(idx, 1)
        })
      } else {
        if (typeof ws.upgradeReq.url == 'string') {
          // console.log('here')
          // let gameProcessId = parseInt(ws.upgradeReq.url.replace(/\//g, ''))
          // let gameProcess = this.workers.find(w => w.pid == gameProcessId)
          // if (gameProcess) {
          //   // gameProcess.
          // }
        }
      }
    })
  }
}