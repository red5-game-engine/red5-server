namespace red5 {
  export function connect(url?: string): Server {
    return new Server(url)
  }

  export abstract class Connector {

    protected abstract onMessage(message: MessageEvent): void

    protected endpoint: string
    protected requestDisconnect: boolean = false
    protected connectionDropped: boolean = false
    protected events: EventEmitter[] = []
    protected allEvents: EventEmitterAll[] = []

    protected socket!: WebSocket

    public constructor(url?: string) {
      this.endpoint = url || 'ws://localhost:5555'
      this.connect()
    }

    public disconnect() {
      this.requestDisconnect = true
      this.socket.close()
    }

    public send(event: string, message?: any) {
      if (this.socket instanceof WebSocket) {
        this.socket.send(JSON.stringify({ event, message }))
      }
    }

    public on(event: PredefinedEvents, callback: (message?: any) => void): this
    public on(event: string, callback: (message?: any) => void): this
    public on(event: string, callback: (message?: any) => void): this {
      this.events.push({ event, callback })
      return this
    }

    public onAny(callback: (message?: any) => void) {
      this.allEvents.push({ callback })
    }

    protected connect() {
      this.socket = new WebSocket(this.endpoint)
      this.socket.addEventListener('open', this.onOpen.bind(this))
      this.socket.addEventListener('close', this.onClose.bind(this))
      this.socket.addEventListener('message', this.onMessage.bind(this))
    }

    private onOpen() {
      this.events.filter(e => e.event == 'connected').forEach(evt => evt.callback(evt.message))
    }

    private onClose() {
      if (!this.requestDisconnect) {
        this.events.filter(e => e.event == 'disconnected').forEach(evt => evt.callback(evt.message))
        setTimeout(() => this.connect(), 1000)
      }
    }
  }
}