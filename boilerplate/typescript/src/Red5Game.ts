import { Game, Client } from 'red5'

/**
 * Red5Game
 *
 * This is where the game logic starts. As like any other node module,
 * the logic should be split up into multiple files not everything needs
 * to run in this one file.
 *
 * The name of the class can be anything it doesn't have to be "Red5Game".
 * You can change the name to any appropriate value such as "ConnectFour" as
 * long as you also modify "Game.run(Red5Game)" to "Game.run(ConnectFour)" at
 * the bottom of the file.
 */

export class Red5Game extends Game {
  // Called when all the clients have joined to the game.
  // At this point we can start running the game logic, any sooner
  // and we may have missing clients and/or data.
  public clientsReady() {

  }

  // Called when a single client has joined to the game.
  // Here we can assign clients to teams, initialize client data, etc.
  public joined(client: Client) {

  }
}

Game.run(Red5Game)