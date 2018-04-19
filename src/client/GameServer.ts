namespace red5 {
  export class GameServer extends Connector {
    protected onMessage(message: MessageEvent) {
      let msg = JSON.parse(message.data.toString()) as MessageFromServer
      if (msg.event == 'game-over') this.disconnect()
      this.events.filter(e => e.event == msg.event).forEach(evt => evt.callback(evt.message))
      this.allEvents.forEach(item => item.callback(item.message))
    }
  }
}