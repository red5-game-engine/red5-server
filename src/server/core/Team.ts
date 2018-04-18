import { Client } from './Client'
import * as uuid from 'uuid/v4'

export class Team {

  private clients: Client[] = []
  public readonly id: string = uuid()

  public get size(): number { return this.clients.length }

  public join(client: Client) {
    if (this.clients.includes(client)) {
      this.clients.push(client)
      return true
    }
    return false
  }

  public leave(client: Client) {
    let idx = this.clients.indexOf(client)
    idx > -1 && this.clients.splice(idx, 1)
    return idx > -1
  }

  public send(event: string, message?: any) {
    this.clients.forEach(client => client.send(event, message))
  }
}