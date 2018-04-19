interface Red5Options {
  host: string
}

interface MessageFromServer {
  event: string
  message?: any
}

interface EventEmitter {
  event: string
  message?: any
  callback(message?: any): void
}

interface EventEmitterAll {
  message?: any
  callback(message?: any): void
}

type PredefinedEvents = 'connected' | 'disconnected'

namespace red5 {
  export interface JoinEmitter {
    callback(game: GameServer): void
  }

  export class Server extends Connector {

    protected joinEvents: JoinEmitter[] = []

    protected onMessage(message: string) {
      let msg = JSON.parse(message) as MessageFromServer
      if (msg.event == 'joined') {
        let ip = msg.message.ip as string
        let port = msg.message.port as number
        let server = new GameServer(`ws://${ip}:${port}`)
        this.joinEvents.forEach(evt => evt.callback(server))
      }
    }

    public joined(callback: (game: GameServer) => void) {
      this.joinEvents.push({ callback })
    }
  }
}