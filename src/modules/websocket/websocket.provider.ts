import { Logger } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import * as WS from 'ws';
import { 
  ConnectMessageType, 
  IncomingMessageType, 
  IncomingWsEvents, 
  UUID 
} from './websocket.types';


@WebSocketGateway({
  adapter: WsAdapter,
  cors: { origin: '*' },
})
export class WsGateway implements OnGatewayInit {
  public clients: Map<UUID, WS.WebSocket> = new Map()
  constructor() {}

  todo() {
    console.log('asdasdsadsdsdsnvjv dv fv fhv fv ')
  }

  /** подписки */
  subscriptions: Array<(msg: IncomingMessageType) => void> = []

  /** подписываемся на сообщения */
  subscribeOnMessage(callback: (msg: IncomingMessageType) => void) {
    this.subscriptions.push(callback);
  }

  @WebSocketServer()
  server: WS.Server;

  afterInit(server: WS.WebSocketServer) {
    server.on('connection', (ws: WS.WebSocket) => {
      Logger.log('ws connected', 'WsGateway-handleConnection')
      ws.on('message', async ev => {
        const message = JSON.parse(ev.toString()) as IncomingMessageType
        if(Object.keys(IncomingWsEvents).includes(message.type)) {
          for (const listener of this.subscriptions) {
            listener(message)
          }
          if(message.type === IncomingWsEvents.CONNECT) {
            const msg = message as ConnectMessageType
            this.clients.set(msg.clientID, ws)
          }
          Logger.log(message, '[Socket] сообщение ')
        } else {
          ws.send(JSON.stringify({
            status: 'error',
            message: `Неизвестная команда - ${message.type}`,
          }));
        }
      });

      ws.on('close', (code, reason) => {
        for (let [key, value] of this.clients.entries()) {
          if (value === ws) {
            this.clients.delete(key)
            Logger.log(key + ' ws disconnected - ' + reason.toString(), 'WsGateway-handleDisconnect')
          }
        }
      })

      ws.on('error', err => {
        ws.send(
          JSON.stringify({
            status: 'error',
            message: err.message,
          }),
        );
      });
    });
  }
}
