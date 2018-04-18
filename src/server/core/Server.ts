import { Server as WebSocketServer } from 'uws'
import { Client } from './Client'
import { Game, GameType } from './Game';
import { MatchMaker } from './MatchMaker';
import * as cluster from 'cluster'
import * as os from 'os'
import * as http from 'http'

export interface Red5Options {
  port?: number
  redis?: string
  workers?: number
}

export class Server {

  public readonly clients: Client[] = []
  private readonly matchMaker!: MatchMaker<Game>

  private settings: Red5Options = {
    port: 5555,
    redis: undefined,
    workers: -1
  }

  public constructor(matchMaker: MatchMaker<Game>, options?: Red5Options) {
    this.settings = Object.assign(this.settings, options)
    if (cluster.isMaster) {
      console.log(`Master ${process.pid} is running`)
      let clusterSize = typeof this.settings.workers === 'number' ? this.settings.workers : -1
      if (clusterSize == -1) clusterSize = os.cpus().length
      if (clusterSize > 0) {
        for (let i = 0; i < clusterSize; i++) {
          cluster.fork()
        }
        cluster.on('exit', (worker, code, signal) => console.log(`worker ${worker.process.pid} died`))
      } else {
        this.matchMaker = matchMaker
        this.initServer(options)
      }
    } else {
      console.log(`Worker ${process.pid} is running`)
      this.matchMaker = matchMaker
      this.initServer(options)
    }
  }

  private initServer(options?: Red5Options) {
    this.matchMaker['setServer'](this)

    let server = http.createServer((req, res) => { }).listen(this.settings.port)
    let wss = new WebSocketServer({ server })

    wss.on('connection', (ws) => {
      let client = new Client(ws)
      this.clients.push(client)
      this.matchMaker.clientJoined(client)
    })
  }
}