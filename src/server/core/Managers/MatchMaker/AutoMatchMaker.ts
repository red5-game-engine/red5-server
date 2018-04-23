import { MatchMaker } from '.'
import { Server, Client } from '../../..'

export interface AutoMatchMaker {
  autoStartCount: number
  minClients: number
  maxClients: number
}

export abstract class AutoMatchMaker extends MatchMaker {

  public constructor(server: Server, game: string) {
    super(server, game)
    this.queue.on('added', (client: Client) => {
      if (this.autoStartCount && this.autoStartCount > 0 && this.queue.length >= this.autoStartCount) {
        this.start(this.queue.get(this.autoStartCount))
      }
    })
  }

}