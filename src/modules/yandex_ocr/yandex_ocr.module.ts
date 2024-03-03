import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { WebsocketModule } from "../websocket/websocket.module";
import { YandexOCR_Service } from "./yandex_ocr.service";

@Module({
  imports: [WebsocketModule, DatabaseModule],
  controllers: [],
  providers: [YandexOCR_Service],
  exports: [YandexOCR_Service],
})
export class YandexOCR {}