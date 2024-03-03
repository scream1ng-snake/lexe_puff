import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configGetter } from '../../configuration/configuration.loader';
import { DatabaseModule } from '../database/database.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { YandexOCR } from '../yandex_ocr/yandex_ocr.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    WebsocketModule,
    ConfigModule.forRoot({ load: [configGetter] }),
    DatabaseModule,
    YandexOCR
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
