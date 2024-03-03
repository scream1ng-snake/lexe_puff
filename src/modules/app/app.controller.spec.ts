import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('info', () => {
    // it('should return info about current system', () => {
    //   const info = {
    //     ...config,
    //     pid: process.pid 
    //   }
    //   const appController = app.get(AppController);
    //   expect(appController.info()).toBe(info);
    // });
  });
});
