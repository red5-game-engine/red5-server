## Multiplayer game server for node

Create multiplayer games that scale vertically and horizontally without all the fuss.

### What to expect from Red5

* Red5 is a server that runs game logic
* Red5 will manage multiple games based on a match maker service
* Red5 will manage all clients and place them within rooms
* Red5 will manage dropped connections allowing players to rejoin in-progress games
* Red5 does much more

### What not to expect from Red5

* Red5 is not a http server, so it will not provide request/response like express
* Red5 is not a renderer, so it will not render content on the clients screen

### Installation

```
npm install -g red5
red5 create my-new-game
```