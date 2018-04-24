import * as path from 'path'
import { Server } from 'red5'
import { Red5MatchMaker } from './MatchMaker'

/**
 * This is the entry point of the game server.
 *
 * It requires that "matchMaker", have a match making service attached to it,
 * "game" has a path to the game logic, and that "socketType" contains an
 * appropriate supported socket type (socket or websocket).
 *
 * When using "socket" as a type, a native JavaScript browser Websocket will not
 * work when trying to connect to the server but an http sockets will. This will
 * all you to connect to the socket without requiring a browser.
 *
 * When using "websocket" as a type, a native JavaScript browser Websocket will
 * work when trying to connect to the server but an http socket will not work.
 * This will allow you to connect to the server through a web browser.
 *
 * Using "both" as a type is not yet supported.
 */

new Server({
  matchMaker: Red5MatchMaker,
  game: path.join(__dirname, 'Red5Game'),
  socketType: 'websocket'
})