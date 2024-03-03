import { Module } from '@nestjs/common';
import { WsGateway } from './websocket.provider';

@Module({
  imports: [],
  controllers: [],
  providers: [WsGateway],
  exports: [WsGateway],
})
export class WebsocketModule {}
