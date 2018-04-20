import { Client } from '../..'
import { EventEmitter } from 'events';

export class WaitList {

  public readonly clients: Client[] = []
  public readonly eventEmitter: EventEmitter = new EventEmitter

  public get length() { return this.clients.length }

  public add(...clients: Client[]) {
    clients.forEach(client => {
      if (!this.clients.includes(client)) {
        this.clients.push(client)
        this.eventEmitter.emit('player-joined', client)
      }
    })
  }

  public get(count: number) {
    return this.clients.splice(0, count)
  }

  public remove(...clients: Client[]) {
    let removed: Client[] = []
    clients.forEach(client => {
      let idx = this.clients.indexOf(client)
      if (idx > -1) removed.push(...this.clients.splice(idx, 1))
    })
    return removed
  }

  public find(callback: (item: Client, idx: number, array: Client[]) => any, limit: number = 0) {
    let clients = this.clients.filter(callback)
    if (limit > 0) clients = clients.splice(0, limit)
    return this.remove(...clients)
  }

}