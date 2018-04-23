import { Client } from '../../..'
import * as uuid from 'uuid/v4'

export class GameTeam {

  public readonly id: string = uuid()
  public readonly name: string

  public get size(): number { return this.clients.length }

  private clients: Client[] = []

  public constructor(name: string) {
    this.name = name
  }

  public join(client: Client) {
    if (!this.clients.includes(client)) {
      this.clients.push(client)
      return true
    }
    return false
  }

  public leave(name: string, client: Client) {
    let idx = this.clients.indexOf(client)
    idx > -1 && this.clients.splice(idx, 1)
    return idx > -1
  }

  public send(event: string, message?: any) {
    this.clients.forEach(client => client.send(event, message))
  }
}