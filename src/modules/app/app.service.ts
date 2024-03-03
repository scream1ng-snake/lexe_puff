import { Injectable } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { SysRepository } from '../database/database.module';

@Injectable()
export class AppService implements OnModuleInit {
  name = 'recognition-server'
  version = '1.0.0'
  constructor(
    @InjectRepository(SysRepository) 
    private readonly sysRepo: SysRepository,
  ) {}
  async onModuleInit() {
    const currentSys = await this.sysRepo.findByName(this.name)
    if(!currentSys) await this.sysRepo.createSys({
      name: this.name, 
      version: this.version, 
      key: 'trial'
    })
  }
  /**
   * returns info about current system
   * @returns 
   */
  async info() {
    return await this.sysRepo.find()
  }
}
