namespace red5 {
  export class GameServer extends Connector {
    protected onMessage(message: string) {
      let msg = JSON.parse(message) as MessageFromServer
      this.events.filter(e => e.event == msg.event).forEach(evt => evt.callback(evt.message))
      this.allEvents.forEach(item => item.callback(item.message))
    }
  }
}