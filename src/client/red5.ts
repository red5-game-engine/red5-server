interface Red5Options {
  host: string
}

interface MessageFromServer {
  event: string
  message?: any
}

interface EventEmitter {
  event: string
  message?: any
  callback(message?: any): void
}

interface EventEmitterAll {
  message?: any
  callback(message?: any): void
}

class red5 {

  private socket!: WebSocket
  private endpoint: string
  private connectionDropped: boolean = false
  private requestDisconnect: boolean = false
  private events: EventEmitter[] = []
  private allEvents: EventEmitterAll[] = []

  public static connect(url: string) {
    return new red5(url)
  }

  private constructor(url: string) {
    this.endpoint = url
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

  public on(event: 'connected' | 'disconnected', callback: (message?: any) => void): this
  public on(event: string, callback: (message?: any) => void): this
  public on(event: string, callback: (message?: any) => void): this {
    this.events.push({ event, callback })
    return this
  }

  public onAny(callback: (message?: any) => void) {
    this.allEvents.push({ callback })
  }

  private onMessage(message: string) {
    let msg = JSON.parse(message) as MessageFromServer
    this.events.filter(e => e.event == msg.event).forEach(item => item.callback(item.message))
    this.allEvents.forEach(item => item.callback(item.message))
  }

  private onOpen() {
    this.events.filter(e => e.event == 'connected').forEach(item => item.callback(item.message))
  }

  private onClose() {
    if (!this.requestDisconnect) {
      this.events.filter(e => e.event == 'disconnected').forEach(item => item.callback(item.message))
      setTimeout(() => this.connect(), 1000)
    }
  }

  private connect() {
    this.socket = new WebSocket(this.endpoint)
    this.socket.addEventListener('open', this.onOpen.bind(this))
    this.socket.addEventListener('close', this.onClose.bind(this))
    this.socket.addEventListener('message', this.onMessage.bind(this))
  }
}