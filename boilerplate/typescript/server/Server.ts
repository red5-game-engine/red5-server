import * as path from 'path'
import { Server } from 'red5'
import { GameMatchMaker } from './MatchMaker'

new Server({
  matchMaker: GameMatchMaker,
  game: path.join(__dirname, 'Red5Game'),
  socketType: 'websocket'
})