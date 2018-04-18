import { Client } from './Client'
import { Team } from './Team';

export interface GameType<T extends Game> {
  new(): T
}

export abstract class Game {

  protected teams: Team[] = []

  // public abstract started(): void

  // public constructor() {
  //   this.started()
  // }

  protected createTeam() {
    let team = new Team
    this.teams.push(team)
    return team
  }

  protected joinTeam(teamId: string, client: Client) {
    let team = this.teams.find(t => t.id == teamId) as Team
    team.join(client)
    return team
  }

  protected leaveTeam(teamId: string, client: Client) {
    let team = this.teams.find(t => t.id == teamId)
    return team ? team.leave(client) : false
  }

}