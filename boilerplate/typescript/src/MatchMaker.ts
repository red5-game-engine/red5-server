import { AutoMatchMaker } from 'red5'

/**
 * AutoMatchMaker
 *
 * The auto match maker will automatically generate matches as connections
 * are added to the wait list queue and meet particular requirements.
 */

export class Red5MatchMaker extends AutoMatchMaker {

  // This game will start when 2 connections are added to the wait list queue.
  // As connections get added new games will get created.
  public autoStartCount = 2

}