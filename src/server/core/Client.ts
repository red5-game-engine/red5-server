import * as WebSocket from 'uws'
import * as EventEmitter from 'events'
import * as uuid from 'uuid/v4'

interface ClientMessage {
  event: string
  message: any
}

export enum ClientState {
  Searching, Playing, Idle
}

export class Client {

  private readonly client: WebSocket
  private readonly eventEmitter: EventEmitter
  public readonly id: string = uuid()

  public state: ClientState = ClientState.Idle

  public constructor(client: WebSocket) {
    this.client = client
    this.eventEmitter = new EventEmitter()
    client.on('message', (message: string) => {
      try {
        let msg = JSON.parse(message) as ClientMessage
        if (!msg.event) throw new Error('No event specified')
        this.eventEmitter.emit(msg.event, msg.message)
      } catch (e) {
        this.eventEmitter.emit('error', message)
      }
    })
    client.on('close', () => this.eventEmitter.emit('disconnected'))
  }

  public send(event: string, message?: any) {
    this.client.send(JSON.stringify({ event, message }))
  }

  public on(event: string, callback: (...args: any[]) => void) {
    this.eventEmitter.on(event, callback)
  }

  public once(event: string, callback: (...args: any[]) => void) {
    this.eventEmitter.once(event, callback)
  }

  public disconnected(callback: (socket: WebSocket) => void) {
    this.eventEmitter.on('disconnected', callback)
  }

  public error(callback: (...args: any[]) => void) {
    this.eventEmitter.on('error', callback)
  }

  public gameOver() {
    this.send('game-over')
    this.client.close()
  }

}