import { Client, ClientState } from './Client'
import { Server } from './Server';
import { GameType, Game } from '..';

export interface MatchMaker<T extends Game> {
  clientLeft(client: Client): void
}

export enum MatchStyle {
  FirstComeFirstServer
}

export abstract class MatchMaker<T extends Game> {

  private server!: Server

  public abstract matchStyle: MatchStyle
  public abstract minClients: number
  public abstract maxClients: number

  public constructor(game: GameType<T>) {

  }

  public get players() { return this.server.clients.filter(c => c.state == ClientState.Searching) }

  public abstract clientJoined(client: Client): void

  private setServer(server: Server) {
    this.server = server
  }

}