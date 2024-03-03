import { Injectable } from '@nestjs/common';
import { WsGateway } from '../websocket/websocket.provider';

@Injectable()
export class YandexOCR_Service {
  constructor(
    private wsGateway: WsGateway, 
  ) {}
}
