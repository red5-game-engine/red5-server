import { GameTeam } from './Team'

export function Team(name: string) {
  return TeamManager.get(name)
}

export class TeamManager {

  public static teams: GameTeam[] = []

  public static create(name: string) {
    let team = new GameTeam(name)
    TeamManager.teams.push(team)
    return team
  }

  public static delete(name: string | number) {
    let idx = typeof name == 'number' ? name : this.teams.findIndex(t => t.name == name)
    idx > -1 && this.teams.splice(idx, 1)
  }

  public static get(name: string) {
    let t = this.teams.find(t => t.name == name)
    if (!t) t = TeamManager.create(name)
    return t
  }

  public static deleteEmpty() {
    let i = this.teams.length
    while (i--) {
      let team = this.teams[i]
      if (team.size == 0) {
        this.delete(i)
      }
    }
  }

}
