import * as WebSocket from 'uws'
import * as EventEmitter from 'events'
import * as uuid from 'uuid/v4'
import { Socket } from 'net';

interface ClientMessage {
  event: string
  message: any
}

export enum ClientState {
  Searching, Playing, Idle
}

export class Client {

  private readonly client: WebSocket | Socket
  private readonly eventEmitter: EventEmitter
  public readonly id: string = uuid()

  public state: ClientState = ClientState.Idle

  public constructor(client: WebSocket | Socket) {
    this.client = client
    this.eventEmitter = new EventEmitter()
    if (client instanceof Socket) {
      client.on('data', (data) => this.getMessage(data, client))
    } else {
      client.on('message', (message: string) => this.getMessage(message, client))
    }
    client.on('close', () => this.eventEmitter.emit('disconnected'))
  }

  public send(event: string, message?: any) {
    if (this.client instanceof Socket) {
      this.client.write(JSON.stringify({ event, message }))
    } else {
      this.client.send(JSON.stringify({ event, message }))
    }
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
    if (this.client instanceof Socket) {
      this.client.end()
    } else {
      this.client.close()
    }
  }

  private getMessage(message: string | Buffer, client: WebSocket | Socket) {
    try {
      let msg = JSON.parse(message.toString()) as ClientMessage
      if (!msg.event) throw new Error('No event specified')
      this.eventEmitter.emit(msg.event, msg.message)
    } catch (e) {
      console.error(e.stack)
      this.eventEmitter.emit('error', message)
    }
  }

}